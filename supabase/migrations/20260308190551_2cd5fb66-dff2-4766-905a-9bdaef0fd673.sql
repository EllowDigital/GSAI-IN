
-- Create enrollment_requests table for website enrollment form submissions
CREATE TABLE public.enrollment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL,
  parent_name text NOT NULL,
  parent_phone text NOT NULL,
  program text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by text
);

-- Enable RLS
ALTER TABLE public.enrollment_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit enrollment requests (public insert)
CREATE POLICY "public_submit_enrollment" ON public.enrollment_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Admins can manage all enrollment requests
CREATE POLICY "admin_manage_enrollment" ON public.enrollment_requests
  FOR ALL TO authenticated
  USING (has_role('admin'::text))
  WITH CHECK (has_role('admin'::text));

-- Fix announcements: add permissive SELECT for anon (public announcements should be readable)
-- Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "student_read_announcements" ON public.announcements;
DROP POLICY IF EXISTS "admin_manage_announcements" ON public.announcements;

CREATE POLICY "admin_manage_announcements" ON public.announcements
  FOR ALL TO authenticated
  USING (has_role('admin'::text))
  WITH CHECK (has_role('admin'::text));

CREATE POLICY "authenticated_read_active_announcements" ON public.announcements
  FOR SELECT TO authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));
