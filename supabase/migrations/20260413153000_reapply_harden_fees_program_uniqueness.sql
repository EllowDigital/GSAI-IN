-- Re-apply hardening for fees/program uniqueness after post-apply edits to 20260412190000.
-- This migration is intentionally idempotent and safe to run even if parts already exist.

CREATE EXTENSION IF NOT EXISTS citext;

-- Normalize whitespace first.
UPDATE public.fees
SET program_name = BTRIM(program_name)
WHERE program_name IS NOT NULL
  AND program_name <> BTRIM(program_name);

UPDATE public.student_program_fee_overrides
SET program_name = BTRIM(program_name)
WHERE program_name IS NOT NULL
  AND program_name <> BTRIM(program_name);

-- Deduplicate fees on logical key.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY student_id, month, year, LOWER(BTRIM(program_name))
      ORDER BY
        CASE WHEN status = 'paid' THEN 0 ELSE 1 END,
        paid_amount DESC,
        updated_at DESC NULLS LAST,
        created_at DESC NULLS LAST,
        id DESC
    ) AS rn
  FROM public.fees
)
DELETE FROM public.fees f
USING ranked r
WHERE f.id = r.id
  AND r.rn > 1;

-- Deduplicate overrides on logical key.
WITH ranked_overrides AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY student_id, LOWER(BTRIM(program_name))
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
    ) AS rn
  FROM public.student_program_fee_overrides
)
DELETE FROM public.student_program_fee_overrides o
USING ranked_overrides r
WHERE o.id = r.id
  AND r.rn > 1;

-- Remove old index shapes.
DROP INDEX IF EXISTS public.fees_student_month_year_program_ci_idx;
DROP INDEX IF EXISTS public.fees_student_month_year_program_idx;
DROP INDEX IF EXISTS public.student_program_fee_overrides_student_program_ci_idx;
DROP INDEX IF EXISTS public.student_program_fee_overrides_student_program_idx;

-- Ensure CITEXT columns so ON CONFLICT on raw columns remains valid and case-insensitive.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'fees'
      AND column_name = 'program_name'
      AND udt_name <> 'citext'
  ) THEN
    ALTER TABLE public.fees
    ALTER COLUMN program_name TYPE citext USING BTRIM(program_name)::citext;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'student_program_fee_overrides'
      AND column_name = 'program_name'
      AND udt_name <> 'citext'
  ) THEN
    ALTER TABLE public.student_program_fee_overrides
    ALTER COLUMN program_name TYPE citext USING BTRIM(program_name)::citext;
  END IF;
END $$;

-- Enforce column-based uniqueness used by app upserts.
CREATE UNIQUE INDEX IF NOT EXISTS fees_student_month_year_program_idx
ON public.fees (student_id, month, year, program_name);

CREATE UNIQUE INDEX IF NOT EXISTS student_program_fee_overrides_student_program_idx
ON public.student_program_fee_overrides (student_id, program_name);
