-- This is the final, robust version of the function to handle all activity logging.
-- It fixes the not-null constraint violation permanently.

-- Add the missing 'food' value to the 'activity_kind' ENUM type if it hasn't been done.
ALTER TYPE public.activity_kind ADD VALUE IF NOT EXISTS 'food';

-- Create the robust function to handle all parts of logging an activity.
CREATE OR REPLACE FUNCTION public.log_activity_final(
    p_user_id UUID,
    p_activity_code TEXT,
    p_activity_name TEXT,
    p_activity_kind_text TEXT,
    p_quantity DECIMAL,
    p_carbon_factor DECIMAL,
    p_unit TEXT,
    p_notes TEXT
)
RETURNS INTEGER -- Returns the points earned
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_points_per_unit INTEGER;
    v_carbon_saved DECIMAL;
    v_points_earned INTEGER;
BEGIN
    -- THE FIX: Use COALESCE to safely handle potential NULL inputs, defaulting them to 0.
    -- This prevents the not-null constraint violation.
    v_points_per_unit := round(COALESCE(p_carbon_factor, 0) * 10);

    -- Use INSERT...ON CONFLICT (an "UPSERT") to add the activity to the catalog if it's new.
    INSERT INTO public.activity_catalog(code, name, kind, carbon_factor, unit, points_per_unit)
    VALUES (
        p_activity_code,
        p_activity_name,
        p_activity_kind_text::activity_kind,
        COALESCE(p_carbon_factor, 0),
        p_unit,
        v_points_per_unit
    )
    ON CONFLICT (code) DO NOTHING;

    -- THE FIX: Use COALESCE here as well to ensure calculations do not result in NULL.
    v_carbon_saved := COALESCE(p_quantity, 0) * COALESCE(p_carbon_factor, 0);
    v_points_earned := COALESCE(p_quantity, 0) * v_points_per_unit;

    -- Insert the user's action into the activity log.
    -- The values for carbon_saved and points_earned are now guaranteed to be numbers (not NULL).
    INSERT INTO public.activity_log(user_id, activity_code, quantity, carbon_saved, points_earned, notes)
    VALUES (p_user_id, p_activity_code, COALESCE(p_quantity, 0), v_carbon_saved, v_points_earned, p_notes);

    -- Update the user's total points.
    UPDATE public.user_profiles
    SET points = points + v_points_earned
    WHERE id = p_user_id;

    -- Return the points earned for this specific action.
    RETURN v_points_earned;
END;
$$;
