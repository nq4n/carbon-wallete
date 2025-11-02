-- =================================================================================================
-- Green Pulse - Create Function to Complete a Challenge
-- =================================================================================================
-- This script creates a new RPC function `complete_challenge`.
-- This function is safe to run and will replace any existing function with the same name.
-- It allows a user to complete a challenge, validates the action, and awards points.
-- -------------------------------------------------------------------------------------------------

BEGIN;

CREATE OR REPLACE FUNCTION public.complete_challenge(p_challenge_id integer, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_points_to_award integer;
BEGIN
  -- First, check if the user has already completed this challenge to prevent duplicates
  IF EXISTS (
    SELECT 1
    FROM public.user_completed_challenges
    WHERE user_id = p_user_id AND challenge_id = p_challenge_id
  ) THEN
    -- If they have, raise an exception to stop the process
    RAISE EXCEPTION 'User has already completed this challenge';
  END IF;

  -- If they haven't completed it, get the points reward for this challenge
  SELECT points_reward
  INTO v_points_to_award
  FROM public.challenges
  WHERE id = p_challenge_id;

  -- Insert a record to mark the challenge as completed for this user
  INSERT INTO public.user_completed_challenges (user_id, challenge_id)
  VALUES (p_user_id, p_challenge_id);

  -- Award the points to the user by updating their profile
  UPDATE public.user_profiles
  SET points = points + v_points_to_award
  WHERE id = p_user_id;

END;
$$;

COMMIT;
