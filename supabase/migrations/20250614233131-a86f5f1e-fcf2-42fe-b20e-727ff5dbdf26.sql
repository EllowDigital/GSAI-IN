
-- Add missing columns for student details
ALTER TABLE public.students
ADD COLUMN aadhar_number text NOT NULL UNIQUE,
ADD COLUMN parent_name text NOT NULL,
ADD COLUMN parent_contact text NOT NULL;

-- Optionally: If existing rows present, you may need to set default values or update them after running this.
-- If the table isn't empty, let me know!
