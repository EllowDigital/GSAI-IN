-- Add unique constraint on aadhar_number in students table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'students_aadhar_number_unique'
  ) THEN
    ALTER TABLE public.students ADD CONSTRAINT students_aadhar_number_unique UNIQUE (aadhar_number);
  END IF;
END $$;
-- Add unique constraint on login_id in student_portal_accounts (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'student_portal_accounts_login_id_unique'
  ) THEN
    ALTER TABLE public.student_portal_accounts ADD CONSTRAINT student_portal_accounts_login_id_unique UNIQUE (login_id);
  END IF;
END $$;
