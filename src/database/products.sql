-- This script is idempotent and will reset the shops and products schema on each run.

-- 1. Drop existing objects in reverse order of dependency.
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.shops CASCADE;
DROP TYPE IF EXISTS public.product_category;

-- 2. Create the ENUM type for product categories.
CREATE TYPE public.product_category AS ENUM (
  'cups',
  'office',
  'tech',
  'accessories'
);

-- 3. Create the shops table.
CREATE TABLE public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create the products table with a foreign key to shops.
CREATE TABLE public.products (
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

-- 5. Enable RLS and create policies.
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shops_read_all" ON public.shops
  FOR SELECT USING (true);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_read_all" ON public.products
  FOR SELECT USING (true);

-- 6. Insert a default shop.
-- Using a fixed UUID makes it easy to reference in the products insert.
INSERT INTO public.shops (id, name, description)
VALUES ('1e9f6c28-4e94-4b8c-9a4c-8e4a9e5b2b9f', 'متجر الجامعة الأخضر', 'منتجات مستدامة وصديقة للبيئة مقدمة من الجامعة.')
ON CONFLICT (id) DO NOTHING;


-- 7. Insert the initial product data, linking them to the shop.
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
