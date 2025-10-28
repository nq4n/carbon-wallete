-- إعداد قاعدة البيانات للمحفظة الكربونية الرقمية
-- يجب تشغيل هذه الأوامر في Supabase SQL Editor

-- إنشاء جدول ملفات المستخدمين
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'employee')),
  university_id TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  avatar_url TEXT,
  level TEXT DEFAULT 'مبتدئ',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الأنشطة البيئية
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('transport', 'energy', 'waste', 'food')),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  carbon_saved DECIMAL(10,2) NOT NULL,
  points_earned INTEGER NOT NULL,
  location TEXT,
  verified BOOLEAN DEFAULT false,
  qr_scanned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول مشتريات المتجر الأخضر
CREATE TABLE green_store_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  points_cost INTEGER NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'cancelled')),
  delivery_address TEXT,
  delivery_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الاختبارات البيئية
CREATE TABLE quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_title TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  points_earned INTEGER NOT NULL,
  time_taken INTEGER, -- بالثواني
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول التعلم البيئي المكتمل
CREATE TABLE learning_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id INTEGER NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'infographic', 'article')),
  points_earned INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء indexes لتحسين الأداء
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);
CREATE INDEX idx_green_store_purchases_user_id ON green_store_purchases(user_id);
CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX idx_learning_progress_user_id ON learning_progress(user_id);

-- إعداد Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE green_store_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للملفات الشخصية
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- سياسات الأمان للأنشطة
CREATE POLICY "Users can view their own activities" ON activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" ON activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" ON activities
  FOR UPDATE USING (auth.uid() = user_id);

-- سياسات الأمان لمشتريات المتجر الأخضر
CREATE POLICY "Users can view their own purchases" ON green_store_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases" ON green_store_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- سياسات الأمان لنتائج الاختبارات
CREATE POLICY "Users can view their own quiz results" ON quiz_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz results" ON quiz_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- سياسات الأمان لتقدم التعلم
CREATE POLICY "Users can view their own learning progress" ON learning_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning progress" ON learning_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- تحديث النقاط تلقائياً عند إضافة نشاط جديد
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles
  SET points = points + NEW.points_earned,
      updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء triggers لتحديث النقاط
CREATE TRIGGER trigger_update_points_activities
  AFTER INSERT ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_user_points();

CREATE TRIGGER trigger_update_points_quiz
  AFTER INSERT ON quiz_results
  FOR EACH ROW
  EXECUTE FUNCTION update_user_points();

CREATE TRIGGER trigger_update_points_learning
  AFTER INSERT ON learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_user_points();

-- إدراج بعض البيانات التجريبية
INSERT INTO auth.users (id, email, created_at, updated_at)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'demo@squ.edu.om', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_profiles (id, email, name, user_type, university_id, department, points, level)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'demo@squ.edu.om',
  'أحمد محمد الأحمدي',
  'student',
  '202301234',
  'هندسة البرمجيات',
  1250,
  'صديق البيئة'
) ON CONFLICT (id) DO NOTHING;