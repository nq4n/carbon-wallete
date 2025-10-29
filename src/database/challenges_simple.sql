-- Table to store all available challenges
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  points_reward int not null default 0,
  due_date timestamptz,
  created_at timestamptz not null default now()
);

-- Table to link users to the challenges they have successfully completed
create table if not exists public.user_completed_challenges (
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, challenge_id)
);

-- RLS policies
alter table public.challenges enable row level security;
alter table public.user_completed_challenges enable row level security;

-- Anyone can read challenges
drop policy if exists "challenges_read_all" on public.challenges;
create policy "challenges_read_all" on public.challenges
  for select using (true);

-- Users can read their own completed challenges
drop policy if exists "user_completed_challenges_read_own" on public.user_completed_challenges;
create policy "user_completed_challenges_read_own" on public.user_completed_challenges
  for select using (user_id = public.uid());

-- Admin/backend role for writing
drop policy if exists "challenges_write_admin" on public.challenges;
create policy "challenges_write_admin" on public.challenges
  for all using (false) with check (false); -- managed via service role

drop policy if exists "user_completed_challenges_write_backend" on public.user_completed_challenges;
create policy "user_completed_challenges_write_backend" on public.user_completed_challenges
  for all using (false) with check (false); -- managed via service role
