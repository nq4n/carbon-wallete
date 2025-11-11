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
do $$ begin create type public.activity_kind as enum ('transport', 'energy', 'waste', 'food'); exception when duplicate_object then null; end $$;
do $$ begin create type public.reward_kind as enum ('product', 'voucher', 'discount'); exception when duplicate_object then null; end $$;
do $$ begin create type public.order_status as enum ('pending','approved','rejected','fulfilled','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type public.challenge_type as enum ('activity_based', 'goal_based'); exception when duplicate_object then null; end $$;
do $$ begin create type public.challenge_status as enum ('active', 'completed', 'expired'); exception when duplicate_object then null; end $$;
do $$ begin create type public.product_category as enum ('cups', 'office', 'tech', 'accessories'); exception when duplicate_object then null; end $$;
do $$ begin create type public.quiz_difficulty as enum ('easy', 'medium', 'hard'); exception when duplicate_object then null; end $$;

-- 2. Tables
-- Create tables only if they do not exist. Your data in existing tables is safe.
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  gender gender_kind,
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
  activity_code text not null references public.activity_catalog(code) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  points_reward int not null default 0,
  due_date timestamptz,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.user_completed_challenges (
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS public.quizzes (
  id INT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  difficulty public.quiz_difficulty,
  time_limit_minutes INT,
  points INT,
  category TEXT,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id SERIAL PRIMARY KEY,
  quiz_id INT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer_index INT NOT NULL,
  explanation TEXT
);

CREATE TABLE IF NOT EXISTS public.user_quiz_attempts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  quiz_id INT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score >= 0 AND score <= 100),
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, quiz_id)
);

CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id INT PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INT NOT NULL,
  original_price INT,
  category public.product_category,
  image TEXT,
  rating NUMERIC(2, 1),
  reviews INT,
  eco_points INT,
  in_stock INT,
  features TEXT[],
  is_new BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- 3. Row Level Security (RLS)
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

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "challenges_read_all" ON public.challenges;
CREATE POLICY "challenges_read_all" ON public.challenges FOR SELECT USING (true);

ALTER TABLE public.user_completed_challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_completed_challenges_read_own" ON public.user_completed_challenges;
CREATE POLICY "user_completed_challenges_read_own" ON public.user_completed_challenges FOR SELECT USING (user_id = public.uid());

ALTER TABLE public.activity_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read activity catalog" ON public.activity_catalog;
CREATE POLICY "Public can read activity catalog" ON public.activity_catalog FOR SELECT USING (true);

ALTER TABLE public.rewards_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read rewards catalog" ON public.rewards_catalog;
CREATE POLICY "Public can read rewards catalog" ON public.rewards_catalog FOR SELECT USING (true);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "quizzes_read_all" ON public.quizzes;
CREATE POLICY "quizzes_read_all" ON public.quizzes FOR SELECT USING (true);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "quiz_questions_read_all" ON public.quiz_questions;
CREATE POLICY "quiz_questions_read_all" ON public.quiz_questions FOR SELECT USING (true);

ALTER TABLE public.user_quiz_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_quiz_attempts_read_own" ON public.user_quiz_attempts;
CREATE POLICY "user_quiz_attempts_read_own" ON public.user_quiz_attempts FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "user_quiz_attempts_write_own" ON public.user_quiz_attempts;
CREATE POLICY "user_quiz_attempts_write_own" ON public.user_quiz_attempts FOR INSERT WITH CHECK (user_id = auth.uid());

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shops_read_all" ON public.shops;
CREATE POLICY "shops_read_all" ON public.shops FOR SELECT USING (true);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_read_all" ON public.products;
CREATE POLICY "products_read_all" ON public.products FOR SELECT USING (true);

-- 4. Database Functions
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
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_points_per_unit INTEGER;
    v_carbon_saved DECIMAL;
    v_points_earned INTEGER;
BEGIN
    v_points_per_unit := round(COALESCE(p_carbon_factor, 0) * 10);

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
        name = EXCLUDED.name,
        carbon_factor = EXCLUDED.carbon_factor,
        points_per_unit = EXCLUDED.points_per_unit;

    v_carbon_saved := COALESCE(p_quantity, 0) * COALESCE(p_carbon_factor, 0);
    v_points_earned := floor(COALESCE(p_quantity, 0) * v_points_per_unit);

    INSERT INTO public.activity_log(user_id, activity_code, quantity, carbon_saved, points_earned, notes)
    VALUES (p_user_id, p_activity_code, COALESCE(p_quantity, 0), v_carbon_saved, v_points_earned, p_notes);

    UPDATE public.user_profiles
    SET points = points + v_points_earned
    WHERE id = p_user_id;

    RETURN v_points_earned;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_challenge(p_challenge_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_points_to_award integer;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.user_completed_challenges
    WHERE user_id = p_user_id AND challenge_id = p_challenge_id
  ) THEN
    RAISE EXCEPTION 'User has already completed this challenge';
  END IF;

  SELECT points_reward
  INTO v_points_to_award
  FROM public.challenges
  WHERE id = p_challenge_id;

  INSERT INTO public.user_completed_challenges (user_id, challenge_id)
  VALUES (p_user_id, p_challenge_id);

  UPDATE public.user_profiles
  SET points = points + v_points_to_award
  WHERE id = p_user_id;

