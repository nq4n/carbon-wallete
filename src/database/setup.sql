-- PostgreSQL / Supabase schema for "Carbon Wallet" app
-- Run in Supabase SQL editor. Assumes auth.users exists.

----------------------------
-- 0) Extensions
----------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

----------------------------
-- 1) Helper enums
----------------------------
do $$ begin
  create type user_kind as enum ('student','employee');
exception when duplicate_object then null; end $$;

do $$ begin
  create type activity_kind as enum ('transport','energy','waste','water','awareness','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type txn_kind as enum ('earn','spend','adjust');
exception when duplicate_object then null; end $$;

do $$ begin
  create type reward_category as enum ('food','books','merch','services','events','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('pending','approved','rejected','fulfilled','cancelled');
exception when duplicate_object then null; end $$;

----------------------------
-- 2) Users / profiles
----------------------------
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  user_type user_kind not null,
  university_id text not null unique,
  department text not null,
  points integer not null default 0,
  avatar_url text,
  level text not null default 'مبتدئ',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_email_idx on public.user_profiles (email);

create or replace function public.touch_user_profiles()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_touch_user_profiles on public.user_profiles;
create trigger trg_touch_user_profiles
before update on public.user_profiles
for each row execute function public.touch_user_profiles();

----------------------------
-- 3) Key-Value store (for server utilities)
----------------------------
create table if not exists public.kv_store_a0e39776 (
  key text primary key,
  value jsonb not null
);

----------------------------
-- 4) Activities and points ledger
----------------------------
create table if not exists public.activity_catalog (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,                  -- e.g., 'bus', 'walking', 'lights_off'
  name text not null,                         -- display name
  kind activity_kind not null,                -- transport / energy / waste / ...
  carbon_factor numeric(10,4) not null default 0, -- kg CO2e per unit (negative = saved)
  unit text not null default 'unit',          -- e.g., 'trip','kWh','item'
  points_per_unit int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  kind activity_kind not null,
  catalog_id uuid references public.activity_catalog(id),
  description text,
  location text,
  amount numeric(12,4) not null default 1,
  unit text,
  carbon_factor numeric(10,4),               -- snapshot from catalog or QR
  carbon_saved_kg numeric(12,4) generated always as (coalesce(-1 * amount * coalesce(carbon_factor,0),0)) stored,
  points_earned int not null default 0,
  verified boolean not null default false,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_user_created_idx on public.activity_logs (user_id, created_at desc);

-- Points transactions (authoritative)
create table if not exists public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  kind txn_kind not null,                    -- earn/spend/adjust
  source text not null,                      -- 'activity', 'quiz', 'admin', 'reward'
  ref_id uuid,                               -- links to activity_logs.id or orders.id etc.
  points int not null,                       -- positive for earn, negative for spend
  note text,
  created_at timestamptz not null default now()
);

create index if not exists points_ledger_user_created_idx on public.points_ledger (user_id, created_at desc);

-- Keep user_profiles.points in sync (materialized from ledger)
create or replace function public.recalc_user_points(p_user uuid)
returns void language sql as $$
  update public.user_profiles u
  set points = coalesce((select sum(points) from public.points_ledger pl where pl.user_id = p_user),0)
  where u.id = p_user;
$$;

create or replace function public.points_ledger_after_change()
returns trigger language plpgsql as $$
begin
  perform public.recalc_user_points(coalesce(new.user_id, old.user_id));
  return null;
end $$;

drop trigger if exists trg_points_ledger_after_ins on public.points_ledger;
drop trigger if exists trg_points_ledger_after_upd on public.points_ledger;
drop trigger if exists trg_points_ledger_after_del on public.points_ledger;

create trigger trg_points_ledger_after_ins after insert on public.points_ledger
for each row execute function public.points_ledger_after_change();

create trigger trg_points_ledger_after_upd after update on public.points_ledger
for each row execute function public.points_ledger_after_change();

create trigger trg_points_ledger_after_del after delete on public.points_ledger
for each row execute function public.points_ledger_after_change();

----------------------------
-- 5) Rewards and orders
----------------------------
create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  points_cost int not null check (points_cost >= 0),
  category reward_category not null default 'other',
  available boolean not null default true,
  stock int,                                 -- null means unlimited
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.reward_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  reward_id uuid not null references public.rewards(id),
  status order_status not null default 'pending',
  points_spent int not null default 0,
  delivery_method text,                      -- 'pickup','delivery'
  delivery_address text,
  delivery_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reward_orders_user_created_idx on public.reward_orders (user_id, created_at desc);

create or replace function public.touch_reward_orders()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_touch_reward_orders on public.reward_orders;
create trigger trg_touch_reward_orders
before update on public.reward_orders
for each row execute function public.touch_reward_orders();

