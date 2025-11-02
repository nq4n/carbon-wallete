-- This is a safe, minimal script to create only the missing 'activity_log' table.
-- It will not delete or alter any other data or tables.

-- 1. Create the 'activity_log' table if it does not already exist.
-- This table is essential for recording user activities.
create table if not exists public.activity_log (
  id serial primary key,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  activity_code text not null references public.activity_catalog(code),
  quantity decimal(10, 2) not null,
  carbon_saved decimal(10, 4) not null,
  points_earned integer not null,
  notes text,
  created_at timestamptz not null default now()
);

-- 2. Enable Row Level Security (RLS) on the new table.
-- This is a critical security measure.
alter table public.activity_log enable row level security;

-- 3. Create the security policy for the new table.
-- This policy ensures that users can only see and manage their own log entries.
create policy "Users can manage their own activity logs"
  on public.activity_log for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
