
-- The error occurs because the "status" column in the "fees" table is generated as a "GENERATED ALWAYS" column,
-- which means you CANNOT insert or update it directly. It must only be assigned by Postgres.
-- To fix this and allow direct setting of "status" in inserts and updates, we'll drop the generated property and make it a normal text column,
-- then set its default to 'unpaid' for new rows.

-- Drop expression and keep status as normal TEXT with default 'unpaid'
ALTER TABLE public.fees
ALTER COLUMN status DROP EXPRESSION;

ALTER TABLE public.fees
ALTER COLUMN status SET DEFAULT 'unpaid';

-- (optional but recommended) Update all existing rows with NULL status to 'unpaid'
UPDATE public.fees SET status = 'unpaid' WHERE status IS NULL;

