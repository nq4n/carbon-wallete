-- deploy.sql
-- Consolidated, idempotent SQL to create the tables, types, functions, triggers, and RLS policies
-- for the Carbon Wallet project.

-- 0) Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) ENUM types (idempotent)
DO $$ BEGIN CREATE TYPE public.user_kind AS ENUM ('student', 'employee'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.gender_kind AS ENUM ('male', 'female'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.activity_kind AS ENUM ('transport', 'energy', 'waste', 'food'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.reward_kind AS ENUM ('product', 'voucher', 'discount'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.order_status AS ENUM ('pending','approved','rejected','fulfilled','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.challenge_type AS ENUM ('activity_based', 'goal_based'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.challenge_status AS ENUM ('active', 'completed', 'expired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.quiz_difficulty AS ENUM ('easy', 'medium', 'hard'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.product_category AS ENUM ('cups', 'office', 'tech', 'accessories'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.reward_category AS ENUM ('food', 'academic', 'merchandise', 'experiences'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.achievement_category AS ENUM ('bronze','silver','gold'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Core user profile table (safe)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY, -- expected to reference auth.users(id) in Supabase deployments
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  gender gender_kind,
  user_type user_kind NOT NULL DEFAULT 'student',
  university_id text,
  department text,
  points integer NOT NULL DEFAULT 0,
  avatar_url text,
  level text NOT NULL DEFAULT 'مبتدئ',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- If you're on Supabase uncomment foreign key:
-- ALTER TABLE public.user_profiles
--   ADD CONSTRAINT fk_user_profiles_auth_users FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles (email);

-- Trigger util to keep updated_at fresh
CREATE OR REPLACE FUNCTION public.touch_user_profiles()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_touch_user_profiles ON public.user_profiles;
CREATE TRIGGER trg_touch_user_profiles
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.touch_user_profiles();

-- 3) Activity catalog
CREATE TABLE IF NOT EXISTS public.activity_catalog (
  id serial PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  kind activity_kind NOT NULL,
  description text,
  carbon_factor numeric(12,4) NOT NULL,
  unit text NOT NULL,
  points_per_unit integer NOT NULL
);

-- 4) Activity log
CREATE TABLE IF NOT EXISTS public.activity_log (
  id serial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  activity_code text NOT NULL REFERENCES public.activity_catalog(code) ON DELETE CASCADE,
  quantity numeric(12,2) NOT NULL,
  carbon_saved numeric(12,4) NOT NULL,
  points_earned integer NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5) Carbon goals
CREATE TABLE IF NOT EXISTS public.carbon_goals (
  id serial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  target_date date NOT NULL,
  target_reduction numeric(12,4) NOT NULL,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6) Rewards catalog (Green Store)
CREATE TABLE IF NOT EXISTS public.rewards_catalog (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  kind reward_kind NOT NULL,
  points_cost integer NOT NULL,
  stock_quantity integer NOT NULL,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  valid_until date,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7) Reward orders
CREATE TABLE IF NOT EXISTS public.reward_orders (
  id serial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  reward_id integer NOT NULL REFERENCES public.rewards_catalog(id),
  points_spent integer NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  order_code text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- touch trigger for reward_orders updated_at
CREATE OR REPLACE FUNCTION public.touch_reward_orders()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_touch_reward_orders ON public.reward_orders;
CREATE TRIGGER trg_touch_reward_orders
  BEFORE UPDATE ON public.reward_orders
  FOR EACH ROW EXECUTE PROCEDURE public.touch_reward_orders();

-- 8) Learning articles
CREATE TABLE IF NOT EXISTS public.learning_articles (
  id serial PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  author text,
  category text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 9) Quizzes
-- Use schema that matches the provided quiz data (id as integer primary key and options as text[])
CREATE TABLE IF NOT EXISTS public.quizzes (
  id integer PRIMARY KEY,
  title text NOT NULL,
  description text,
  difficulty public.quiz_difficulty,
  time_limit_minutes integer,
  points integer,
  category text,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id serial PRIMARY KEY,
  quiz_id integer NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question text NOT NULL,
  options text[] NOT NULL,
  correct_answer_index integer NOT NULL,
  explanation text
);

CREATE TABLE IF NOT EXISTS public.user_quiz_attempts (
  id serial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  quiz_id integer NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  points_earned integer NOT NULL,
  completed_at timestamptz DEFAULT now(),
  UNIQUE (user_id, quiz_id)
);

-- 10) Challenges and user challenges
CREATE TABLE IF NOT EXISTS public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type challenge_type NOT NULL DEFAULT 'activity_based',
  activity_kind activity_kind,
  target_amount numeric(12,2),
  target_co2_saved numeric(12,2),
  due_date timestamptz,
  points_reward integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_challenges (
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress numeric(12,2) NOT NULL DEFAULT 0,
  status challenge_status NOT NULL DEFAULT 'active',
  completed_at timestamptz,
  PRIMARY KEY (user_id, challenge_id)
);

-- For compatibility with older scripts using user_completed_challenges:
CREATE TABLE IF NOT EXISTS public.user_completed_challenges (
  id serial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_id)
);

-- 11) Shops & Products (Green Store product catalog)
CREATE TABLE IF NOT EXISTS public.shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id integer PRIMARY KEY,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price integer NOT NULL,
  original_price integer,
  category public.product_category,
  image text,
  rating numeric(2,1),
  reviews integer,
  eco_points integer,
  in_stock integer,
  features text[],
  is_new boolean DEFAULT false,
  is_popular boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 12) Achievements
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  points_reward int NOT NULL DEFAULT 0,
  icon_name text,
  target_value int
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  progress int NOT NULL DEFAULT 0,
  completed_at timestamptz,
  PRIMARY KEY (user_id, achievement_id)
);

-- 13) Rewards (alternate table used in some scripts)
CREATE TABLE IF NOT EXISTS public.rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  points_cost int NOT NULL DEFAULT 0,
  category public.reward_category,
  available boolean NOT NULL DEFAULT true,
  image text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 14) user stats function (helper)
CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id uuid)
RETURNS json LANGUAGE plpgsql AS $$
DECLARE
  v_user_total_saved numeric;
  v_department_avg_saved numeric;
  v_university_avg_saved numeric;
  v_user_rank int;
  v_weekly_improvement numeric;
  v_top_activity_kind text;
  v_user_department text;
BEGIN
  SELECT COALESCE(SUM(carbon_saved),0) INTO v_user_total_saved FROM public.activity_log WHERE user_id = p_user_id;
  SELECT department INTO v_user_department FROM public.user_profiles WHERE id = p_user_id;

  SELECT AVG(total_carbon) INTO v_department_avg_saved FROM (
    SELECT SUM(al.carbon_saved) AS total_carbon
    FROM public.activity_log al
    JOIN public.user_profiles up ON al.user_id = up.id
    WHERE up.department = v_user_department
    GROUP BY al.user_id
  ) dept_totals;

  SELECT AVG(total_carbon) INTO v_university_avg_saved FROM (
    SELECT SUM(carbon_saved) AS total_carbon
    FROM public.activity_log
    GROUP BY user_id
  ) uni_totals;

  WITH user_ranks AS (
    SELECT user_id, RANK() OVER (ORDER BY SUM(carbon_saved) DESC) as rnk
    FROM public.activity_log
    GROUP BY user_id
  )
  SELECT rnk INTO v_user_rank FROM user_ranks WHERE user_id = p_user_id;

  IF v_user_rank IS NULL THEN
    SELECT COUNT(*)+1 INTO v_user_rank FROM public.user_profiles;
  END IF;

  DECLARE
    this_week_saved numeric;
    last_week_saved numeric;
  BEGIN
    SELECT COALESCE(SUM(carbon_saved),0) INTO this_week_saved
      FROM public.activity_log
      WHERE user_id = p_user_id AND created_at >= date_trunc('week', now());

    SELECT COALESCE(SUM(carbon_saved),0) INTO last_week_saved
      FROM public.activity_log
      WHERE user_id = p_user_id
        AND created_at >= date_trunc('week', now() - interval '1 week')
        AND created_at < date_trunc('week', now());

    IF last_week_saved > 0 THEN
      v_weekly_improvement := ((this_week_saved - last_week_saved) / last_week_saved) * 100;
    ELSIF this_week_saved > 0 THEN
      v_weekly_improvement := 100;
    ELSE
      v_weekly_improvement := 0;
    END IF;
  END;

  SELECT ac.kind::text INTO v_top_activity_kind
    FROM public.activity_log al
    JOIN public.activity_catalog ac ON al.activity_code = ac.code
    WHERE al.user_id = p_user_id
    GROUP BY ac.kind
    ORDER BY COUNT(*) DESC
    LIMIT 1;

  RETURN json_build_object(
    'totalCarbonSaved', COALESCE(v_user_total_saved,0),
    'departmentAverage', COALESCE(v_department_avg_saved,0),
    'universityAverage', COALESCE(v_university_avg_saved,0),
    'rank', COALESCE(v_user_rank,0),
    'weeklyImprovement', COALESCE(v_weekly_improvement,0),
    'topActivityKind', v_top_activity_kind
  );
END;
$$;

-- 15) Functions to manage points, logging, and activity catalog

