-- Alter the user_profiles table to add default values
-- This ensures that the automatic profile creation trigger works correctly.

-- Add default value for 'points' column
ALTER TABLE public.user_profiles
ALTER COLUMN points SET DEFAULT 0;

-- Add default value for 'created_at' column
ALTER TABLE public.user_profiles
ALTER COLUMN created_at SET DEFAULT now();
