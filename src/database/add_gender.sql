-- Migration script to add the 'gender' field to the user_profiles table.
-- This script is safe to run on an existing database with data.

-- 1. Create the custom ENUM type for gender, if it doesn't already exist.
DO $$ BEGIN
  CREATE TYPE public.gender_kind AS ENUM ('male', 'female');
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'type "gender_kind" already exists, skipping';
END $$;

-- 2. Add the 'gender' column to the user_profiles table.
-- This command is non-destructive and will not affect existing data.
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS gender gender_kind;

-- 3. Update the handle_new_user function to include the new 'gender' field.
-- This replaces the existing function with a new version that can process the gender.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET SEARCH_PATH = public
AS $$
DECLARE
  meta_user_type_text TEXT;
  meta_gender_text TEXT;
BEGIN
  -- Extract metadata from the new user object
  meta_user_type_text := new.raw_user_meta_data->>'user_type';
  meta_gender_text := new.raw_user_meta_data->>'gender';

  -- Insert into user_profiles, now including gender
  INSERT INTO public.user_profiles (id, email, name, gender, user_type, university_id, department, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    
    -- Cast the gender text to the 'gender_kind' enum type.
    -- If not provided, it will be NULL, which is fine since the column allows it.
    (CASE
      WHEN meta_gender_text IS NOT NULL AND meta_gender_text <> '' THEN meta_gender_text
      ELSE NULL
    END)::gender_kind,
    
    -- Cast the user_type text to the 'user_kind' enum type
    (CASE
      WHEN meta_user_type_text IS NULL OR meta_user_type_text = '' THEN 'student'
      ELSE meta_user_type_text
    END)::user_kind,
    
    COALESCE(new.raw_user_meta_data->>'university_id', 'N/A'),
    COALESCE(new.raw_user_meta_data->>'department', 'N/A'),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

-- 4. Re-apply the trigger to ensure it's using the updated function.
-- This is a safe command that just re-links the trigger to the new function version.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
