
-- 1. Add 'default_monthly_fee' column to students
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS default_monthly_fee integer NOT NULL DEFAULT 2000;

-- 2. Create fees table 
CREATE TABLE public.fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL,
  monthly_fee integer NOT NULL,
  paid_amount integer NOT NULL DEFAULT 0,
  balance_due integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status text GENERATED ALWAYS AS (
    CASE 
      WHEN paid_amount >= monthly_fee + balance_due THEN 'paid'
      WHEN paid_amount > 0 THEN 'partial'
      ELSE 'unpaid'
    END
  ) STORED
);

-- 3. Enforce unique month/year/student combo
CREATE UNIQUE INDEX fees_student_month_year_idx ON public.fees(student_id, month, year);

-- 4. Enable RLS on fees table
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

-- 5. Read/write policy: only admins (role checked by email domain for now, adapt to your auth)
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
