-- Allow students to read their own discipline progress records
CREATE POLICY "student_read_own_discipline_progress"
ON public.student_discipline_progress
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid()
      AND spa.student_id = student_discipline_progress.student_id
  )
);
