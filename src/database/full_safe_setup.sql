-- =================================================================================================
-- Green Pulse - Full, Safe, Idempotent Database Setup Script
-- =================================================================================================
-- This script is designed to be run safely on an existing database.
-- It will NOT delete any user data.
-- It uses "IF NOT EXISTS" and "CREATE OR REPLACE" to only create what is missing or update what needs correcting.
-- -------------------------------------------------------------------------------------------------

BEGIN;

-- 1. Custom Types
-- Safely create ENUM types if they don't exist.
do $$ begin create type public.user_kind as enum ('student', 'employee'); exception when duplicate_object then null; end $$;
do $$ begin create type public.gender_kind as enum ('male', 'female'); exception when duplicate_object then null; end $$;
do $$ begin create type public.activity_kind as enum ('transport', 'energy', 'waste'); exception when duplicate_object then null; end $$;
do $$ begin create type public.reward_kind as enum ('product', 'voucher', 'discount'); exception when duplicate_object then null; end $$;
do $$ begin create type public.order_status as enum ('pending','approved','rejected','fulfilled','cancelled'); exception when duplicate_object then null; end $$;

-- Safely add the missing 'food' value to the activity_kind type.
ALTER TYPE public.activity_kind ADD VALUE IF NOT EXISTS 'food';

-- 2. Tables
-- Create tables only if they do not exist. Your data in existing tables is safe.
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  gender gender_kind, -- Made nullable to avoid breaking old data
  user_type user_kind not null default 'student',
  university_id text,
  department text,
  points integer not null default 0,
  avatar_url text,
  level text not null default 'مبتدئ',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.activity_catalog (
  id serial primary key,
  code text not null unique,
  name text not null,
  kind activity_kind not null,
  description text,
  carbon_factor decimal(10, 4) not null,
  unit text not null,
  points_per_unit integer not null
);

CREATE TABLE IF NOT EXISTS public.activity_log (
  id serial primary key,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  activity_code text not null references public.activity_catalog(code) ON DELETE CASCADE, -- Cascade delete
  quantity decimal(10, 2) not null,
  carbon_saved decimal(10, 4) not null,
  points_earned integer not null,
  notes text,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.rewards_catalog (
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

CREATE TABLE IF NOT EXISTS public.reward_orders (
  id serial primary key,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  reward_id integer not null references public.rewards_catalog(id),
  points_spent integer not null,
  status order_status not null default 'pending',
  order_code text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.quizzes (
  id serial primary key,
  title text not null,
  description text,
  points_reward integer not null,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id serial primary key,
  quiz_id integer not null references public.quizzes(id) on delete cascade,
  question_text text not null,
  options jsonb not null,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id serial primary key,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  quiz_id integer not null references public.quizzes(id),
  score integer not null,
  points_earned integer not null,
  completed_at timestamptz not null default now(),
  unique(user_id, quiz_id)
);

-- 3. Row Level Security (RLS)
-- Enable RLS and drop/recreate policies to ensure they are correct and not duplicated.
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see their own profile" ON public.user_profiles;
CREATE POLICY "Users can see their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own activity logs" ON public.activity_log;
CREATE POLICY "Users can manage their own activity logs" ON public.activity_log FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.reward_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own orders" ON public.reward_orders;
CREATE POLICY "Users can manage their own orders" ON public.reward_orders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can manage their own quiz attempts" ON public.quiz_attempts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Catalogs should be publicly readable.
ALTER TABLE public.activity_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read activity catalog" ON public.activity_catalog;
CREATE POLICY "Public can read activity catalog" ON public.activity_catalog FOR SELECT USING (true);

ALTER TABLE public.rewards_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read rewards catalog" ON public.rewards_catalog;
CREATE POLICY "Public can read rewards catalog" ON public.rewards_catalog FOR SELECT USING (true);


-- 4. Database Functions
-- Replace all functions to ensure they are the latest, most robust versions.

-- A) Function to create a user profile on signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET SEARCH_PATH = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, user_type, university_id, department, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    (COALESCE(new.raw_user_meta_data->>'user_type', 'student'))::user_kind,
    COALESCE(new.raw_user_meta_data->>'university_id', 'N/A'),
    COALESCE(new.raw_user_meta_data->>'department', 'N/A'),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- B) The final, robust function for logging activities.
CREATE OR REPLACE FUNCTION public.log_activity_final(
    p_user_id UUID,
    p_activity_code TEXT,
    p_activity_name TEXT,
    p_activity_kind_text TEXT,
    p_quantity DECIMAL,
    p_carbon_factor DECIMAL,
    p_unit TEXT,
    p_notes TEXT
)
RETURNS INTEGER -- Returns the points earned
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_points_per_unit INTEGER;
    v_carbon_saved DECIMAL;
    v_points_earned INTEGER;
BEGIN
    -- Safely calculate points, handling potential NULLs.
    v_points_per_unit := round(COALESCE(p_carbon_factor, 0) * 10);

    -- Use INSERT...ON CONFLICT to safely add new activities to the catalog.
    INSERT INTO public.activity_catalog(code, name, kind, carbon_factor, unit, points_per_unit)
    VALUES (
        p_activity_code,
        p_activity_name,
        p_activity_kind_text::activity_kind,
        COALESCE(p_carbon_factor, 0),
        p_unit,
        v_points_per_unit
    )
    ON CONFLICT (code) DO UPDATE SET 
        name = EXCLUDED.name, -- Keep catalog fresh
        carbon_factor = EXCLUDED.carbon_factor, 
        points_per_unit = EXCLUDED.points_per_unit;

    -- Safely calculate carbon saved and points earned.
    v_carbon_saved := COALESCE(p_quantity, 0) * COALESCE(p_carbon_factor, 0);
    v_points_earned := floor(COALESCE(p_quantity, 0) * v_points_per_unit);

    -- Insert the user's log entry.
    INSERT INTO public.activity_log(user_id, activity_code, quantity, carbon_saved, points_earned, notes)
    VALUES (p_user_id, p_activity_code, COALESCE(p_quantity, 0), v_carbon_saved, v_points_earned, p_notes);

    -- Update the user's total points.
    UPDATE public.user_profiles
    SET points = points + v_points_earned
    WHERE id = p_user_id;

    RETURN v_points_earned;
END;
$$;

-- 5. Triggers
-- Ensure the trigger for new user creation is in place.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

COMMIT;