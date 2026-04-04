ALTER TABLE public.enrollment_requests
  ADD COLUMN IF NOT EXISTS linked_student_id uuid REFERENCES public.students(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_enrollment_requests_linked_student_id
  ON public.enrollment_requests(linked_student_id);

UPDATE public.enrollment_requests er
SET linked_student_id = s.id
FROM public.students s
WHERE er.linked_student_id IS NULL
  AND er.status = 'approved'
  AND er.aadhar_number IS NOT NULL
  AND er.aadhar_number = s.aadhar_number;
