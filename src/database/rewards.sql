-- This script is fully idempotent and will reset the rewards schema on each run.

-- 1. Drop existing objects in reverse order of dependency.
DROP TABLE IF EXISTS public.rewards CASCADE;
DROP TYPE IF EXISTS public.reward_category;

-- 2. Create the ENUM type with all correct values.
CREATE TYPE public.reward_category AS ENUM (
  'food',
  'academic',
  'merchandise',
  'experiences'
);

-- 3. Create the rewards table using the new ENUM.
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  points_cost INT NOT NULL DEFAULT 0,
  category public.reward_category,
  available BOOLEAN NOT NULL DEFAULT true,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Enable RLS and create policies.
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rewards_read_all" ON public.rewards
  FOR SELECT USING (true);

CREATE POLICY "rewards_write_admin" ON public.rewards
  FOR ALL USING (false) WITH CHECK (false);

-- 5. Insert the initial rewards data. This will not cause conflicts as the table is fresh.
INSERT INTO public.rewards (id, title, description, points_cost, category, available)
VALUES
  ('f68f8b72-5e60-4ea3-9689-1a73a6e87a2d', 'قهوة مجانية', 'مشروب مجاني من كافيتيريا الجامعة', 50, 'food', true),
  ('8a2c3a6e-8e81-4b2a-9b9c-5e5d3c8c7b8a', 'خصم 20% على الكتب', 'خصم على جميع الكتب من مكتبة الجامعة', 200, 'academic', true),
  ('e3a4f6d8-1b2c-4e5f-8a9b-0c1d2e3f4a5b', 'حقيبة الجامعة البيئية', 'حقيبة مصنوعة من مواد معاد تدويرها', 500, 'merchandise', true),
  ('c7b8e9f0-3d4a-5b6c-7a8b-9c0d1e2f3a4b', 'وجبة غداء صحية', 'وجبة عضوية من المطعم الصحي', 150, 'food', true),
  ('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'جولة بيئية خاصة', 'جولة في مرافق الجامعة المستدامة', 300, 'experiences', false);
