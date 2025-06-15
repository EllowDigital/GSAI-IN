
-- 1. Backup (optional) the old "fees" table if critical.
-- 2. Update "fees" table to match required dashboard/fee management shape.

-- (a) Add new columns for the current system
ALTER TABLE public.fees
  ADD COLUMN IF NOT EXISTS monthly_fee integer NOT NULL DEFAULT 2000,
  ADD COLUMN IF NOT EXISTS paid_amount integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_due integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS year integer NOT NULL DEFAULT 2025;

-- (b) Ensure "month" is integer (not text), remove/rename if needed
ALTER TABLE public.fees
  ALTER COLUMN month TYPE integer USING (month::integer);

-- (c) Remove "amount", "due_date" columns if not needed by UI
ALTER TABLE public.fees
  DROP COLUMN IF EXISTS amount,
  DROP COLUMN IF EXISTS due_date;

-- (d) Set "status" to be a simple text with default
ALTER TABLE public.fees
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status SET DEFAULT 'unpaid';

-- (e) Ensure unique constraint for (student_id, month, year)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename = 'fees' AND indexname = 'fees_student_month_year_idx'
  ) THEN
    CREATE UNIQUE INDEX fees_student_month_year_idx ON public.fees(student_id, month, year);
  END IF;
END$$;

-- (f) Update any rows with NULL monthly_fee, paid_amount, etc.
UPDATE public.fees SET monthly_fee = 2000 WHERE monthly_fee IS NULL;
UPDATE public.fees SET paid_amount = 0 WHERE paid_amount IS NULL;
UPDATE public.fees SET balance_due = 0 WHERE balance_due IS NULL;
UPDATE public.fees SET year = 2025 WHERE year IS NULL;

-- (g) (OPTIONAL) Fix "status" values
UPDATE public.fees SET status = 'unpaid' WHERE status IS NULL;
