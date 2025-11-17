begin;

drop policy if exists "Admins manage belt levels" on public.belt_levels;
drop policy if exists "Admins manage student progress" on public.student_progress;
drop policy if exists "Admins write student progress" on public.student_progress;
drop policy if exists "Admins update student progress" on public.student_progress;
drop policy if exists "Instructors add evidence" on public.student_progress;

drop function if exists public.is_progress_status_unchanged(uuid, text);

drop view if exists public.profiles cascade;

create view public.profiles as
select
  id,
  coalesce(nullif(raw_user_meta_data->>'role', ''), 'student') as role,
  email,
  raw_user_meta_data
from auth.users;

create or replace function public.is_progress_status_unchanged(row_id uuid, new_status text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_status text;
begin
  select status into current_status from public.student_progress where id = row_id;
  return current_status is null or current_status = new_status;
end;
$$;

create policy "Admins manage belt levels"
  on public.belt_levels
  for all
  using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

create policy "Admins manage student progress"
  on public.student_progress
  for select using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

create policy "Admins write student progress"
  on public.student_progress
  for insert using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

create policy "Admins update student progress"
  on public.student_progress
  for update using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

create policy "Instructors add evidence"
  on public.student_progress
  for update using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'instructor'
    )
  )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'instructor'
    )
    and public.is_progress_status_unchanged(id, status)
  );

commit;