-- increment_user_points
CREATE OR REPLACE FUNCTION public.increment_user_points(p_user_id UUID, p_points INT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  -- Lock the user's row to avoid race conditions
  PERFORM 1 FROM public.user_profiles WHERE id = p_user_id FOR UPDATE;
  UPDATE public.user_profiles SET points = points + p_points WHERE id = p_user_id;
END;
$$;

-- add_new_activity_to_catalog (safe, casts string to activity_kind)
CREATE OR REPLACE FUNCTION public.add_new_activity_to_catalog(
  p_code TEXT,
  p_name TEXT,
  p_kind_text TEXT,
  p_carbon_factor NUMERIC,
  p_unit TEXT,
  p_points_per_unit INTEGER
)
RETURNS SETOF public.activity_catalog
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.activity_catalog (code, name, kind, carbon_factor, unit, points_per_unit)
  VALUES (
    p_code,
    p_name,
    p_kind_text::activity_kind,
    p_carbon_factor,
    p_unit,
    p_points_per_unit
  )
  ON CONFLICT (code) DO NOTHING
  RETURNING *;
END;
$$;

-- robust log_activity_final that safely upserts into the activity catalog and logs actions
CREATE OR REPLACE FUNCTION public.log_activity_final(
    p_user_id UUID,
    p_activity_code TEXT,
    p_activity_name TEXT,
    p_activity_kind_text TEXT,
    p_quantity NUMERIC,
    p_carbon_factor NUMERIC,
    p_unit TEXT,
    p_notes TEXT
)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_points_per_unit INTEGER;
    v_carbon_saved NUMERIC;
    v_points_earned INTEGER;
BEGIN
    -- calculate points per unit safely
    v_points_per_unit := COALESCE(ROUND(COALESCE(p_carbon_factor,0) * 10), 0);

    -- upsert into catalog
    INSERT INTO public.activity_catalog(code, name, kind, carbon_factor, unit, points_per_unit)
    VALUES (p_activity_code, p_activity_name, p_activity_kind_text::activity_kind, COALESCE(p_carbon_factor,0), p_unit, v_points_per_unit)
    ON CONFLICT (code) DO UPDATE SET
      name = EXCLUDED.name,
      carbon_factor = EXCLUDED.carbon_factor,
      points_per_unit = EXCLUDED.points_per_unit;

    v_carbon_saved := COALESCE(p_quantity,0) * COALESCE(p_carbon_factor,0);
    v_points_earned := FLOOR(COALESCE(p_quantity,0) * v_points_per_unit);

    INSERT INTO public.activity_log(user_id, activity_code, quantity, carbon_saved, points_earned, notes)
    VALUES (p_user_id, p_activity_code, COALESCE(p_quantity,0), v_carbon_saved, v_points_earned, p_notes);

    UPDATE public.user_profiles SET points = points + v_points_earned WHERE id = p_user_id;

    RETURN v_points_earned;
END;
$$;

-- a simpler log activity function (legacy name) that references the robust one
CREATE OR REPLACE FUNCTION public.log_activity_and_update_points(
  p_user_id uuid,
  p_activity_code text,
  p_quantity numeric
)
RETURNS integer LANGUAGE plpgsql AS $$
DECLARE
  v_carbon_factor numeric;
  v_points_per_unit integer;
  v_carbon_saved numeric;
  v_points_earned integer;
BEGIN
  SELECT carbon_factor, points_per_unit INTO v_carbon_factor, v_points_per_unit
    FROM public.activity_catalog WHERE code = p_activity_code;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid activity code: %', p_activity_code;
  END IF;

  v_carbon_saved := p_quantity * v_carbon_factor;
  v_points_earned := p_quantity * v_points_per_unit;

  INSERT INTO public.activity_log(user_id, activity_code, quantity, carbon_saved, points_earned)
  VALUES (p_user_id, p_activity_code, p_quantity, v_carbon_saved, v_points_earned);

  UPDATE public.user_profiles SET points = points + v_points_earned WHERE id = p_user_id;

  RETURN v_points_earned;
END;
$$;

-- 16) Challenge completion RPC (safe)
CREATE OR REPLACE FUNCTION public.complete_challenge(p_challenge_id uuid, p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_points_to_award integer;
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_completed_challenges WHERE user_id = p_user_id AND challenge_id = p_challenge_id) THEN
    RAISE EXCEPTION 'User has already completed this challenge';
  END IF;

  SELECT points_reward INTO v_points_to_award FROM public.challenges WHERE id = p_challenge_id;

  INSERT INTO public.user_completed_challenges (user_id, challenge_id, completed_at) VALUES (p_user_id, p_challenge_id, now());

  UPDATE public.user_profiles SET points = points + COALESCE(v_points_to_award,0) WHERE id = p_user_id;
END;
$$;

-- 17) Function to update challenge progress (placeholder, safe to create)
CREATE OR REPLACE FUNCTION public.update_challenge_progress()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Placeholder: custom logic should be added to update user_challenges.progress and status.
  -- This triggers after inserts on activity_log; implement challenge-specific checks here.
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_update_challenge_progress ON public.activity_log;
CREATE TRIGGER trg_update_challenge_progress
  AFTER INSERT ON public.activity_log
  FOR EACH ROW EXECUTE PROCEDURE public.update_challenge_progress();

-- 18) Trigger for auto-creating user_profiles when a new auth.user is created (Supabase)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  meta_user_type_text TEXT;
  meta_gender_text TEXT;
