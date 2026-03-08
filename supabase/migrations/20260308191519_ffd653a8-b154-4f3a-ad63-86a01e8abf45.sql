
-- Add position column to competition_registrations
ALTER TABLE public.competition_registrations 
ADD COLUMN IF NOT EXISTS position text DEFAULT NULL;

-- Add position_announced flag
ALTER TABLE public.competition_registrations 
ADD COLUMN IF NOT EXISTS position_notes text DEFAULT NULL;

-- Create student-avatars storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student-avatars', 'student-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for student-avatars bucket: students can upload their own avatars
CREATE POLICY "Students can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'student-avatars' 
  AND EXISTS (
    SELECT 1 FROM public.student_portal_accounts spa 
    WHERE spa.auth_user_id = auth.uid()
  )
);

CREATE POLICY "Students can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'student-avatars' 
  AND EXISTS (
    SELECT 1 FROM public.student_portal_accounts spa 
    WHERE spa.auth_user_id = auth.uid()
  )
);

CREATE POLICY "Public can read student avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'student-avatars');

-- Allow students to update their own profile (name, parent_name, parent_contact, profile_image_url only)
CREATE POLICY "student_update_own_profile"
ON public.students FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.student_portal_accounts spa 
    WHERE spa.auth_user_id = auth.uid() AND spa.student_id = students.id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.student_portal_accounts spa 
    WHERE spa.auth_user_id = auth.uid() AND spa.student_id = students.id
  )
);
