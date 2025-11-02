create or replace function get_user_stats(p_user_id uuid)
returns json
language plpgsql
as $$
declare
  v_user_total_saved numeric;
  v_department_avg_saved numeric;
  v_university_avg_saved numeric;
  v_user_rank int;
  v_weekly_improvement numeric;
  v_top_activity_kind text;
  v_user_department text;
begin
  -- 1. Get user's total savings
  select coalesce(sum(carbon_saved), 0) into v_user_total_saved
  from public.activity_log
  where user_id = p_user_id;

  -- 2. Get user's department for department-level stats
  select department into v_user_department from public.user_profiles where id = p_user_id;

  -- 3. Calculate department average
  select avg(total_carbon)
  into v_department_avg_saved
  from (
    select sum(al.carbon_saved) as total_carbon
    from public.activity_log al
    join public.user_profiles up on al.user_id = up.id
    where up.department = v_user_department
    group by al.user_id
  ) as dept_totals;

  -- 4. Calculate university-wide average
  select avg(total_carbon)
  into v_university_avg_saved
  from (
    select sum(carbon_saved) as total_carbon
    from public.activity_log
    group by user_id
  ) as uni_totals;

  -- 5. Get user's rank based on total carbon saved
  with user_ranks as (
    select
      user_id,
      rank() over (order by sum(carbon_saved) desc) as rank
    from public.activity_log
    group by user_id
  )
  select rank into v_user_rank from user_ranks where user_id = p_user_id;
  
  if v_user_rank is null then
      select count(*) + 1 into v_user_rank from public.user_profiles;
  end if;

  -- 6. Calculate weekly improvement
  declare
    this_week_saved numeric;
    last_week_saved numeric;
  begin
    select coalesce(sum(carbon_saved), 0) into this_week_saved
    from public.activity_log
    where user_id = p_user_id and created_at >= date_trunc('week', now());

    select coalesce(sum(carbon_saved), 0) into last_week_saved
    from public.activity_log
    where user_id = p_user_id
      and created_at >= date_trunc('week', now() - interval '1 week')
      and created_at < date_trunc('week', now());

    if last_week_saved > 0 then
      v_weekly_improvement := ((this_week_saved - last_week_saved) / last_week_saved) * 100;
    elsif this_week_saved > 0 then
      v_weekly_improvement := 100;
    else
      v_weekly_improvement := 0;
    end if;
  end;

  -- 7. Find the most frequent activity *kind*
  select ac.kind::text into v_top_activity_kind
  from public.activity_log al
  join public.activity_catalog ac on al.activity_code = ac.code
  where al.user_id = p_user_id
  group by ac.kind
  order by count(*) desc
  limit 1;

  -- 8. Return all stats as a single JSON object
  return json_build_object(
    'totalCarbonSaved', coalesce(v_user_total_saved, 0),
    'departmentAverage', coalesce(v_department_avg_saved, 0),
    'universityAverage', coalesce(v_university_avg_saved, 0),
    'rank', coalesce(v_user_rank, 0),
    'weeklyImprovement', coalesce(v_weekly_improvement, 0),
    'topActivityKind', v_top_activity_kind
  );
end;
$$;