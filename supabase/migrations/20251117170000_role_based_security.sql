begin;

-- Remove insecure profiles view exposed from auth.users
drop view if exists public.profiles;

-- Ensure shared role enum exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'instructor', 'staff', 'student');
  END IF;
END$$;

-- Role membership table
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz default now(),
  created_by uuid default auth.uid()
);

alter table public.user_roles enable row level security;
create unique index if not exists user_roles_user_role_key on public.user_roles(user_id, role);

-- Secure helper that bypasses RLS on user_roles
create or replace function public.has_role(required_role text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = required_role::public.app_role
  );
end;
$$;

drop policy if exists "Users read own roles" on public.user_roles;
create policy "Users read own roles"
  on public.user_roles
  for select
  using (auth.uid() = user_id);

drop policy if exists "Admins manage user roles" on public.user_roles;
create policy "Admins manage user roles"
  on public.user_roles
  for all
  using (has_role('admin'))
  with check (has_role('admin'));

-- Seed admin role memberships for legacy admin_users entries
insert into public.user_roles (user_id, role)
select auth_users.id, 'admin'::public.app_role
from auth.users as auth_users
join public.admin_users as legacy on lower(legacy.email) = lower(auth_users.email)
on conflict (user_id, role) do nothing;

-- Blogs
DROP POLICY IF EXISTS "Admins can do everything on blogs" ON public.blogs;
CREATE POLICY "Admin roles manage blogs"
  ON public.blogs
  FOR ALL
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));

-- News
DROP POLICY IF EXISTS "Admins can do everything on news" ON public.news;
CREATE POLICY "Admin roles manage news"
  ON public.news
  FOR ALL
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));

-- Gallery images
DROP POLICY IF EXISTS "Admins can do everything on gallery_images" ON public.gallery_images;
CREATE POLICY "Admin roles manage gallery" 
  ON public.gallery_images
  FOR ALL
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));

-- Events
DROP POLICY IF EXISTS "Admins can access and modify all events" ON public.events;
DROP POLICY IF EXISTS "Admins can access and modify all events (standard)" ON public.events;
CREATE POLICY "Admin roles manage events"
  ON public.events
  FOR ALL
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));

-- Students
DROP POLICY IF EXISTS "Admins can do everything on students" ON public.students;
DROP POLICY IF EXISTS "Enhanced admin access to students" ON public.students;
CREATE POLICY "Admin roles manage students"
  ON public.students
  FOR ALL
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));

-- Fees
DROP POLICY IF EXISTS "Admin can manage fees" ON public.fees;
DROP POLICY IF EXISTS "Admin users can view all fees" ON public.fees;
DROP POLICY IF EXISTS "Admin users can insert fees" ON public.fees;
DROP POLICY IF EXISTS "Admin users can update fees" ON public.fees;
DROP POLICY IF EXISTS "Admin users can delete fees" ON public.fees;
DROP POLICY IF EXISTS "Enhanced admin access to fees" ON public.fees;
DROP POLICY IF EXISTS "Verified admins can view all fees" ON public.fees;
DROP POLICY IF EXISTS "Verified admins can insert fees" ON public.fees;
DROP POLICY IF EXISTS "Verified admins can update fees" ON public.fees;
DROP POLICY IF EXISTS "Verified admins can delete fees" ON public.fees;

CREATE POLICY "Admin roles select fees"
  ON public.fees
  FOR SELECT
  USING (has_role('admin'));

CREATE POLICY "Admin roles insert fees"
  ON public.fees
  FOR INSERT
  WITH CHECK (has_role('admin'));

CREATE POLICY "Admin roles update fees"
  ON public.fees
  FOR UPDATE
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));

CREATE POLICY "Admin roles delete fees"
  ON public.fees
  FOR DELETE
  USING (has_role('admin'));

-- Sensitive audit logs
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.sensitive_data_audit;
CREATE POLICY "Admin roles view sensitive logs"
  ON public.sensitive_data_audit
  FOR SELECT
  USING (has_role('admin'));

-- Main audit logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admin roles view audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (has_role('admin'));

-- Belt levels policies
DROP POLICY IF EXISTS "Admins manage belt levels" ON public.belt_levels;
DROP POLICY IF EXISTS "Admins manage belt levels - insert" ON public.belt_levels;
DROP POLICY IF EXISTS "Admins manage belt levels - update" ON public.belt_levels;
DROP POLICY IF EXISTS "Admins manage belt levels - delete" ON public.belt_levels;

CREATE POLICY "Admin roles select belts"
  ON public.belt_levels
  FOR SELECT
  USING (has_role('admin'));

CREATE POLICY "Admin roles insert belts"
  ON public.belt_levels
  FOR INSERT
  WITH CHECK (has_role('admin'));

CREATE POLICY "Admin roles update belts"
  ON public.belt_levels
  FOR UPDATE
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));

CREATE POLICY "Admin roles delete belts"
  ON public.belt_levels
  FOR DELETE
  USING (has_role('admin'));

-- Student progression board policies
DROP POLICY IF EXISTS "Admins manage student progress" ON public.student_progress;
DROP POLICY IF EXISTS "Admins write student progress" ON public.student_progress;
DROP POLICY IF EXISTS "Admins update student progress" ON public.student_progress;
DROP POLICY IF EXISTS "Instructors add evidence" ON public.student_progress;

CREATE POLICY "Admin roles read student progress"
  ON public.student_progress
  FOR SELECT
  USING (has_role('admin'));

CREATE POLICY "Admin roles insert student progress"
  ON public.student_progress
  FOR INSERT
  WITH CHECK (has_role('admin'));

CREATE POLICY "Admin roles update student progress"
  ON public.student_progress
  FOR UPDATE
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));

CREATE POLICY "Instructor evidence uploads"
  ON public.student_progress
  FOR UPDATE
  USING (has_role('instructor'))
  WITH CHECK (
    has_role('instructor')
    AND public.is_progress_status_unchanged(id, status)
  );

commit;
