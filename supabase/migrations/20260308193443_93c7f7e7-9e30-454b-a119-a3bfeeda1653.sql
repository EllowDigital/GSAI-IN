-- ============================================================
-- SCHEMA AUDIT & OPTIMIZATION
-- ============================================================

-- 1. INDEXES for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_fees_student_month_year ON public.fees (student_id, month, year);
CREATE INDEX IF NOT EXISTS idx_fees_status ON public.fees (status);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance (student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance (date);
CREATE INDEX IF NOT EXISTS idx_students_program ON public.students (program);
CREATE INDEX IF NOT EXISTS idx_students_name ON public.students (name);
CREATE INDEX IF NOT EXISTS idx_student_progress_student ON public.student_progress (student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_belt ON public.student_progress (belt_level_id);
CREATE INDEX IF NOT EXISTS idx_promotion_history_student ON public.promotion_history (student_id);
CREATE INDEX IF NOT EXISTS idx_competition_registrations_student ON public.competition_registrations (student_id);
CREATE INDEX IF NOT EXISTS idx_competition_registrations_competition ON public.competition_registrations (competition_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_status ON public.enrollment_requests (status);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_aadhar ON public.enrollment_requests (aadhar_number);
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON public.blogs (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events (date DESC);
CREATE INDEX IF NOT EXISTS idx_news_date ON public.news (date DESC);
CREATE INDEX IF NOT EXISTS idx_belt_levels_discipline_rank ON public.belt_levels (discipline, rank);
CREATE INDEX IF NOT EXISTS idx_student_discipline_progress_student ON public.student_discipline_progress (student_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements (is_active, expires_at);
-- 2. Add proper CASCADING foreign keys where missing
-- attendance → students
ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_student_id_fkey;
ALTER TABLE public.attendance ADD CONSTRAINT attendance_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- fees → students  
ALTER TABLE public.fees DROP CONSTRAINT IF EXISTS fees_student_id_fkey;
ALTER TABLE public.fees ADD CONSTRAINT fees_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- student_progress → students
ALTER TABLE public.student_progress DROP CONSTRAINT IF EXISTS student_progress_student_id_fkey;
ALTER TABLE public.student_progress ADD CONSTRAINT student_progress_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- promotion_history → students
ALTER TABLE public.promotion_history DROP CONSTRAINT IF EXISTS promotion_history_student_id_fkey;
ALTER TABLE public.promotion_history ADD CONSTRAINT promotion_history_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- competition_registrations → students
ALTER TABLE public.competition_registrations DROP CONSTRAINT IF EXISTS competition_registrations_student_id_fkey;
ALTER TABLE public.competition_registrations ADD CONSTRAINT competition_registrations_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- competition_certificates → students
ALTER TABLE public.competition_certificates DROP CONSTRAINT IF EXISTS competition_certificates_student_id_fkey;
ALTER TABLE public.competition_certificates ADD CONSTRAINT competition_certificates_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- student_discipline_progress → students
ALTER TABLE public.student_discipline_progress DROP CONSTRAINT IF EXISTS student_discipline_progress_student_id_fkey;
ALTER TABLE public.student_discipline_progress ADD CONSTRAINT student_discipline_progress_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- student_portal_accounts → students
ALTER TABLE public.student_portal_accounts DROP CONSTRAINT IF EXISTS student_portal_accounts_student_id_fkey;
ALTER TABLE public.student_portal_accounts ADD CONSTRAINT student_portal_accounts_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- competition_certificates → competitions
ALTER TABLE public.competition_certificates DROP CONSTRAINT IF EXISTS competition_certificates_competition_id_fkey;
ALTER TABLE public.competition_certificates ADD CONSTRAINT competition_certificates_competition_id_fkey 
  FOREIGN KEY (competition_id) REFERENCES public.competitions(id) ON DELETE CASCADE;
-- competition_registrations → competitions
ALTER TABLE public.competition_registrations DROP CONSTRAINT IF EXISTS competition_registrations_competition_id_fkey;
ALTER TABLE public.competition_registrations ADD CONSTRAINT competition_registrations_competition_id_fkey 
  FOREIGN KEY (competition_id) REFERENCES public.competitions(id) ON DELETE CASCADE;
-- 3. Add updated_at trigger to tables missing it
CREATE OR REPLACE FUNCTION public.auto_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_students_updated_at') THEN
    CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON public.students
      FOR EACH ROW EXECUTE FUNCTION public.auto_updated_at();
  END IF;
END $$;
-- 4. Add unique constraint for enrollment_requests aadhar (prevent duplicates at DB level)
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollment_unique_aadhar_pending 
  ON public.enrollment_requests (aadhar_number) 
  WHERE status = 'pending';
