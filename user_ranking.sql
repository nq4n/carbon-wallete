
-- This script creates a new table to store user rankings and a function to update them.

-- 1) Create the user_rankings table
CREATE TABLE IF NOT EXISTS public.user_rankings (
  user_id uuid PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  rank integer NOT NULL,
  total_points integer NOT NULL,
  last_calculated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Create a function to recalculate user rankings
-- This function contains the core logic and can be called directly.
CREATE OR REPLACE FUNCTION public.recalculate_user_rankings()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  -- Clear the old rankings to ensure the data is always fresh
  TRUNCATE TABLE public.user_rankings;

  -- Recalculate and insert the new rankings based on user points
  INSERT INTO public.user_rankings (user_id, rank, total_points, last_calculated_at)
  SELECT
    id,
    RANK() OVER (ORDER BY points DESC) as rank,
    points,
    now()
  FROM
    public.user_profiles;
END;
$$;

-- 3) Create a trigger function that calls the recalculation function
CREATE OR REPLACE FUNCTION public.handle_ranking_update_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Call the main logic function
  PERFORM public.recalculate_user_rankings();
  RETURN NULL; -- Return value is ignored for statement-level AFTER triggers
END;
$$;

-- 4) Create a trigger to automatically update the rankings when points change or new users are added
DROP TRIGGER IF EXISTS trg_update_rankings_on_points_change ON public.user_profiles;
CREATE TRIGGER trg_update_rankings_on_points_change
  AFTER INSERT OR UPDATE OF points ON public.user_profiles
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.handle_ranking_update_trigger();

-- 5) Initial population of the user_rankings table
-- We call the function once to ensure the table is populated with existing users.
SELECT public.recalculate_user_rankings();

-- 6) Optional: Add RLS policy to allow users to read the rankings
ALTER TABLE public.user_rankings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read user rankings" ON public.user_rankings;
CREATE POLICY "Public can read user rankings" ON public.user_rankings FOR SELECT USING (true);
