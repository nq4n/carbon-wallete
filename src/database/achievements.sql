-- This script is fully idempotent and will reset the achievements schema on each run.

-- 1. Drop existing tables in reverse order of dependency.
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;

-- 2. Create the achievements table.
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  points_reward INT NOT NULL DEFAULT 0,
  icon_name TEXT,
  target_value INT
);

-- 3. Create the table to track user progress.
CREATE TABLE public.user_achievements (
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  progress INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, achievement_id)
);

-- 4. Enable RLS and create policies.
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achievements_read_all" ON public.achievements
  FOR SELECT USING (true);

CREATE POLICY "user_achievements_read_own" ON public.user_achievements
  FOR SELECT USING (user_id = public.uid());

CREATE POLICY "achievements_write_admin" ON public.achievements
  FOR ALL USING (false) WITH CHECK (false);

CREATE POLICY "user_achievements_write_admin" ON public.user_achievements
  FOR ALL USING (false) WITH CHECK (false);
