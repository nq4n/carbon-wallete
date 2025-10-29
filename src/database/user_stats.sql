create or replace function get_user_stats(p_user_id uuid)
returns json
language plpgsql
as $$
declare
  user_total_saved numeric;
  department_avg_saved numeric;
  university_avg_saved numeric;
  user_rank int;
  weekly_improvement numeric;
  top_activity_kind text;
begin
  -- Get user's total savings
  select coalesce(sum(carbon_saved_kg), 0) into user_total_saved
  from public.activity_logs
  where user_id = p_user_id;

  -- Get user's department
  declare
    user_dept text;
  begin
    select department into user_dept from public.user_profiles where id = p_user_id;

    -- Calculate department average
    select avg(total_carbon)
    into department_avg_saved
    from (
      select sum(carbon_saved_kg) as total_carbon
      from public.activity_logs al
      join public.user_profiles up on al.user_id = up.id
      where up.department = user_dept
      group by al.user_id
    ) as dept_totals;
  end;

  -- Calculate university average
  select avg(total_carbon)
  into university_avg_saved
  from (
    select sum(carbon_saved_kg) as total_carbon
    from public.activity_logs
    group by user_id
  ) as uni_totals;

  -- Get user's rank
  with user_totals as (
    select user_id, sum(carbon_saved_kg) as total_carbon
    from public.activity_logs
    group by user_id
    order by total_carbon desc
  )
  select rank into user_rank from (
    select user_id, row_number() over () as rank from user_totals
  ) as ranked_users where user_id = p_user_id;
  
  -- Weekly improvement
  declare
    this_week_saved numeric;
    last_week_saved numeric;
  begin
    select coalesce(sum(carbon_saved_kg), 0) into this_week_saved
    from public.activity_logs
    where user_id = p_user_id and created_at >= date_trunc('week', now());

    select coalesce(sum(carbon_saved_kg), 0) into last_week_saved
    from public.activity_logs
    where user_id = p_user_id 
      and created_at >= date_trunc('week', now() - interval '1 week')
      and created_at < date_trunc('week', now());

    if last_week_saved > 0 then
      weekly_improvement := (this_week_saved - last_week_saved) / last_week_saved * 100;
    else
      weekly_improvement := 0;
    end if;
  end;
  
  -- Top activity kind
  select kind into top_activity_kind
  from public.activity_logs
  where user_id = p_user_id
  group by kind
  order by sum(carbon_saved_kg) desc
  limit 1;

  return json_build_object(
    'user_total', user_total_saved,
    'department_avg', department_avg_saved,
    'university_avg', university_avg_saved,
    'rank', user_rank,
    'weekly_improvement_pct', weekly_improvement,
    'top_activity', top_activity_kind
  );
end;
$$;
