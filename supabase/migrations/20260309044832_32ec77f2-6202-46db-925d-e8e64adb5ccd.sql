-- Drop restrictive policies and recreate as PERMISSIVE so they can actually grant access
DROP POLICY IF EXISTS "admin_manage_student_programs" ON public.student_programs;
DROP POLICY IF EXISTS "admin_users_manage_student_programs" ON public.student_programs;
DROP POLICY IF EXISTS "student_read_own_programs" ON public.student_programs;
-- Recreate as PERMISSIVE (default) policies
CREATE POLICY "admin_manage_student_programs" ON public.student_programs
  FOR ALL TO authenticated
  USING (public.has_role('admin'::text))
  WITH CHECK (public.has_role('admin'::text));
CREATE POLICY "admin_users_manage_student_programs" ON public.student_programs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_read_own_programs" ON public.student_programs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = student_programs.student_id));
