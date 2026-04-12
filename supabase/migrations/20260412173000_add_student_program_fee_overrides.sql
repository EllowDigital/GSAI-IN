-- Persistent custom fee overrides per student + program.
CREATE TABLE IF NOT EXISTS public.student_program_fee_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  program_name text NOT NULL,
  monthly_fee integer NOT NULL CHECK (monthly_fee >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, program_name)
);

ALTER TABLE public.student_program_fee_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_manage_student_program_fee_overrides" ON public.student_program_fee_overrides;
CREATE POLICY "admin_manage_student_program_fee_overrides"
ON public.student_program_fee_overrides
FOR ALL TO authenticated
USING (
  has_role('admin'::text)
  OR EXISTS (SELECT 1 FROM public.admin_users au WHERE au.email = auth.email())
)
WITH CHECK (
  has_role('admin'::text)
  OR EXISTS (SELECT 1 FROM public.admin_users au WHERE au.email = auth.email())
);

DROP POLICY IF EXISTS "student_read_own_program_fee_overrides" ON public.student_program_fee_overrides;
CREATE POLICY "student_read_own_program_fee_overrides"
ON public.student_program_fee_overrides
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid()
      AND spa.student_id = student_program_fee_overrides.student_id
  )
);
