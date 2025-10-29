
-- ---------------------------
-- 8) Challenges
-- ---------------------------

do $$ begin
  create type challenge_type as enum ('activity_based', 'goal_based');
exception when duplicate_object then null; end $$;

do $$ begin
  create type challenge_status as enum ('active', 'completed', 'expired');
exception when duplicate_object then null; end $$;

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  type challenge_type not null,
  activity_kind activity_kind, -- For activity_based challenges
  target_amount numeric(12,2),   -- For activity_based challenges (e.g., 5 trips, 10 items)
  target_co2_saved numeric(12,2), -- For goal_based challenges
  due_date timestamptz not null,
  points_reward int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.user_challenges (
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  progress numeric(12,2) not null default 0,
  status challenge_status not null default 'active',
  completed_at timestamptz,
  primary key (user_id, challenge_id)
);

-- Function to update user challenge progress
create or replace function public.update_challenge_progress()
returns trigger language plpgsql as $$
begin
  -- Logic to update user_challenges progress based on new activity_logs
  -- This is a placeholder and needs to be implemented based on specific challenge requirements
  return new;
end $$;

-- Trigger to update challenge progress after an activity is logged
drop trigger if exists trg_update_challenge_progress on public.activity_logs;
create trigger trg_update_challenge_progress
after insert on public.activity_logs
for each row execute function public.update_challenge_progress();

-- RLS for challenges
alter table public.challenges enable row level security;
alter table public.user_challenges enable row level security;

drop policy if exists "challenges_read_all" on public.challenges;
create policy "challenges_read_all" on public.challenges
  for select using (true);

drop policy if exists "user_challenges_read_own" on public.user_challenges;
create policy "user_challenges_read_own" on public.user_challenges
  for select using (user_id = public.uid());

drop policy if exists "user_challenges_write_own" on public.user_challenges;
create policy "user_challenges_write_own" on public.user_challenges
  for insert with check (user_id = public.uid());

drop policy if exists "user_challenges_update_own" on public.user_challenges;
create policy "user_challenges_update_own" on public.user_challenges
  for update using (user_id = public.uid());
