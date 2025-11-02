-- =================================================================================================
-- Green Pulse - Safe Script to Recreate Challenges
-- =================================================================================================
-- This script safely creates the challenges tables and inserts default challenge data.
-- It uses "IF NOT EXISTS" to avoid errors if the tables somehow already exist.
-- It will not delete any other data.
-- -------------------------------------------------------------------------------------------------

BEGIN;

-- 1. Create the 'challenges' table
-- This table stores the master list of all available challenges.
CREATE TABLE IF NOT EXISTS public.challenges (
  id serial primary key,
  title text not null,
  description text not null,
  points_reward integer not null,
  due_date timestamptz, -- The challenge might have an expiry date
  created_at timestamptz not null default now()
);

-- 2. Create the 'user_completed_challenges' table
-- This is a simple link table to track which user has completed which challenge.
CREATE TABLE IF NOT EXISTS public.user_completed_challenges (
  id serial primary key,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  challenge_id integer not null references public.challenges(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique(user_id, challenge_id) -- Ensures a user can't complete the same challenge twice
);

-- 3. Insert Default Challenge Data
-- We use ON CONFLICT DO NOTHING to prevent creating duplicate challenges if this script is run more than once.
INSERT INTO public.challenges (title, description, points_reward, due_date)
VALUES
  ('أسبوع بلا سيارة', 'استخدم وسائل النقل العام أو الدراجة أو المشي لمدة أسبوع كامل.', 150, now() + interval '30 days'),
  ('خبير إعادة التدوير', 'سجل 10 أنشطة إعادة تدوير مختلفة هذا الشهر.', 100, now() + interval '30 days'),
  ('توفير الطاقة', 'قلل من استهلاك الطاقة في منزلك بنسبة 10%.', 200, now() + interval '60 days'),
  ('مبادرة الطعام النباتي', 'سجل 5 وجبات نباتية هذا الأسبوع.', 75, now() + interval '7 days'),
  ('بطل تقليل النفايات', 'أكمل 3 أيام دون أي نفايات ذات استخدام واحد.', 50, now() + interval '14 days')
ON CONFLICT DO NOTHING;

-- 4. Setup Row Level Security (RLS)
-- This ensures that users can see all challenges but can only manage their own completed entries.

-- Allow public read access to the list of challenges
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read challenges" ON public.challenges;
CREATE POLICY "Public can read challenges" ON public.challenges FOR SELECT USING (true);

-- Allow users to manage their own completed challenges
ALTER TABLE public.user_completed_challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own completed challenges" ON public.user_completed_challenges;
CREATE POLICY "Users can manage their own completed challenges" ON public.user_completed_challenges FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMIT;