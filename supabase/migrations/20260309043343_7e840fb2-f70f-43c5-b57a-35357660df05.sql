-- Add missing DELETE policy for student_progress (admin roles)
CREATE POLICY "Admin roles delete student progress"
ON public.student_progress
FOR DELETE
TO authenticated
USING (has_role('admin'::text));
-- Add CASCADE foreign keys for belt_exam_notifications if missing
ALTER TABLE public.belt_exam_notifications
  DROP CONSTRAINT IF EXISTS belt_exam_notifications_student_id_fkey;
ALTER TABLE public.belt_exam_notifications
  ADD CONSTRAINT belt_exam_notifications_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE public.belt_exam_notifications
  DROP CONSTRAINT IF EXISTS belt_exam_notifications_event_id_fkey;
ALTER TABLE public.belt_exam_notifications
  ADD CONSTRAINT belt_exam_notifications_event_id_fkey
  FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE SET NULL;
-- Ensure student_programs has CASCADE
ALTER TABLE public.student_programs
  DROP CONSTRAINT IF EXISTS student_programs_student_id_fkey;
ALTER TABLE public.student_programs
  ADD CONSTRAINT student_programs_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- Ensure student_discipline_progress has CASCADE
ALTER TABLE public.student_discipline_progress
  DROP CONSTRAINT IF EXISTS student_discipline_progress_student_id_fkey;
ALTER TABLE public.student_discipline_progress
  ADD CONSTRAINT student_discipline_progress_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- Ensure student_progress has CASCADE  
ALTER TABLE public.student_progress
  DROP CONSTRAINT IF EXISTS student_progress_student_id_fkey;
ALTER TABLE public.student_progress
  ADD CONSTRAINT student_progress_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- Ensure promotion_history has CASCADE
ALTER TABLE public.promotion_history
  DROP CONSTRAINT IF EXISTS promotion_history_student_id_fkey;
ALTER TABLE public.promotion_history
  ADD CONSTRAINT promotion_history_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- Ensure fees has CASCADE
ALTER TABLE public.fees
  DROP CONSTRAINT IF EXISTS fees_student_id_fkey;
ALTER TABLE public.fees
  ADD CONSTRAINT fees_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- Ensure attendance has CASCADE
ALTER TABLE public.attendance
  DROP CONSTRAINT IF EXISTS attendance_student_id_fkey;
ALTER TABLE public.attendance
  ADD CONSTRAINT attendance_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- Ensure competition_registrations has CASCADE
ALTER TABLE public.competition_registrations
  DROP CONSTRAINT IF EXISTS competition_registrations_student_id_fkey;
ALTER TABLE public.competition_registrations
  ADD CONSTRAINT competition_registrations_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- Ensure competition_certificates has CASCADE
ALTER TABLE public.competition_certificates
  DROP CONSTRAINT IF EXISTS competition_certificates_student_id_fkey;
ALTER TABLE public.competition_certificates
  ADD CONSTRAINT competition_certificates_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- Ensure student_portal_accounts has CASCADE
ALTER TABLE public.student_portal_accounts
  DROP CONSTRAINT IF EXISTS student_portal_accounts_student_id_fkey;
ALTER TABLE public.student_portal_accounts
  ADD CONSTRAINT student_portal_accounts_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
