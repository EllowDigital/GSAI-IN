-- Support per-program monthly fee records for multi-program students.
ALTER TABLE public.fees
ADD COLUMN IF NOT EXISTS program_name text;

-- Backfill missing program_name using primary student program, then first CSV program fallback.
WITH primary_programs AS (
  SELECT
    s.id AS student_id,
    COALESCE(
      (
        SELECT sp.program_name
        FROM public.student_programs sp
        WHERE sp.student_id = s.id
        ORDER BY sp.is_primary DESC, sp.created_at ASC
        LIMIT 1
      ),
      NULLIF(BTRIM(SPLIT_PART(COALESCE(s.program, ''), ',', 1)), ''),
      'General'
    ) AS resolved_program
  FROM public.students s
)
UPDATE public.fees f
SET program_name = pp.resolved_program
FROM primary_programs pp
WHERE f.student_id = pp.student_id
  AND (f.program_name IS NULL OR BTRIM(f.program_name) = '');

UPDATE public.fees
SET program_name = 'General'
WHERE program_name IS NULL OR BTRIM(program_name) = '';

ALTER TABLE public.fees
ALTER COLUMN program_name SET DEFAULT 'General',
ALTER COLUMN program_name SET NOT NULL;

DROP INDEX IF EXISTS public.fees_student_month_year_idx;

CREATE UNIQUE INDEX IF NOT EXISTS fees_student_month_year_program_idx
ON public.fees(student_id, month, year, program_name);

CREATE INDEX IF NOT EXISTS idx_fees_student_program
ON public.fees(student_id, program_name);
