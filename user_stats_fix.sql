
CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id uuid)
RETURNS json LANGUAGE plpgsql AS $$
DECLARE
  v_user_total_saved numeric;
  v_department_avg_saved numeric;
  v_university_avg_saved numeric;
  v_user_rank int;
  v_weekly_improvement numeric;
  v_top_activity_kind text;
  v_user_department text;
  this_week_saved numeric;
  last_week_saved numeric;
BEGIN
  -- Get user''s department
  SELECT department INTO v_user_department FROM public.user_profiles WHERE id = p_user_id;

  -- Use a CTE to calculate carbon savings for all users, ensuring everyone has a record
  WITH user_carbon_savings AS (
    SELECT
      up.id as user_id,
      up.department,
      COALESCE(SUM(al.carbon_saved), 0) as total_carbon
    FROM
      public.user_profiles up
    LEFT JOIN
      public.activity_log al ON up.id = al.user_id
    GROUP BY
      up.id, up.department
  )
  -- Calculate all stats from the CTE in a single query
  SELECT
    (SELECT total_carbon FROM user_carbon_savings WHERE user_id = p_user_id),
    (SELECT AVG(total_carbon) FROM user_carbon_savings WHERE department = v_user_department),
    (SELECT AVG(total_carbon) FROM user_carbon_savings),
    (SELECT rnk FROM (SELECT user_id, RANK() OVER (ORDER BY total_carbon DESC) as rnk FROM user_carbon_savings) user_ranks WHERE user_id = p_user_id)
  INTO
    v_user_total_saved,
    v_department_avg_saved,
    v_university_avg_saved,
    v_user_rank;

  -- Weekly improvement calculation
  SELECT COALESCE(SUM(carbon_saved),0) INTO this_week_saved
    FROM public.activity_log
    WHERE user_id = p_user_id AND created_at >= date_trunc('week', now());

  SELECT COALESCE(SUM(carbon_saved),0) INTO last_week_saved
    FROM public.activity_log
    WHERE user_id = p_user_id
      AND created_at >= date_trunc('week', now() - interval '1 week')
      AND created_at < date_trunc('week', now());

  IF last_week_saved > 0 THEN
    v_weekly_improvement := ((this_week_saved - last_week_saved) / last_week_saved) * 100;
  ELSIF this_week_saved > 0 THEN
    v_weekly_improvement := 100;
  ELSE
    v_weekly_improvement := 0;
  END IF;

  -- Top activity kind for the user
  SELECT ac.kind::text INTO v_top_activity_kind
    FROM public.activity_log al
    JOIN public.activity_catalog ac ON al.activity_code = ac.code
    WHERE al.user_id = p_user_id
    GROUP BY ac.kind
    ORDER BY COUNT(*) DESC
    LIMIT 1;

  RETURN json_build_object(
    'totalCarbonSaved', COALESCE(v_user_total_saved, 0),
    'departmentAverage', COALESCE(v_department_avg_saved, 0),
    'universityAverage', COALESCE(v_university_avg_saved, 0),
    'rank', COALESCE(v_user_rank, 0),
    'weeklyImprovement', COALESCE(v_weekly_improvement, 0),
    'topActivityKind', v_top_activity_kind
  );
END;
$$;
