-- This script is idempotent and will reset the quizzes schema on each run.
-- It creates a schema that matches the EcoQuizzes.tsx component.

-- 1. Drop existing objects in reverse order of dependency.
DROP TABLE IF EXISTS public.user_quiz_attempts CASCADE;
DROP TABLE IF EXISTS public.quiz_questions CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TYPE IF EXISTS public.quiz_difficulty;

-- 2. Create ENUM types for structured data.
CREATE TYPE public.quiz_difficulty AS ENUM (
  'easy',
  'medium',
  'hard'
);

-- 3. Create the main quizzes table.
CREATE TABLE public.quizzes (
  id INT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  difficulty public.quiz_difficulty,
  time_limit_minutes INT,
  points INT,
  category TEXT,
  icon TEXT -- Stores the name of the lucide-react icon
);

-- 4. Create the questions table, linked to the quizzes table.
CREATE TABLE public.quiz_questions (
  id SERIAL PRIMARY KEY,
  quiz_id INT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL, -- Storing options as an array of text
  correct_answer_index INT NOT NULL,
  explanation TEXT
);

-- 5. Create a table to track user attempts and scores.
CREATE TABLE public.user_quiz_attempts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  quiz_id INT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score >= 0 AND score <= 100),
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, quiz_id) -- Ensures a user has only one official score per quiz
);

-- 6. Enable Row Level Security for all tables.
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quizzes_read_all" ON public.quizzes FOR SELECT USING (true);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_questions_read_all" ON public.quiz_questions FOR SELECT USING (true);

ALTER TABLE public.user_quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_quiz_attempts_read_own" ON public.user_quiz_attempts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "user_quiz_attempts_write_own" ON public.user_quiz_attempts FOR INSERT WITH CHECK (user_id = auth.uid());


-- 7. Insert the initial data from the EcoQuizzes.tsx component.
-- The 'icon' column now uses names that will be mapped to lucide-react icons.
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

-- Questions for Quiz 1
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer_index, explanation) VALUES
(1, 'ما هي البصمة الكربونية؟', ARRAY['كمية الكربون الموجودة في الجو', 'إجمالي الغازات الدفيئة المنبعثة من الأنشطة البشرية', 'نوع من أنواع التلوث', 'مصطلح يستخدم في الكيمياء فقط'], 1, 'البصمة الكربونية هي إجمالي الغازات الدفيئة المنبعثة مباشرة أو غير مباشرة من الأنشطة البشرية.'),
(1, 'أي من هذه الأنشطة له أكبر أثر على البيئة؟', ARRAY['استخدام الكمبيوتر لساعة واحدة', 'طباعة 100 ورقة', 'السفر بالطائرة لمسافة 1000 كم', 'شرب كوب من القهوة'], 2, 'السفر بالطائرة له أكبر أثر على البيئة بسبب الانبعاثات العالية للوقود.'),
(1, 'ما هي إعادة التدوير؟', ARRAY['التخلص من النفايات', 'إعادة استخدام المواد لصنع منتجات جديدة', 'حرق النفايات', 'دفن النفايات في الأرض'], 1, 'إعادة التدوير هي عملية تحويل النفايات إلى مواد جديدة ومفيدة.');

-- Questions for Quiz 2
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer_index, explanation) VALUES
(2, 'ما هي أفضل طريقة لتوفير الطاقة في قاعات المحاضرات؟', ARRAY['ترك الأضواء مضاءة دائماً', 'استخدام الإضاءة الطبيعية عند الإمكان', 'زيادة التكييف', 'استخدام أجهزة إضافية'], 1, 'استخدام الإضاءة الطبيعية يقلل من استهلاك الكهرباء ويوفر الطاقة.'),
(2, 'كم يمكن توفيره من الطاقة عند إطفاء الكمبيوتر بدلاً من وضعه في وضع الاستعداد؟', ARRAY['10-20%', '30-40%', '50-60%', '70-80%'], 3, 'إطفاء الكمبيوتر بالكامل يوفر 70-80% من الطاقة مقارنة بوضع الاستعداد.');

-- Questions for Quiz 3
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer_index, explanation) VALUES
(3, 'ما هو مبدأ الاقتصاد الدائري؟', ARRAY['إنتاج أكبر كمية من السلع', 'تقليل، إعادة الاستخدام، إعادة التدوير', 'زيادة الاستهلاك', 'استخدام مواد جديدة فقط'], 1, 'الاقتصاد الدائري يقوم على مبدأ تقليل النفايات وإعادة استخدام الموارد.');

