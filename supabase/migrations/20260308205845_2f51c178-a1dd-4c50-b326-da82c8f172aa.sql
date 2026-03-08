-- Fix: students table has a trigger referencing updated_at but no such column
-- Drop the broken trigger since students table doesn't use updated_at
DROP TRIGGER IF EXISTS trg_students_updated_at ON public.students;