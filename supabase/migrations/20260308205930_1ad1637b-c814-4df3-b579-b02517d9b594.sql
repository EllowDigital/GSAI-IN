-- Sync: insert missing primary program records for all students
INSERT INTO public.student_programs (student_id, program_name, joined_at, is_primary)
SELECT s.id, s.program, s.join_date, true
FROM public.students s
LEFT JOIN public.student_programs sp ON sp.student_id = s.id AND sp.is_primary = true
WHERE sp.id IS NULL
ON CONFLICT (student_id, program_name) DO UPDATE SET is_primary = true;