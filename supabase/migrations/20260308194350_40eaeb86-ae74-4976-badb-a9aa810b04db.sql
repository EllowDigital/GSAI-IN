
-- Add ON DELETE CASCADE to all tables referencing students
-- 1. attendance
ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_student_id_fkey;
ALTER TABLE public.attendance ADD CONSTRAINT attendance_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- 2. fees
ALTER TABLE public.fees DROP CONSTRAINT IF EXISTS fees_student_id_fkey;
ALTER TABLE public.fees ADD CONSTRAINT fees_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- 3. student_progress
ALTER TABLE public.student_progress DROP CONSTRAINT IF EXISTS student_progress_student_id_fkey;
ALTER TABLE public.student_progress ADD CONSTRAINT student_progress_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- 4. student_discipline_progress
ALTER TABLE public.student_discipline_progress DROP CONSTRAINT IF EXISTS student_discipline_progress_student_id_fkey;
ALTER TABLE public.student_discipline_progress ADD CONSTRAINT student_discipline_progress_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- 5. promotion_history
ALTER TABLE public.promotion_history DROP CONSTRAINT IF EXISTS promotion_history_student_id_fkey;
ALTER TABLE public.promotion_history ADD CONSTRAINT promotion_history_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- 6. competition_registrations
ALTER TABLE public.competition_registrations DROP CONSTRAINT IF EXISTS competition_registrations_student_id_fkey;
ALTER TABLE public.competition_registrations ADD CONSTRAINT competition_registrations_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- 7. competition_certificates
ALTER TABLE public.competition_certificates DROP CONSTRAINT IF EXISTS competition_certificates_student_id_fkey;
ALTER TABLE public.competition_certificates ADD CONSTRAINT competition_certificates_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- 8. student_portal_accounts
ALTER TABLE public.student_portal_accounts DROP CONSTRAINT IF EXISTS student_portal_accounts_student_id_fkey;
ALTER TABLE public.student_portal_accounts ADD CONSTRAINT student_portal_accounts_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
