-- coupon_seeds.sql (corrected)

-- This script populates the database with a pool of coupon codes, correcting schema inconsistencies.

-- 1. Ensure the 'Free Coffee' reward exists in the primary rewards_catalog table.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.rewards_catalog WHERE name = 'قهوة مجانية') THEN
        INSERT INTO public.rewards_catalog (name, description, kind, points_cost, stock_quantity, is_active)
        VALUES ('قهوة مجانية', 'مشروب مجاني من كافيتيريا الجامعة', 'voucher', 50, 1000, true);
    END IF;
END $$;

-- 2. Drop the old coupon_pool table if it exists, to recreate it with the correct foreign key.
DROP TABLE IF EXISTS public.coupon_pool;

-- 3. Create the coupon_pool table, now correctly linked to rewards_catalog.
CREATE TABLE public.coupon_pool (
    id BIGSERIAL PRIMARY KEY,
    reward_catalog_id INTEGER NOT NULL REFERENCES public.rewards_catalog(id) ON DELETE CASCADE,
    coupon_code TEXT NOT NULL UNIQUE,
    is_claimed BOOLEAN NOT NULL DEFAULT false,
    claimed_by_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Seed the pool with 100 unique coupon codes for the 'Free Coffee' reward.
WITH reward AS (
    SELECT id FROM public.rewards_catalog WHERE name = 'قهوة مجانية' LIMIT 1
)
INSERT INTO public.coupon_pool (reward_catalog_id, coupon_code)
SELECT
    (SELECT id FROM reward),
    'FREE-COFFEE-' || LPAD(s::TEXT, 3, '0') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6))
FROM generate_series(1, 100) AS s
WHERE EXISTS (SELECT 1 FROM reward) -- Only run if the reward exists
ON CONFLICT (coupon_code) DO NOTHING;
