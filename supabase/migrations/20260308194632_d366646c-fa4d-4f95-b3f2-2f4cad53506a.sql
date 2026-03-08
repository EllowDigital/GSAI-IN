
-- Fix: Add unique constraint for competition certificates upsert
ALTER TABLE public.competition_certificates
  ADD CONSTRAINT competition_certificates_comp_student_unique
  UNIQUE (competition_id, student_id);
