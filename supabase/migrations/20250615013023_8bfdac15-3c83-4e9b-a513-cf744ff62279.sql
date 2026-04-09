
ALTER TABLE public.fees
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Set default value for all rows
UPDATE public.fees SET updated_at = now() WHERE updated_at IS NULL;