----------------------------
-- 6) Quizzes / achievements
----------------------------
create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  quiz_title text not null,
  score int not null,
  total_questions int not null,
  points_earned int not null default 0,
  time_taken_seconds int,
  created_at timestamptz not null default now()
);

create index if not exists quiz_results_user_created_idx on public.quiz_results (user_id, created_at desc);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,                 -- e.g., 'first_activity','100kg_saved'
  name text not null,
  description text,
  icon text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_badges (
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

----------------------------
-- 7) Goals / targets
----------------------------
create table if not exists public.carbon_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  title text not null,
  target_carbon_saved_kg numeric(12,2) not null,
  deadline date,
  progress_carbon_saved_kg numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_carbon_goals()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_touch_carbon_goals on public.carbon_goals;
create trigger trg_touch_carbon_goals
before update on public.carbon_goals
for each row execute function public.touch_carbon_goals();

----------------------------
-- 8) Notifications (optional)
----------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx on public.notifications (user_id, created_at desc);

----------------------------
-- 9) Derived views
----------------------------
create or replace view public.v_user_carbon_summary as
select
  u.id as user_id,
  u.name,
  u.email,
  u.points,
  coalesce(sum(al.carbon_saved_kg),0) as total_carbon_saved_kg,
  coalesce(sum(al.points_earned),0) as total_points_from_activities,
  count(al.id) as activities_count
from public.user_profiles u
left join public.activity_logs al on al.user_id = u.id
group by u.id, u.name, u.email, u.points;

----------------------------
-- 10) RLS
----------------------------
alter table public.user_profiles enable row level security;
alter table public.kv_store_a0e39776 enable row level security;
alter table public.activity_catalog enable row level security;
alter table public.activity_logs enable row level security;
alter table public.points_ledger enable row level security;
alter table public.rewards enable row level security;
alter table public.reward_orders enable row level security;
alter table public.quiz_results enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.carbon_goals enable row level security;
alter table public.notifications enable row level security;

-- Helpers for auth
create or replace function public.uid() returns uuid language sql stable as $$
  select coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
$$;

-- Profiles: user can see/update own row
drop policy if exists "profiles_select_self" on public.user_profiles;
create policy "profiles_select_self" on public.user_profiles
  for select using (id = public.uid());

drop policy if exists "profiles_update_self" on public.user_profiles;
create policy "profiles_update_self" on public.user_profiles
  for update using (id = public.uid());

-- KV store: deny by default (backend only). Allow service role only.
drop policy if exists "kv_no_access" on public.kv_store_a0e39776;
create policy "kv_no_access" on public.kv_store_a0e39776
  for all using (false) with check (false);

-- Catalog: readable by all, write restricted
drop policy if exists "catalog_read_all" on public.activity_catalog;
create policy "catalog_read_all" on public.activity_catalog
  for select using (true);

drop policy if exists "catalog_write_admin" on public.activity_catalog;
create policy "catalog_write_admin" on public.activity_catalog
  for all using (false) with check (false); -- manage via service role

-- Activity logs: user owns their rows
drop policy if exists "acts_read_own" on public.activity_logs;
create policy "acts_read_own" on public.activity_logs
  for select using (user_id = public.uid());

drop policy if exists "acts_write_own" on public.activity_logs;
create policy "acts_write_own" on public.activity_logs
  for insert with check (user_id = public.uid());

drop policy if exists "acts_update_own" on public.activity_logs;
create policy "acts_update_own" on public.activity_logs
  for update using (user_id = public.uid());

drop policy if exists "acts_delete_own" on public.activity_logs;
create policy "acts_delete_own" on public.activity_logs
  for delete using (user_id = public.uid());

-- Points ledger: readable own, write via backend
drop policy if exists "ledger_read_own" on public.points_ledger;
create policy "ledger_read_own" on public.points_ledger
  for select using (user_id = public.uid());

drop policy if exists "ledger_write_backend" on public.points_ledger;
create policy "ledger_write_backend" on public.points_ledger
  for all using (false) with check (false);

-- Rewards: readable all
drop policy if exists "rewards_read_all" on public.rewards;
create policy "rewards_read_all" on public.rewards
  for select using (true);

drop policy if exists "rewards_write_backend" on public.rewards;
create policy "rewards_write_backend" on public.rewards
  for all using (false) with check (false);

-- Reward orders: user owns rows
drop policy if exists "orders_read_own" on public.reward_orders;
create policy "orders_read_own" on public.reward_orders
  for select using (user_id = public.uid());

drop policy if exists "orders_write_own" on public.reward_orders;
create policy "orders_write_own" on public.reward_orders
  for insert with check (user_id = public.uid());

