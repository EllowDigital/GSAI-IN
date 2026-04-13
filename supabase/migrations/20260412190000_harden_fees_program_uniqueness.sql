-- Normalize and enforce case-insensitive uniqueness for fee records.

CREATE EXTENSION IF NOT EXISTS citext;

-- 1) Normalize program names.
UPDATE public.fees
SET program_name = BTRIM(program_name)
WHERE program_name IS NOT NULL;

-- 2) Remove duplicate fee rows for same student + month + year + program (case-insensitive).
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

-- 3) Use CITEXT-backed column uniqueness so ON CONFLICT can target raw columns.
DROP INDEX IF EXISTS public.fees_student_month_year_program_idx;
DROP INDEX IF EXISTS public.fees_student_month_year_program_ci_idx;

ALTER TABLE public.fees
ALTER COLUMN program_name TYPE citext USING BTRIM(program_name)::citext;

CREATE UNIQUE INDEX IF NOT EXISTS fees_student_month_year_program_idx
ON public.fees (student_id, month, year, program_name);

-- 4) Normalize and dedupe custom override table similarly.
UPDATE public.student_program_fee_overrides
SET program_name = BTRIM(program_name)
WHERE program_name IS NOT NULL;

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

DROP INDEX IF EXISTS public.student_program_fee_overrides_student_program_ci_idx;

ALTER TABLE public.student_program_fee_overrides
ALTER COLUMN program_name TYPE citext USING BTRIM(program_name)::citext;

CREATE UNIQUE INDEX IF NOT EXISTS student_program_fee_overrides_student_program_idx
ON public.student_program_fee_overrides (student_id, program_name);
