-- Normalize and enforce case-insensitive uniqueness for fee records.

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

-- 3) Replace case-sensitive unique index with case-insensitive functional unique index.
DROP INDEX IF EXISTS public.fees_student_month_year_program_idx;
CREATE UNIQUE INDEX IF NOT EXISTS fees_student_month_year_program_ci_idx
ON public.fees (student_id, month, year, LOWER(BTRIM(program_name)));

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

CREATE UNIQUE INDEX IF NOT EXISTS student_program_fee_overrides_student_program_ci_idx
ON public.student_program_fee_overrides (student_id, LOWER(BTRIM(program_name)));
