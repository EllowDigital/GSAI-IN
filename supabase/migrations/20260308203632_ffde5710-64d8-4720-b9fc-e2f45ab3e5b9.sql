-- Create student_programs junction table for multi-program enrollment
CREATE TABLE public.student_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  program_name text NOT NULL,
  joined_at date NOT NULL DEFAULT CURRENT_DATE,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, program_name)
);
-- Enable RLS
ALTER TABLE public.student_programs ENABLE ROW LEVEL SECURITY;
-- Admin policies
CREATE POLICY "admin_manage_student_programs" ON public.student_programs
  FOR ALL TO authenticated
  USING (has_role('admin'::text))
  WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_student_programs" ON public.student_programs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_read_own_programs" ON public.student_programs
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid() AND spa.student_id = student_programs.student_id
  ));
-- Migrate existing data: insert current program as primary for all students
INSERT INTO public.student_programs (student_id, program_name, joined_at, is_primary)
SELECT id, program, join_date, true
FROM public.students
WHERE program IS NOT NULL AND program != ''
ON CONFLICT (student_id, program_name) DO NOTHING;
