DO $$ BEGIN
    CREATE TYPE public.notification_type AS ENUM ('challenge_completed', 'milestone_unlocked', 'reward_redeemed', 'new_recommendation');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_coupons (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    coupon_code TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    is_redeemed BOOLEAN DEFAULT false,
    redeemed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS redeemed_coupons TEXT[];

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

ALTER TABLE public.user_coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own coupons" ON public.user_coupons;
CREATE POLICY "Users can view their own coupons" ON public.user_coupons FOR SELECT
    USING (auth.uid() = user_id);
