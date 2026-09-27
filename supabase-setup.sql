-- Run once in the Supabase SQL Editor for the Dr. Kinza Bilal project.
-- No patient data is publicly readable. Only explicitly approved users can see it.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.site_content (
  key text primary key check (length(key) between 1 and 80),
  value text not null check (length(value) <= 1000),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  patient_name text not null check (length(patient_name) between 2 and 100),
  phone text not null check (length(phone) between 8 and 25),
  location text not null check (length(location) between 2 and 120),
  preferred_date date,
  message text not null default '' check (length(message) <= 500),
  status text not null default 'new' check (status in ('new','contacted','confirmed','cancelled'))
);

alter table public.admin_users enable row level security;
alter table public.site_content enable row level security;
alter table public.appointments enable row level security;

revoke all on public.admin_users, public.site_content, public.appointments from anon, authenticated;
grant select on public.admin_users to authenticated;
grant select on public.site_content to anon, authenticated;
grant insert, update on public.site_content to authenticated;
grant insert (patient_name, phone, location, preferred_date, message) on public.appointments to anon;
grant select on public.appointments to authenticated;
grant update (status) on public.appointments to authenticated;

create policy "Admins can view their own membership" on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));

create policy "Anyone can read published website copy" on public.site_content
  for select to anon, authenticated using (true);
create policy "Admins can add website copy" on public.site_content
  for insert to authenticated with check (
    exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  );
create policy "Admins can edit website copy" on public.site_content
  for update to authenticated using (
    exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  );

create policy "Visitors can request an appointment" on public.appointments
  for insert to anon with check (status = 'new');
create policy "Admins can view appointments" on public.appointments
  for select to authenticated using (
    exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  );
create policy "Admins can update appointment status" on public.appointments
  for update to authenticated using (
    exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  );

-- After creating a staff account in Authentication > Users, add its UUID:
-- insert into public.admin_users (user_id) values ('PASTE_AUTH_USER_UUID_HERE');
