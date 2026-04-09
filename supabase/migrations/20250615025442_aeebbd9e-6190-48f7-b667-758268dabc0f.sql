
-- 1. Drop the old fees table (if it exists)
DROP TABLE IF EXISTS public.fees CASCADE;

-- 2. Recreate the fees table
CREATE TABLE public.fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL,
  monthly_fee integer NOT NULL,
  paid_amount integer NOT NULL DEFAULT 0,
  balance_due integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'unpaid'
);

-- 3. Ensure unique fee per student for month/year
CREATE UNIQUE INDEX IF NOT EXISTS fees_student_month_year_idx ON fees(student_id, month, year);

-- 4. Enable Row-Level Security
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

-- 5. Only admin users (who are in admin_users) can manage fees
DROP POLICY IF EXISTS "Admin can manage fees" ON public.fees;
CREATE POLICY "Admin can manage fees"
  ON public.fees
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.email = current_setting('request.jwt.claim.email', true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.email = current_setting('request.jwt.claim.email', true)
    )
  );

-- 6. Update students table: add default_monthly_fee if it doesn't exist
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS default_monthly_fee integer NOT NULL DEFAULT 2000;

-- 7. Update students table: add profile_image_url if not present (for photo in admin UI)
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS profile_image_url text;

-- 8. Ensure admin_users RLS is enabled
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