END;
$$;

CREATE OR REPLACE FUNCTION increment_user_points(p_user_id UUID, p_points INT)
RETURNS VOID AS $$
BEGIN
  PERFORM FROM public.user_profiles
  WHERE id = p_user_id
  FOR UPDATE;

  UPDATE public.user_profiles
  SET points = points + p_points
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

create or replace function public.touch_user_profiles()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- 5. Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

drop trigger if exists on_user_profiles_update on public.user_profiles;
create trigger on_user_profiles_update
  before update on public.user_profiles
  for each row execute function public.touch_user_profiles();

-- 6. Insert initial data
INSERT INTO public.shops (id, name, description)
VALUES ('1e9f6c28-4e94-4b8c-9a4c-8e4a9e5b2b9f', 'متجر الجامعة الأخضر', 'منتجات مستدامة وصديقة للبيئة مقدمة من الجامعة.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, shop_id, name, description, price, original_price, category, image, rating, reviews, eco_points, in_stock, features, is_new, is_popular)
VALUES
  (1, '1e9f6c28-4e94-4b8c-9a4c-8e4a9e5b2b9f', 'كوب القهوة البامبو الطبيعي', 'كوب قابل لإعادة الاستخدام مصنوع من ألياف البامبو الطبيعية', 250, 350, 'cups', 'https://images.unsplash.com/photo-1641754644192-24e09c2b444b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY28lMjBjdXBzJTIwYmFtYm9vfGVufDF8fHx8MTc1NjcwNzk5Mnww&ixlib=rb-4.1.0&q=80&w=1080', 4.8, 156, 15, 45, '{"مقاوم للحرارة", "قابل للتحلل", "غطاء محكم"}', false, true),
  (2, '1e9f6c28-4e94-4b8c-9a4c-8e4a9e5b2b9f', 'دفتر ملاحظات معاد التدوير', 'دفتر أنيق مصنوع من الورق المعاد تدويره 100%', 180, NULL, 'office', 'https://images.unsplash.com/photo-1625533617580-3977f2651fc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWN5Y2xlZCUyMG5vdGVib29rJTIwb2ZmaWNlfGVufDF8fHx8MTc1NjcwNzk5Nnww&ixlib=rb-4.1.0&q=80&w=1080', 4.6, 89, 10, 32, '{"ورق معاد التدوير", "غلاف طبيعي", "200 صفحة"}', true, false),
  (3, '1e9f6c28-4e94-4b8c-9a4c-8e4a9e5b2b9f', 'شاحن لاسلكي بالطاقة الشمسية', 'شاحن ذكي يعمل بالطاقة الشمسية لجميع الأجهزة', 450, 600, 'tech', 'https://images.unsplash.com/photo-1739268984311-b478fccf256e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMHdpcmVsZXNzJTIwY2hhcmdlcnxlbnwxfHx8fDE3NTY3MDgwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080', 4.9, 203, 25, 18, '{"طاقة شمسية", "شحن لاسلكي", "مقاوم للماء"}', false, true),
  (4, '1e9f6c28-4e94-4b8c-9a4c-8e4a9e5b2b9f', 'قلم حبر من الخشب المستدام', 'أقلام فاخرة مصنوعة من أخشاب مستدامة معتمدة', 120, NULL, 'office', 'https://images.unsplash.com/photo-1616782910751-d48be696d41c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMHdvb2RlbiUyMHBlbnxlbnwxfHx8fDE3NTY3MDgwMDR8MA&ixlib=rb-4.1.0&q=80&w=1080', 4.4, 67, 8, 76, '{"خشب مستدام", "حبر طبيعي", "تصميم أنيق"}', false, false),
  (5, '1e9f6c28-4e94-4b8c-9a4c-8e4a9e5b2b9f', 'حقيبة تسوق قابلة للطي', 'حقيبة متينة قابلة للطي من المواد المعاد تدويرها', 95, NULL, 'accessories', 'https://images.unsplash.com/photo-1732963878674-651e7f5f71d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb2xkYWJsZSUyMHNob3BwaW5nJTIwYmFnJTIwZWNvfGVufDF8fHx8MTc1NjcwODAwN3ww&ixlib=rb-4.1.0&q=80&w=1080', 4.7, 124, 6, 89, '{"قابلة للطي", "متينة", "خفيفة الوزن"}', true, false),
  (6, '1e9f6c28-4e94-4b8c-9a4c-8e4a9e5b2b9f', 'زجاجة مياه ذكية معزولة', 'زجاجة مياه ذكية تحافظ على درجة الحرارة لـ 12 ساعة', 320, NULL, 'cups', 'https://images.unsplash.com/photo-1592999641298-434e28c11d14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMGluc3VsYXRlZCUyMHdhdGVyJTIwYm90dGxlfGVufDF8fHx8MTc1NjcwODAxMnww&ixlib=rb-4.1.0&q=80&w=1080', 4.8, 178, 18, 41, '{"عزل حراري", "مؤشر حرارة", "ستانلس ستيل"}', false, false),
  (7, '1e9f6c28-4e94-4b8c-9a4c-8e4a9e5b2b9f', 'بنك طاقة شمسي محمول', 'بنك طاقة عالي السعة يشحن بالطاقة الشمسية', 380, NULL, 'tech', 'https://images.unsplash.com/photo-1662078907135-129bc558e5f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0YWJsZSUyMHNvbGFyJTIwcG93ZXIlMjBiYW5rfGVufDF8fHx8MTc1NjcwODAxNnww&ixlib=rb-4.1.0&q=80&w=1080', 4.5, 145, 22, 27, '{"10000 مللي أمبير", "شحن سريع", "مقاوم للصدمات"}', false, false),
  (8, '1e9f6c28-4e94-4b8c-9a4c-8e4a9e5b2b9f', 'مجموعة أدوات مكتبية بيئية', 'مجموعة كاملة من الأدوات المكتبية الصديقة للبيئة', 280, 400, 'office', 'https://images.unsplash.com/photo-1584154033675-28a7436937bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY28lMjBvZmZpY2UlMjBzdXBwbGllcyUyMHNldHxlbnwxfHx8fDE3NTY3MDgwMTl8MA&ixlib=rb-4.1.0&q=80&w=1080', 4.6, 92, 16, 35, '{"8 قطع", "مواد طبيعية", "حقيبة منظمة"}', false, true)
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

INSERT INTO public.quizzes (id, title, description, difficulty, time_limit_minutes, points, category, icon) VALUES
(1, 'أساسيات البيئة والاستدامة', 'اختبار بسيط حول المفاهيم الأساسية للبيئة والاستدامة', 'easy', 5, 50, 'عام', 'leaf'),
(2, 'ترشيد الطاقة في الجامعة', 'اختبار متوسط حول طرق توفير الطاقة في البيئة الجامعية', 'medium', 8, 75, 'طاقة', 'zap'),
(3, 'إدارة النفايات المتقدمة', 'اختبار متقدم حول تقنيات إدارة النفايات والاقتصاد الدائري', 'hard', 12, 100, 'نفايات', 'recycle')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  difficulty = EXCLUDED.difficulty,
  time_limit_minutes = EXCLUDED.time_limit_minutes,
  points = EXCLUDED.points,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon;

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer_index, explanation) VALUES
(1, 'ما هي البصمة الكربونية؟', ARRAY['كمية الكربون الموجودة في الجو', 'إجمالي الغازات الدفيئة المنبعثة من الأنشطة البشرية', 'نوع من أنواع التلوث', 'مصطلح يستخدم في الكيمياء فقط'], 1, 'البصمة الكربونية هي إجمالي الغازات الدفيئة المنبعثة مباشرة أو غير مباشرة من الأنشطة البشرية.'),
(1, 'أي من هذه الأنشطة له أكبر أثر على البيئة؟', ARRAY['استخدام الكمبيوتر لساعة واحدة', 'طباعة 100 ورقة', 'السفر بالطائرة لمسافة 1000 كم', 'شرب كوب من القهوة'], 2, 'السفر بالطائرة له أكبر أثر على البيئة بسبب الانبعاثات العالية للوقود.'),
(1, 'ما هي إعادة التدوير؟', ARRAY['التخلص من النفايات', 'إعادة استخدام المواد لصنع منتجات جديدة', 'حرق النفايات', 'دفن النفايات في الأرض'], 1, 'إعادة التدوير هي عملية تحويل النفايات إلى مواد جديدة ومفيدة.'),
(2, 'ما هي أفضل طريقة لتوفير الطاقة في قاعات المحاضرات؟', ARRAY['ترك الأضواء مضاءة دائماً', 'استخدام الإضاءة الطبيعية عند الإمكان', 'زيادة التكييف', 'استخدام أجهزة إضافية'], 1, 'استخدام الإضاءة الطبيعية يقلل من استهلاك الكهرباء ويوفر الطاقة.'),
(2, 'كم يمكن توفيره من الطاقة عند إطفاء الكمبيوتر بدلاً من وضعه في وضع الاستعداد؟', ARRAY['10-20%', '30-40%', '50-60%', '70-80%'], 3, 'إطفاء الكمبيوتر بالكامل يوفر 70-80% من الطاقة مقارنة بوضع الاستعداد.'),
(3, 'ما هو مبدأ الاقتصاد الدائري؟', ARRAY['إنتاج أكبر كمية من السلع', 'تقليل، إعادة الاستخدام، إعادة التدوير', 'زيادة الاستهلاك', 'استخدام مواد جديدة فقط'], 1, 'الاقتصاد الدائري يقوم على مبدأ تقليل النفايات وإعادة استخدام الموارد.');

COMMIT;