BEGIN
  meta_user_type_text := NEW.raw_user_meta_data->>'user_type';
  meta_gender_text := NEW.raw_user_meta_data->>'gender';

  INSERT INTO public.user_profiles (id, email, name, gender, user_type, university_id, department, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    (CASE WHEN meta_gender_text IS NULL OR meta_gender_text = '' THEN NULL ELSE meta_gender_text END)::gender_kind,
    (CASE WHEN meta_user_type_text IS NULL OR meta_user_type_text = '' THEN 'student' ELSE meta_user_type_text END)::user_kind,
    COALESCE(NEW.raw_user_meta_data->>'university_id', 'N/A'),
    COALESCE(NEW.raw_user_meta_data->>'department', 'N/A'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- If using Supabase, ensure the trigger is created on auth.users.
-- The block below checks for the existence of the auth.users table and
-- creates the trigger only when present. This makes the script safe to run
-- on non-Supabase/Postgres servers as well.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'auth' AND c.relname = 'users'
  ) THEN
    -- Drop existing trigger if present, then create (idempotent)
    EXECUTE 'DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users';
    EXECUTE $exec$
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    $exec$;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- If anything goes wrong (permissions, missing schema), raise a NOTICE and continue.
  RAISE NOTICE 'Skipping auth.users trigger creation: %', SQLERRM;
END$$;

-- 19) Row Level Security (RLS) policies (idempotent)

-- user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see their own profile" ON public.user_profiles;
CREATE POLICY "Users can see their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- activity_log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own activity logs" ON public.activity_log;
CREATE POLICY "Users can manage their own activity logs" ON public.activity_log FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- reward_orders
ALTER TABLE public.reward_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own orders" ON public.reward_orders;
CREATE POLICY "Users can manage their own orders" ON public.reward_orders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- quiz attempts
ALTER TABLE public.user_quiz_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own quiz attempts" ON public.user_quiz_attempts;
CREATE POLICY "Users can manage their own quiz attempts" ON public.user_quiz_attempts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- public catalogs readable
ALTER TABLE public.activity_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read activity catalog" ON public.activity_catalog;
CREATE POLICY "Public can read activity catalog" ON public.activity_catalog FOR SELECT USING (true);

ALTER TABLE public.rewards_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read rewards catalog" ON public.rewards_catalog;
CREATE POLICY "Public can read rewards catalog" ON public.rewards_catalog FOR SELECT USING (true);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rewards_read_all" ON public.rewards;
CREATE POLICY "rewards_read_all" ON public.rewards FOR SELECT USING (true);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_read_all" ON public.products;
CREATE POLICY "products_read_all" ON public.products FOR SELECT USING (true);

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shops_read_all" ON public.shops;
CREATE POLICY "shops_read_all" ON public.shops FOR SELECT USING (true);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "achievements_read_all" ON public.achievements;
CREATE POLICY "achievements_read_all" ON public.achievements FOR SELECT USING (true);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_achievements_read_own" ON public.user_achievements;
CREATE POLICY "user_achievements_read_own" ON public.user_achievements FOR SELECT USING (user_id = auth.uid());

-- 20) Seed examples (safe ON CONFLICT DO NOTHING)
-- Example shop record (replace UUID if desired)
INSERT INTO public.shops (id, name, description)
VALUES ('1e9f6c28-4e94-4b8c-9a4c-8e4a9e5b2b9f', 'متجر الجامعة الأخضر', 'منتجات مستدامة وصديقة للبيئة مقدمة من الجامعة.')
ON CONFLICT (id) DO NOTHING;

-- Example products (ID integer must match primary key)
INSERT INTO public.products (id, shop_id, name, description, price, original_price, category, image, rating, reviews, eco_points, in_stock, features, is_new, is_popular)
VALUES
(1, '1e9f6c28-4e94-4b8c-9a4c-8e4a9e5b2b9f', 'كوب القهوة البامبو الطبيعي', 'كوب قابل لإعادة الاستخدام مصنوع من ألياف البامبو الطبيعية', 250, 350, 'cups', NULL, 4.8, 156, 15, 45, ARRAY['مقاوم للحرارة','قابل للتحلل','غطاء محكم'], false, true)
ON CONFLICT (id) DO UPDATE SET
  shop_id = EXCLUDED.shop_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  category = EXCLUDED.category,
  image = EXCLUDED.image,
  rating = EXCLUDED.rating,
  reviews = EXCLUDED.reviews,
  eco_points = EXCLUDED.eco_points,
  in_stock = EXCLUDED.in_stock,
  features = EXCLUDED.features,
  is_new = EXCLUDED.is_new,
  is_popular = EXCLUDED.is_popular;

