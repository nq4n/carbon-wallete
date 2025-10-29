-- 1) الدالة التي تنشئ صف في user_profiles عند إنشاء مستخدم جديد
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (
    id, email, name, user_type, university_id, department, avatar_url
  )
  values (
    new.id,
    coalesce(new.email, new.raw_user_meta_data->>'email'),
    coalesce(new.raw_user_meta_data->>'name', ''),
    'student',    -- يمكنك تغيير النوع هنا
    'N/A',        -- يمكنك تغيير رقم الجامعة هنا
    'N/A',        -- يمكنك تغيير القسم هنا
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


-- 3) حذف السياسات القديمة
drop policy if exists "profiles_select_self" on public.user_profiles;
drop policy if exists "profiles_update_self" on public.user_profiles;
drop policy if exists "profiles_insert_self" on public.user_profiles;


-- 4) إنشاء السياسات الصحيحة

-- السماح للمستخدم بقراءة صفه فقط
create policy "profiles_select_self"
on public.user_profiles
for select
using (id = auth.uid());

-- السماح للمستخدم بتعديل صفه فقط
create policy "profiles_update_self"
on public.user_profiles
for update
using (id = auth.uid());

-- إدخال بيانات أثناء التريغر فقط (لا حاجة لإدخال يدوي من الواجهة)
create policy "profiles_insert_self"
on public.user_profiles
for insert
with check (id = auth.uid());
-- 1) الدالة التي تنشئ صف في user_profiles عند إنشاء مستخدم جديد
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (
    id, email, name, user_type, university_id, department, avatar_url
  )
  values (
    new.id,
    coalesce(new.email, new.raw_user_meta_data->>'email'),
    coalesce(new.raw_user_meta_data->>'name', ''),
    'student',    -- يمكنك تغيير النوع هنا
    'N/A',        -- يمكنك تغيير رقم الجامعة هنا
    'N/A',        -- يمكنك تغيير القسم هنا
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


-- 3) حذف السياسات القديمة
drop policy if exists "profiles_select_self" on public.user_profiles;
drop policy if exists "profiles_update_self" on public.user_profiles;
drop policy if exists "profiles_insert_self" on public.user_profiles;


-- 4) إنشاء السياسات الصحيحة

-- السماح للمستخدم بقراءة صفه فقط
create policy "profiles_select_self"
on public.user_profiles
for select
using (id = auth.uid());

-- السماح للمستخدم بتعديل صفه فقط
create policy "profiles_update_self"
on public.user_profiles
for update
using (id = auth.uid());

-- إدخال بيانات أثناء التريغر فقط (لا حاجة لإدخال يدوي من الواجهة)
create policy "profiles_insert_self"
on public.user_profiles
for insert
with check (id = auth.uid());
