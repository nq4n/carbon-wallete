-- This script creates a secure PostgreSQL function to increment a user's points.
-- It is idempotent, meaning you can run it multiple times without causing errors.

-- The function takes a user_id and the number of points to add.
CREATE OR REPLACE FUNCTION increment_user_points(p_user_id UUID, p_points INT)
RETURNS VOID AS $$
BEGIN
  -- This special lock ensures that if two updates happen at the same time,
  -- they are processed one by one, preventing race conditions and ensuring
  -- the final point total is always correct.
  PERFORM FROM public.user_profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Update the user's points by adding the new amount.
  UPDATE public.user_profiles
  SET points = points + p_points
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;
