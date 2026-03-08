ALTER TABLE public.enrollment_requests 
  ADD COLUMN IF NOT EXISTS student_email text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS student_phone text DEFAULT NULL;