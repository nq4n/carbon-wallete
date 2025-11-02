"""
-- =================================================================================================
-- Green Pulse Digital Carbon Wallet - Full Database Setup Script
-- =================================================================================================
-- This script is idempotent and can be run multiple times safely.
-- It will create all necessary tables, types, functions, and policies for the application.
-- -------------------------------------------------------------------------------------------------

----------------------------
-- 1) Custom Types
----------------------------
-- The application uses several ENUM types to ensure data integrity.

do $$ begin
  create type user_kind as enum ('student', 'employee');
exception when duplicate_object then null; end $$;

do $$ begin
  create type gender_kind as enum ('male', 'female');
exception when duplicate_object then null; end $$;

do $$ begin
  create type activity_kind as enum ('transport', 'energy', 'waste', 'food');
exception when duplicate_object then null; end $$;

do $$ begin
  create type reward_kind as enum ('product', 'voucher', 'discount');
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
  gender gender_kind not null,
  user_type user_kind not null,
  university_id text not null,
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

create trigger on_update_user_profiles
  before update on public.user_profiles
  for each row execute procedure public.touch_user_profiles();

----------------------------
-- 3) Activity Catalog
----------------------------
-- This table stores predefined activities users can log.
create table if not exists public.activity_catalog (
  id serial primary key,
  code text not null unique,
  name text not null,
  kind activity_kind not null,
  description text,
  carbon_factor decimal(10, 4) not null,
  unit text not null,
  points_per_unit integer not null
);

----------------------------
-- 4) User Activity Log
----------------------------
-- Records each carbon-saving activity logged by a user.
create table if not exists public.activity_log (
  id serial primary key,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  activity_code text not null references public.activity_catalog(code),
  quantity decimal(10, 2) not null,
  carbon_saved decimal(10, 4) not null,
  points_earned integer not null,
  notes text,
  created_at timestamptz not null default now()
);

----------------------------
-- 5) Carbon Goals
----------------------------
-- Tracks user-set goals for carbon reduction.
create table if not exists public.carbon_goals (
  id serial primary key,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  title text not null,
  target_date date not null,
  target_reduction decimal(10, 4) not null,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'failed')),
  created_at timestamptz not null default now()
);

----------------------------
-- 6) Rewards Catalog (Green Store)
----------------------------
-- Lists all available rewards in the store.
create table if not exists public.rewards_catalog (
  id serial primary key,
  name text not null,
  description text not null,
  kind reward_kind not null,
  points_cost integer not null,
  stock_quantity integer not null,
  image_url text,
  is_active boolean not null default true,
  valid_until date,
  created_at timestamptz not null default now()
);

----------------------------
-- 7) Reward Orders
----------------------------
-- Tracks user redemptions of rewards.
create table if not exists public.reward_orders (
  id serial primary key,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  reward_id integer not null references public.rewards_catalog(id),
  points_spent integer not null,
  status order_status not null default 'pending',
  order_code text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_reward_orders()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger on_update_reward_orders
  before update on public.reward_orders
  for each row execute procedure public.touch_reward_orders();

----------------------------
-- 8) Eco-Learning Content
----------------------------
create table if not exists public.learning_articles (
  id serial primary key,
  title text not null,
  content text not null,
  author text,
  category text,
  image_url text,
  created_at timestamptz not null default now()
);

----------------------------
-- 9) Eco-Quizzes
----------------------------
create table if not exists public.quizzes (
  id serial primary key,
  title text not null,
  description text,
  points_reward integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id serial primary key,
  quiz_id integer not null references public.quizzes(id) on delete cascade,
  question_text text not null,
  options jsonb not null, -- e.g., [{"text": "Option A", "isCorrect": false}, ...]
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id serial primary key,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  quiz_id integer not null references public.quizzes(id),
  score integer not null,
  points_earned integer not null,
  completed_at timestamptz not null default now(),
  unique(user_id, quiz_id) -- User can attempt each quiz only once
);

----------------------------
-- 10) Row Level Security (RLS)
----------------------------

-- Enable RLS for all relevant tables
alter table public.user_profiles enable row level security;
alter table public.activity_log enable row level security;
alter table public.carbon_goals enable row level security;
alter table public.reward_orders enable row level security;
alter table public.quiz_attempts enable row level security;

-- Policies for user_profiles
-- Users can see their own profile.
create policy "Users can see their own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

-- Users can update their own profile.
create policy "Users can update their own profile"
  on public.user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Policies for activity_log
-- Users can manage their own activity logs.
create policy "Users can manage their own activity logs"
  on public.activity_log for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policies for carbon_goals
-- Users can manage their own carbon goals.
create policy "Users can manage their own goals"
  on public.carbon_goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policies for reward_orders
-- Users can manage their own reward orders.
create policy "Users can manage their own orders"
  on public.reward_orders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policies for quiz_attempts
-- Users can manage their own quiz attempts.
create policy "Users can manage their own quiz attempts"
  on public.quiz_attempts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
  
-- Allow public read access to catalogs and learning content
-- RLS is not enabled on these, but if it were, these would be the policies.
-- create policy "Public can read activity catalog" on public.activity_catalog for select using (true);
-- create policy "Public can read rewards catalog" on public.rewards_catalog for select using (true);
-- create policy "Public can read learning articles" on public.learning_articles for select using (true);
-- create policy "Public can read quizzes" on public.quizzes for select using (true);
-- create policy "Public can read quiz questions" on public.quiz_questions for select using (true);


----------------------------
-- 11) Stored Procedures
----------------------------

-- A) Function to automatically create a user profile on new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_user_type_text text;
  meta_gender_text text;
begin
  -- Extract metadata from the new user object
  meta_user_type_text := new.raw_user_meta_data->>'user_type';
  meta_gender_text := new.raw_user_meta_data->>'gender';

  insert into public.user_profiles (id, email, name, gender, user_type, university_id, department, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    
    -- Cast the gender text to the 'gender_kind' enum type
    (case
      when meta_gender_text is null or meta_gender_text = '' then 'male' -- Default to 'male' if not provided
      else meta_gender_text
    end)::gender_kind,
    
    -- Cast the user_type text to the 'user_kind' enum type
    (case
      when meta_user_type_text is null or meta_user_type_text = '' then 'student' -- Default to 'student'
      else meta_user_type_text
    end)::user_kind,
    
    coalesce(new.raw_user_meta_data->>'university_id', 'N/A'),
    coalesce(new.raw_user_meta_data->>'department', 'N/A'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- B) Trigger to call the function when a new user is created in the auth.users table
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- C) Function to log an activity and update user points
create or replace function public.log_activity_and_update_points(
  p_user_id uuid,
  p_activity_code text,
  p_quantity decimal
)
returns integer -- Returns the points earned
language plpgsql
as $$
declare
  v_carbon_factor decimal;
  v_points_per_unit integer;
  v_carbon_saved decimal;
  v_points_earned integer;
begin
  -- 1. Get activity details from catalog
  select carbon_factor, points_per_unit
  into v_carbon_factor, v_points_per_unit
  from public.activity_catalog
  where code = p_activity_code;

  if not found then
    raise exception 'Invalid activity code: %', p_activity_code;
  end if;

  -- 2. Calculate carbon saved and points earned
  v_carbon_saved := p_quantity * v_carbon_factor;
  v_points_earned := p_quantity * v_points_per_unit;

  -- 3. Insert into activity log
  insert into public.activity_log(user_id, activity_code, quantity, carbon_saved, points_earned)
  values (p_user_id, p_activity_code, p_quantity, v_carbon_saved, v_points_earned);

  -- 4. Update user's total points
  update public.user_profiles
  set points = points + v_points_earned
  where id = p_user_id;

  -- 5. Return the points earned in this activity
  return v_points_earned;
end;
$$;


-- D) Function to redeem a reward
create or replace function public.redeem_reward(
  p_user_id uuid,
  p_reward_id integer
)
returns text -- Returns a unique order code
language plpgsql
as $$
declare
  v_points_cost integer;
  v_user_points integer;
  v_reward_stock integer;
  v_order_id integer;
  v_order_code text;
begin
  -- 1. Get reward cost and current stock
  select points_cost, stock_quantity
  into v_points_cost, v_reward_stock
  from public.rewards_catalog
  where id = p_reward_id and is_active = true and (valid_until is null or valid_until >= current_date);

  if not found then
    raise exception 'Reward not available or has expired.';
  end if;

  if v_reward_stock <= 0 then
    raise exception 'Reward is out of stock.';
  end if;

  -- 2. Check if user has enough points
  select points into v_user_points from public.user_profiles where id = p_user_id;
  if v_user_points < v_points_cost then
    raise exception 'Insufficient points to redeem this reward.';
  end if;

  -- Use a transaction block to ensure atomicity
  begin
    -- 3. Deduct points from user
    update public.user_profiles
    set points = points - v_points_cost
    where id = p_user_id;

    -- 4. Decrement reward stock
    update public.rewards_catalog
    set stock_quantity = stock_quantity - 1
    where id = p_reward_id;

    -- 5. Generate a unique order code
    v_order_code := 'GR-' || to_char(now(),'YYMMDD') || '-' || upper(substr(md5(random()::text), 0, 7));

    -- 6. Create the reward order
    insert into public.reward_orders (user_id, reward_id, points_spent, order_code, status)
    values (p_user_id, p_reward_id, v_points_cost, v_order_code, 'pending')
    returning id into v_order_id;
    
  exception
    when others then
      -- If any step fails, roll back the transaction
      raise;
  end;

  return v_order_code;
end $$;


-- E) Function to get user stats (rank, etc.)
create or replace function public.get_user_stats(p_user_id uuid)
returns table(rank bigint, total_points integer, total_carbon_saved numeric)
language plpgsql
as $$
begin
  return query
  with user_ranks as (
    select
      id,
      points,
      sum(coalesce(al.carbon_saved, 0)) over (partition by id) as total_carbon,
      rank() over (order by points desc, created_at asc) as user_rank
    from public.user_profiles
    left join activity_log al on al.user_id = id
  )
  select
    ur.user_rank,
    ur.points,
    ur.total_carbon
  from user_ranks ur
  where ur.id = p_user_id;
end;
$$;

-- F) Function to get leaderboard
create or replace function public.get_leaderboard(limit_count int default 20)
returns table (
  rank bigint,
  user_id uuid,
  name text,
  points integer,
  level text,
  avatar_url text
)
language plpgsql
as $$
begin
  return query
  select
    rank() over (order by p.points desc, p.created_at asc) as rank,
    p.id,
    p.name,
    p.points,
    p.level,
    p.avatar_url
  from public.user_profiles p
  order by rank
  limit limit_count;
end;
$$;


-- G) Function to handle quiz submission
create or replace function public.submit_quiz(p_user_id uuid, p_quiz_id integer, p_answers jsonb)
returns integer -- returns points earned
language plpgsql
as $$
declare
    v_total_questions int;
    v_correct_answers int := 0;
    v_question record;
    v_answer jsonb;
    v_option jsonb;
    v_is_correct boolean;
    v_points_reward int;
    v_points_earned int;
begin
    -- Check if user has already attempted this quiz
    if exists(select 1 from public.quiz_attempts where user_id = p_user_id and quiz_id = p_quiz_id) then
        raise exception 'You have already completed this quiz.';
    end if;

    -- Get quiz details
    select points_reward into v_points_reward from public.quizzes where id = p_quiz_id;
    if not found then
        raise exception 'Quiz not found.';
    end if;

    -- Loop through questions and check answers
    v_total_questions := (select count(*) from public.quiz_questions where quiz_id = p_quiz_id);
    for v_question in select id, options from public.quiz_questions where quiz_id = p_quiz_id loop
        -- Find the user's answer for this question
        select val into v_answer from jsonb_array_elements(p_answers) as elem, jsonb_to_record(elem.value) as val(question_id int, answer_index int) where val.question_id = v_question.id;

        if v_answer is not null then
            -- Get the correct option from the question's options
            v_is_correct := (v_question.options -> (v_answer->>'answer_index')::int ->> 'isCorrect')::boolean;
            if v_is_correct then
                v_correct_answers := v_correct_answers + 1;
            end if;
        end if;
    end loop;
    
    -- Calculate points earned (all or nothing)
    if v_correct_answers = v_total_questions then
        v_points_earned := v_points_reward;
    else
        v_points_earned := 0;
    end if;

    -- Record the attempt
    insert into public.quiz_attempts(user_id, quiz_id, score, points_earned, completed_at)
    values (p_user_id, p_quiz_id, v_correct_answers, v_points_earned, now());

    -- Update user's points if they passed
    if v_points_earned > 0 then
        update public.user_profiles set points = points + v_points_earned where id = p_user_id;
    end if;
    
    return v_points_earned;
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
""