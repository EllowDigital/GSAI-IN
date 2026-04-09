-- Enforce one attendance record per student per day
ALTER TABLE public.attendance
  ADD CONSTRAINT attendance_student_date_unique
  UNIQUE (student_id, date);
-- Prevent updates to attendance status once marked (only allow check_out_time updates)
CREATE OR REPLACE FUNCTION public.prevent_attendance_status_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Allow updating check_out_time only
  IF OLD.status IS NOT NULL AND NEW.status != OLD.status THEN
    RAISE EXCEPTION 'Attendance status cannot be changed once marked.';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_prevent_attendance_status_change
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_attendance_status_change();
