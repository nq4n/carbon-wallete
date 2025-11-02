-- Migration script to create a stored procedure for safely adding new activities.
-- This script is safe to run on an existing database with data.

-- This function takes all the details for a new activity and performs the
-- correct type casting before inserting into the activity_catalog.
-- This prevents the "type text but expression is of type activity_kind" error.

CREATE OR REPLACE FUNCTION public.add_new_activity_to_catalog(
  p_code TEXT,
  p_name TEXT,
  p_kind_text TEXT, -- The 'kind' is passed as plain text
  p_carbon_factor DECIMAL,
  p_unit TEXT,
  p_points_per_unit INTEGER
)
RETURNS SETOF public.activity_catalog -- Returns the newly created row
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.activity_catalog (code, name, kind, carbon_factor, unit, points_per_unit)
  VALUES (
    p_code,
    p_name,
    p_kind_text::activity_kind, -- This is the crucial fix: casting text to activity_kind
    p_carbon_factor,
    p_unit,
    p_points_per_unit
  )
  ON CONFLICT (code) DO NOTHING -- Avoids errors if the activity code already exists
  RETURNING *;
END;
$$;
