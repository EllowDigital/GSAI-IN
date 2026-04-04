ALTER TABLE public.enrollment_requests
ADD COLUMN IF NOT EXISTS parent_email text;

ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS parent_email text;

CREATE INDEX IF NOT EXISTS idx_enrollment_requests_parent_email
  ON public.enrollment_requests(parent_email);

CREATE INDEX IF NOT EXISTS idx_students_parent_email
  ON public.students(parent_email);

-- Backfill students.parent_email from latest linked enrollment request when available.
WITH latest_parent_email AS (
  SELECT DISTINCT ON (linked_student_id)
    linked_student_id,
    NULLIF(TRIM(parent_email), '') AS parent_email
  FROM public.enrollment_requests
  WHERE linked_student_id IS NOT NULL
    AND parent_email IS NOT NULL
  ORDER BY linked_student_id, created_at DESC
)
UPDATE public.students s
SET parent_email = lpe.parent_email
FROM latest_parent_email lpe
WHERE s.id = lpe.linked_student_id
  AND lpe.parent_email IS NOT NULL
  AND (s.parent_email IS NULL OR TRIM(s.parent_email) = '');
