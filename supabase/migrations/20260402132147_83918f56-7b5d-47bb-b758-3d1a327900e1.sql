
-- Drop attendance table and related trigger/function
DROP TRIGGER IF EXISTS prevent_status_change ON public.attendance;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP FUNCTION IF EXISTS public.prevent_attendance_status_change();