-- Insert rewards (from rewards.sql)
INSERT INTO public.rewards (id, title, description, points_cost, category, available, image)
VALUES
  ('f68f8b72-5e60-4ea3-9689-1a73a6e87a2d', 'قهوة مجانية', 'مشروب مجاني من كافيتيريا الجامعة', 50, 'food', true, NULL),
  ('8a2c3a6e-8e81-4b2a-9b9c-5e5d3c8c7b8a', 'خصم 20% على الكتب', 'خصم على جميع الكتب من مكتبة الجامعة', 200, 'academic', true, NULL),
  ('e3a4f6d8-1b2c-4e5f-8a9b-0c1d2e3f4a5b', 'حقيبة الجامعة البيئية', 'حقيبة مصنوعة من مواد معاد تدويرها', 500, 'merchandise', true, NULL),
  ('c7b8e9f0-3d4a-5b6c-7a8b-9c0d1e2f3a4b', 'وجبة غداء صحية', 'وجبة عضوية من المطعم الصحي', 150, 'food', true, NULL),
  ('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'جولة بيئية خاصة', 'جولة في مرافق الجامعة المستدامة', 300, 'experiences', false, NULL)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  points_cost = EXCLUDED.points_cost,
  category = EXCLUDED.category,
  available = EXCLUDED.available,
  image = EXCLUDED.image;

-- Insert user profiles (sample users)
INSERT INTO public.user_profiles (id, email, name, user_type, university_id, department, points, avatar_url, level, created_at, updated_at, gender)
VALUES
  ('03dee716-6c2b-43d2-aa09-4d281b993584', 'zainab.alshidhani@gmail.com', 'Zainab Said', 'employee', '8984', 'شؤون الطلاب', 0, NULL, 'مبتدئ', '2025-11-02 07:50:07.933807+00', '2025-11-02 11:23:53.99701+00', 'female'),
  ('2b73be47-2576-498a-9452-2d6c03670212', 's128683@student.squ.edu.om', 'عزيز البوسعيدي', 'student', '128683', NULL, 0, NULL, 'مبتدئ', '2025-11-02 15:21:26.550996+00', '2025-11-04 04:57:36.679267+00', 'male'),
  ('89785f11-80d5-40d2-b111-0c59de111e92', 's121702@student.squ.edu.om', 'عهد خميس', 'student', 'N/A', 'N/A', 129, NULL, 'مبتدئ', '2025-11-01 18:47:32.317664+00', '2025-11-09 05:19:26.768018+00', 'female'),
  ('a8c98d63-6aa4-40b7-b793-656722649979', 'demo@squ.edu.om', 'demo account', 'student', 'demo', 'كلية التربية', 10, NULL, 'مبتدئ', '2025-11-01 20:22:04.976999+00', '2025-11-02 11:22:53.462577+00', 'male'),
  ('bea0551e-3866-4fff-8d5e-0138e7923fad', 's138485@student.squ.edu.om', 'خميس العيسائي', 'student', '138485', 'كلية التربية', 0, NULL, 'مبتدئ', '2025-11-10 17:39:09.033678+00', '2025-11-10 17:59:04.224447+00', 'male'),
  ('ccf0d682-0a23-4e60-a0b3-e0347c5c11db', 's136629@student.squ.edu.om', 'Muaiyad Sulaiman Al Hasani', 'student', 's136629', 'كلية التربية', 0, NULL, 'مبتدئ', '2025-11-01 20:18:18.22777+00', '2025-11-01 20:41:47.334061+00', 'male')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  user_type = EXCLUDED.user_type,
  university_id = EXCLUDED.university_id,
  department = EXCLUDED.department,
  points = EXCLUDED.points,
  level = EXCLUDED.level,
  gender = EXCLUDED.gender;

-- Insert full quizzes and questions (from eco_quizzes_full_icon_names.sql)
-- The inserts below are idempotent via ON CONFLICT where appropriate.
INSERT INTO public.quizzes (id, title, description, difficulty, time_limit_minutes, points, category, icon) VALUES
  (1, 'تدوير بذكاء', 'اختبار مكوّن من 8 أسئلة حول: إدارة النفايات', 'hard', 8, 40, 'إدارة النفايات', 'recycle'),
  (2, 'عادات ذكية مع الأجهزة', 'اختبار مكوّن من 7 أسئلة حول: استخدام الأجهزة', 'medium', 7, 35, 'استخدام الأجهزة', 'bolt'),
  (3, 'تغذية ومسؤولية', 'اختبار مكوّن من 8 أسئلة حول: الطعام والشراب', 'hard', 8, 40, 'الطعام والشراب', 'utensils'),
  (4, 'اختيارات نقل أفضل', 'اختبار مكوّن من 8 أسئلة حول: النقل والمواصلات', 'hard', 8, 40, 'النقل والمواصلات', 'car'),
  (5, 'سلة طعام متوازنة', 'اختبار مكوّن من 6 أسئلة حول: الطعام والشراب', 'medium', 6, 30, 'الطعام والشراب', 'utensils'),
  (6, 'تنقل واعٍ', 'اختبار مكوّن من 8 أسئلة حول: النقل والمواصلات', 'hard', 8, 40, 'النقل والمواصلات', 'car'),
  (7, 'جهازك بذكاء', 'اختبار مكوّن من 8 أسئلة حول: استخدام الأجهزة', 'hard', 8, 40, 'استخدام الأجهزة', 'bolt'),
  (8, 'تقليل هدر الطعام', 'اختبار مكوّن من 5 أسئلة حول: الطعام والشراب', 'easy', 5, 25, 'الطعام والشراب', 'utensils'),
  (9, 'وجبة مستدامة', 'اختبار مكوّن من 7 أسئلة حول: الطعام والشراب', 'medium', 7, 35, 'الطعام والشراب', 'utensils'),
  (10, 'علب وكرتون إلى تدوير', 'اختبار مكوّن من 5 أسئلة حول: إدارة النفايات', 'easy', 5, 25, 'إدارة النفايات', 'recycle'),
  (11, 'المبدأ: تقليل ثم إعادة استخدام', 'اختبار مكوّن من 6 أسئلة حول: إدارة النفايات', 'medium', 6, 30, 'إدارة النفايات', 'recycle'),
  (12, 'استخدام طاقة واعٍ', 'اختبار مكوّن من 7 أسئلة حول: استخدام الأجهزة', 'medium', 7, 35, 'استخدام الأجهزة', 'bolt'),
  (13, 'دراجتك والمدينة', 'اختبار مكوّن من 5 أسئلة حول: النقل والمواصلات', 'easy', 5, 25, 'النقل والمواصلات', 'car'),
  (14, 'فرز يعيد الحياة', 'اختبار مكوّن من 8 أسئلة حول: إدارة النفايات', 'hard', 8, 40, 'إدارة النفايات', 'recycle'),
  (15, 'توفير الكهرباء في المنزل', 'اختبار مكوّن من 8 أسئلة حول: استخدام الأجهزة', 'hard', 8, 40, 'استخدام الأجهزة', 'bolt'),
  (16, 'شراء ذكي للأغذية', 'اختبار مكوّن من 5 أسئلة حول: الطعام والشراب', 'easy', 5, 25, 'الطعام والشراب', 'utensils'),
  (17, 'مهارات الاستخدام الرشيد', 'اختبار مكوّن من 6 أسئلة حول: استخدام الأجهزة', 'medium', 6, 30, 'استخدام الأجهزة', 'bolt'),
  (18, 'مياه شرب مستدامة', 'اختبار مكوّن من 6 أسئلة حول: الطعام والشراب', 'medium', 6, 30, 'الطعام والشراب', 'utensils'),
  (19, 'فطور أخضر', 'اختبار مكوّن من 5 أسئلة حول: الطعام والشراب', 'easy', 5, 25, 'الطعام والشراب', 'utensils'),
  (20, 'مطبخ صديق للبيئة', 'اختبار مكوّن من 6 أسئلة حول: الطعام والشراب', 'medium', 6, 30, 'الطعام والشراب', 'utensils'),
  (21, 'طعام محلي وأثر أقل', 'اختبار مكوّن من 5 أسئلة حول: الطعام والشراب', 'easy', 5, 25, 'الطعام والشراب', 'utensils'),
  (22, 'مصابيح وكفاءة', 'اختبار مكوّن من 7 أسئلة حول: استخدام الأجهزة', 'medium', 7, 35, 'استخدام الأجهزة', 'bolt'),
  (23, 'رحلة خفيفة الانبعاثات', 'اختبار مكوّن من 6 أسئلة حول: النقل والمواصلات', 'medium', 6, 30, 'النقل والمواصلات', 'car'),
  (24, 'مبادئ الكفاءة المنزلية', 'اختبار مكوّن من 6 أسئلة حول: استخدام الأجهزة', 'medium', 6, 30, 'استخدام الأجهزة', 'bolt'),
  (25, 'اختيارات غذائية واعية', 'اختبار مكوّن من 6 أسئلة حول: الطعام والشراب', 'medium', 6, 30, 'الطعام والشراب', 'utensils'),
  (26, 'الطعام والشراب • عنوان فريد', 'اختبار مكوّن من 8 أسئلة حول: الطعام والشراب', 'hard', 8, 40, 'الطعام والشراب', 'utensils'),
  (27, 'تنقل مستدام', 'اختبار مكوّن من 7 أسئلة حول: النقل والمواصلات', 'medium', 7, 35, 'النقل والمواصلات', 'car'),
  (28, 'الطعام والشراب • عنوان فريد', 'اختبار مكوّن من 8 أسئلة حول: الطعام والشراب', 'hard', 8, 40, 'الطعام والشراب', 'utensils'),
  (29, 'مواصلات صديقة للبيئة', 'اختبار مكوّن من 6 أسئلة حول: النقل والمواصلات', 'medium', 6, 30, 'النقل والمواصلات', 'car'),
  (30, 'الطعام والشراب • عنوان فريد', 'اختبار مكوّن من 6 أسئلة حول: الطعام والشراب', 'medium', 6, 30, 'الطعام والشراب', 'utensils'),
  (31, 'سلوكيات على الطريق', 'اختبار مكوّن من 5 أسئلة حول: النقل والمواصلات', 'easy', 5, 25, 'النقل والمواصلات', 'car')
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  difficulty = EXCLUDED.difficulty,
  time_limit_minutes = EXCLUDED.time_limit_minutes,
  points = EXCLUDED.points,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon;

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer_index, explanation) VALUES
  (1, 'اختيار مياه الشرب الأكثر استدامة عادةً:', ARRAY['مياه الصنبور المفلترة', 'استيراد مياه من الخارج', 'استخدام أكواب بلاستيكية يوميًا', 'المياه المعبأة الفردية'], 0, NULL),
  (1, 'أفضل تسلسل للتعامل مع النفايات هو:', ARRAY['إعادة تدوير > تقليل > إعادة استخدام', 'رمي > دفن > حرق', 'تقليل > إعادة استخدام > إعادة تدوير', 'حرق > دفن > رمي'], 2, NULL),
  (1, 'ما أثر صيانة الإطارات بضغط مناسب؟', ARRAY['تتلف المحرك', 'لا تأثير', 'تقلل استهلاك الوقود', 'تزيد الانبعاثات'], 2, NULL),
  (1, 'لتقليل البلاستيك أحادي الاستخدام نختار:', ARRAY['أكواب استعمال لمرة', 'شلمونات بلاستيكية دائمة', 'أكياس بلاستيكية لكل شراء', 'زجاجة قابلة لإعادة التعبئة'], 3, NULL),
  (1, 'لتقليل البلاستيك أحادي الاستخدام نختار:', ARRAY['زجاجة قابلة لإعادة التعبئة', 'أكواب استعمال لمرة', 'أكياس بلاستيكية لكل شراء', 'شلمونات بلاستيكية دائمة'], 0, NULL),
  (1, 'أي وسيلة نقل هي الأكثر صداقة للبيئة في المشاوير القصيرة؟', ARRAY['المشي أو الدراجة', 'السيارة الخاصة منفردًا', 'الدراجة النارية', 'التاكسي منفردًا'], 0, NULL),
  (1, 'أي من التالي قابل لإعادة التدوير في أغلب المدن؟', ARRAY['الأتربة والرمال', 'المناديل المتسخة', 'بقايا الطعام', 'الورق والكرتون الجاف'], 3, NULL),
  (1, 'أي وقود أو تقنية تقلل الانبعاثات؟', ARRAY['القيادة في ازدحام بلا إطفاء', 'محركات قديمة', 'وقود منخفض الجودة', 'المركبات الكهربائية/الهجينة'], 3, NULL),
  (2, 'ما أفضل طريقة لشحن الهاتف لخفض الهدر؟', ARRAY['فصل الشاحن بعد اكتمال الشحن', 'تركه موصولًا طوال الليل', 'الشحن مع غطاء حراري سميك', 'استخدام شاحن ضعيف جدًا'], 0, NULL),
  (2, 'تقليل استهلاك اللحوم الحمراء يؤدي إلى:', ARRAY['لا تأثير', 'ارتفاع استخدام المياه', 'زيادة الهدر', 'خفض البصمة الكربونية'], 3, NULL),
  (2, 'أي وقود أو تقنية تقلل الانبعاثات؟', ARRAY['وقود منخفض الجودة', 'محركات قديمة', 'المركبات الكهربائية/الهجينة', 'القيادة في ازدحام بلا إطفاء'], 2, NULL),
  (2, 'أفضل خيار لتقليل انبعاثات الذهاب إلى الجامعة هو:', ARRAY['الذهاب بسيارة فردية يوميًا', 'القيادة بسرعة عالية', 'المواصلات العامة أو مشاركة الركوب', 'تشغيل السيارة والتوقف طويلًا'], 2, NULL),
  (2, 'أي من التالي قابل لإعادة التدوير في أغلب المدن؟', ARRAY['بقايا الطعام', 'المناديل المتسخة', 'الأتربة والرمال', 'الورق والكرتون الجاف'], 3, NULL),
  (2, 'ما الخطوة الأكثر فاعلية لتقليل استهلاك الكهرباء في المنزل؟', ARRAY['إطفاء الأجهزة غير المستخدمة', 'ترك الأجهزة على وضع الاستعداد', 'تشغيل المكيف مع فتح النوافذ', 'رفع الإضاءة لأقصى درجة'], 0, NULL),
  (2, 'أي خيار فطور أكثر استدامة؟', ARRAY['حبوب كاملة مع فاكهة موسمية', 'أطعمة مُغلفة فرديًا بكثرة', 'لحم معبأ يوميًا', 'منتجات مستوردة بطيران مبرد'], 0, NULL),
  (3, 'لتقليل البلاستيك أحادي الاستخدام نختار:', ARRAY['شلمونات بلاستيكية دائمة', 'زجاجة قابلة لإعادة التعبئة', 'أكياس بلاستيكية لكل شراء', 'أكواب استعمال لمرة'], 1, NULL),
  (3, 'أفضل طريقة لتقليل هدر الطعام في المنزل:', ARRAY['تجاهل تاريخ الصلاحية', 'ترك بقايا الطعام دون حفظ', 'تخطيط الوجبات وقوائم الشراء', 'شراء كميات كبيرة عشوائيًا'], 2, NULL),
  (3, 'كيف نتأكد من كفاءة جهاز كهربائي قبل الشراء؟', ARRAY['اختيار الأرخص فقط', 'التحقق من بطاقة كفاءة الطاقة', 'عدم النظر للمواصفات', 'اختيار الجهاز الأكبر حجمًا'], 1, NULL),
  (3, 'أفضل خيار لتقليل انبعاثات الذهاب إلى الجامعة هو:', ARRAY['المواصلات العامة أو مشاركة الركوب', 'القيادة بسرعة عالية', 'تشغيل السيارة والتوقف طويلًا', 'الذهاب بسيارة فردية يوميًا'], 0, NULL),
  (3, 'تقليل استهلاك اللحوم الحمراء يؤدي إلى:', ARRAY['خفض البصمة الكربونية', 'ارتفاع استخدام المياه', 'زيادة الهدر', 'لا تأثير'], 0, NULL),
  (3, 'أي وسيلة نقل هي الأكثر صداقة للبيئة في المشاوير القصيرة؟', ARRAY['الدراجة النارية', 'المشي أو الدراجة', 'التاكسي منفردًا', 'السيارة الخاصة منفردًا'], 1, NULL),
  (3, 'كيف يساهم شراء الأغذية المحلية؟', ARRAY['لا تأثير', 'يقلل انبعاثات النقل', 'يرفع هدر الطعام', 'يزيد التغليف غير الضروري'], 1, NULL),
  (3, 'اختيار مياه الشرب الأكثر استدامة عادةً:', ARRAY['استيراد مياه من الخارج', 'المياه المعبأة الفردية', 'مياه الصنبور المفلترة', 'استخدام أكواب بلاستيكية يوميًا'], 2, NULL),
  (4, 'أفضل طريقة لتقليل هدر الطعام في المنزل:', ARRAY['شراء كميات كبيرة عشوائيًا', 'ترك بقايا الطعام دون حفظ', 'تخطيط الوجبات وقوائم الشراء', 'تجاهل تاريخ الصلاحية'], 2, NULL),
  (4, 'تقليل استهلاك اللحوم الحمراء يؤدي إلى:', ARRAY['لا تأثير', 'زيادة الهدر', 'خفض البصمة الكربونية', 'ارتفاع استخدام المياه'], 2, NULL),
  (4, 'ما أثر صيانة الإطارات بضغط مناسب؟', ARRAY['تتلف المحرك', 'تقلل استهلاك الوقود', 'تزيد الانبعاثات', 'لا تأثير'], 1, NULL),
  (4, 'كيف نتأكد من كفاءة جهاز كهربائي قبل الشراء؟', ARRAY['عدم النظر للمواصفات', 'التحقق من بطاقة كفاءة الطاقة', 'اختيار الأرخص فقط', 'اختيار الجهاز الأكبر حجمًا'], 1, NULL),
  (4, 'أفضل خيار لتقليل انبعاثات الذهاب إلى الجامعة هو:', ARRAY['الذهاب بسيارة فردية يوميًا', 'القيادة بسرعة عالية', 'المواصلات العامة أو مشاركة الركوب', 'تشغيل السيارة والتوقف طويلًا'], 0, NULL),
  (4, 'أي وسيلة نقل هي الأكثر صداقة للبيئة في المشاوير القصيرة؟', ARRAY['الدراجة النارية', 'التاكسي منفردًا', 'السيارة الخاصة منفردًا', 'المشي أو الدراجة'], 3, NULL),
  (4, 'ما الخطوة الأكثر فاعلية لتقليل استهلاك الكهرباء في المنزل؟', ARRAY['إطفاء الأجهزة غير المستخدمة', 'رفع الإضاءة لأقصى درجة', 'ترك الأجهزة على وضع الاستعداد', 'تشغيل المكيف مع فتح النوافذ'], 0, NULL),
  (4, 'أي وسيلة نقل هي الأكثر صداقة للبيئة في المشاوير القصيرة؟', ARRAY['السيارة الخاصة منفردًا', 'التاكسي منفردًا', 'المشي أو الدراجة', 'الدراجة النارية'], 2, NULL),
  (5, 'أفضل خيار لتقليل انبعاثات الذهاب إلى الجامعة هو:', ARRAY['الذهاب بسيارة فردية يوميًا', 'القيادة بسرعة عالية', 'المواصلات العامة أو مشاركة الركوب', 'تشغيل السيارة والتوقف طويلًا'], 2, NULL)
ON CONFLICT DO NOTHING;

-- 21) Misc safety & defaults updates (idempotent)
ALTER TABLE public.user_profiles ALTER COLUMN points SET DEFAULT 0;
ALTER TABLE public.user_profiles ALTER COLUMN created_at SET DEFAULT now();

-- 22) Final note: Ensure supabase auth triggers
-- If you use Supabase, ensure the handle_new_user trigger is attached to auth.users (uncomment earlier lines).
-- End of deploy.sql