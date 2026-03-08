
-- Add aadhar_number to enrollment_requests for duplicate checking
ALTER TABLE public.enrollment_requests ADD COLUMN IF NOT EXISTS aadhar_number text;

-- Create attendance table
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  check_in_time timestamptz,
  check_out_time timestamptz,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'holiday')),
  notes text,
  marked_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, date)
);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "admin_manage_attendance" ON public.attendance
  FOR ALL TO authenticated
  USING (has_role('admin'::text))
  WITH CHECK (has_role('admin'::text));

-- Students read own attendance
CREATE POLICY "student_read_own_attendance" ON public.attendance
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid() AND spa.student_id = attendance.student_id
  ));

-- Create index for fast queries
CREATE INDEX idx_attendance_student_date ON public.attendance (student_id, date);
CREATE INDEX idx_attendance_date ON public.attendance (date);