drop policy if exists "orders_update_own_pending" on public.reward_orders;
create policy "orders_update_own_pending" on public.reward_orders
  for update using (user_id = public.uid() and status in ('pending','cancelled'));

-- Quiz results: user owns rows
drop policy if exists "quiz_read_own" on public.quiz_results;
create policy "quiz_read_own" on public.quiz_results
  for select using (user_id = public.uid());

drop policy if exists "quiz_write_own" on public.quiz_results;
create policy "quiz_write_own" on public.quiz_results
  for insert with check (user_id = public.uid());

-- Badges: read all; user_badges: user owns
drop policy if exists "badges_read_all" on public.badges;
create policy "badges_read_all" on public.badges
  for select using (true);

drop policy if exists "user_badges_read_own" on public.user_badges;
create policy "user_badges_read_own" on public.user_badges
  for select using (user_id = public.uid());

drop policy if exists "user_badges_write_backend" on public.user_badges;
create policy "user_badges_write_backend" on public.user_badges
  for all using (false) with check (false);

-- Goals: user owns
drop policy if exists "goals_read_own" on public.carbon_goals;
create policy "goals_read_own" on public.carbon_goals
  for select using (user_id = public.uid());

drop policy if exists "goals_write_own" on public.carbon_goals;
create policy "goals_write_own" on public.carbon_goals
  for insert with check (user_id = public.uid());

drop policy if exists "goals_update_own" on public.carbon_goals;
create policy "goals_update_own" on public.carbon_goals
  for update using (user_id = public.uid());

-- Notifications: user owns
drop policy if exists "notif_read_own" on public.notifications;
create policy "notif_read_own" on public.notifications
  for select using (user_id = public.uid());

drop policy if exists "notif_write_backend" on public.notifications;
create policy "notif_write_backend" on public.notifications
  for all using (false) with check (false);

----------------------------
-- 11) Convenience functions
----------------------------
-- Earn points from activity in one shot
create or replace function public.log_activity_and_earn(
  p_user_id uuid,
  p_kind activity_kind,
  p_description text,
  p_amount numeric,
  p_unit text,
  p_carbon_factor numeric,
  p_points int,
  p_location text default null,
  p_catalog_id uuid default null,
  p_verified boolean default false,
  p_meta jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
as $$
declare
  v_act_id uuid;
begin
  insert into public.activity_logs(user_id, kind, catalog_id, description, location, amount, unit, carbon_factor, points_earned, verified, meta)
  values (p_user_id, p_kind, p_catalog_id, p_description, p_location, coalesce(p_amount,1), p_unit, p_carbon_factor, coalesce(p_points,0), p_verified, p_meta)
  returning id into v_act_id;

  if coalesce(p_points,0) <> 0 then
    insert into public.points_ledger(user_id, kind, source, ref_id, points, note)
    values (p_user_id, case when p_points >= 0 then 'earn' else 'spend' end, 'activity', v_act_id, p_points, 'activity log award');
  end if;

  return v_act_id;
end $$;

-- Spend points for reward order
create or replace function public.place_reward_order(
  p_user_id uuid,
  p_reward_id uuid,
  p_points_cost int,
  p_delivery_method text default null,
  p_delivery_address text default null,
  p_delivery_notes text default null
) returns uuid
language plpgsql
security definer
as $$
declare
  v_order_id uuid;
begin
  -- Deduct points
  insert into public.points_ledger(user_id, kind, source, ref_id, points, note)
  values (p_user_id, 'spend', 'reward', null, -1 * p_points_cost, 'reward order');

  -- Create order
  insert into public.reward_orders(user_id, reward_id, status, points_spent, delivery_method, delivery_address, delivery_notes)
  values (p_user_id, p_reward_id, 'pending', p_points_cost, p_delivery_method, p_delivery_address, p_delivery_notes)
  returning id into v_order_id;

  -- link the ledger row to order id
update public.points_ledger pl
set ref_id = v_order_id
where pl.id = (
  select id from public.points_ledger
  where user_id = p_user_id
    and source = 'reward'
    and ref_id is null
  order by created_at desc
  limit 1
);

  return v_order_id;
end $$;

----------------------------
-- 12) Seed minimal catalog (optional)
----------------------------
insert into public.activity_catalog (code,name,kind,carbon_factor,unit,points_per_unit)
values
  ('bus','الحافلة الجامعية','transport', 0.5,'trip', 10),
  ('walking','المشي','transport', 0.0,'trip', 5),
  ('lights_off','إطفاء الأنوار','energy', 0.5,'action', 8),
  ('recycle_plastic','إعادة تدوير البلاستيك','waste', 0.24,'item', 3)
on conflict (code) do nothing;
