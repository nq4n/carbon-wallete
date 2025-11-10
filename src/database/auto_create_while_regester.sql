-- 1) الدالة التي تنشئ صف في user_profiles عند إنشاء مستخدم جديد
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, name, user_type, university_id, department, gender, avatar_url)
  values (
    new.id,
    coalesce(new.email, new.raw_user_meta_data->>'email'),
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'user_type', 'student'),
    coalesce(new.raw_user_meta_data->>'university_id', 'N/A'),
    coalesce(new.raw_user_meta_data->>'department', 'N/A'),
    coalesce(new.raw_user_meta_data->>'gender', 'male'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- 2) إعادة إنشاء التريغر
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
