
-- 1. Students can read their own record via portal account link
CREATE POLICY "student_read_own_profile"
ON public.students
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid()
    AND spa.student_id = students.id
  )
);

-- 2. Students can read their own fees
CREATE POLICY "student_read_own_fees"
ON public.fees
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid()
    AND spa.student_id = fees.student_id
  )
);

-- 3. Students can read their own progression
CREATE POLICY "student_read_own_progress"
ON public.student_progress
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid()
    AND spa.student_id = student_progress.student_id
  )
);

-- 4. Students can read belt levels (reference data)
CREATE POLICY "student_read_belt_levels"
ON public.belt_levels
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid()
  )
);

-- 5. Students can read their own promotion history
CREATE POLICY "student_read_own_promotions"
ON public.promotion_history
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid()
    AND spa.student_id = promotion_history.student_id
  )
);

-- 6. Create announcements table
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  priority text NOT NULL DEFAULT 'normal',
  is_active boolean NOT NULL DEFAULT true,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Admins manage announcements
CREATE POLICY "admin_manage_announcements"
ON public.announcements
FOR ALL
TO authenticated
USING (has_role('admin'::text))
WITH CHECK (has_role('admin'::text));

-- Students can read active announcements
CREATE POLICY "student_read_announcements"
ON public.announcements
FOR SELECT
TO authenticated
USING (
  is_active = true
  AND (expires_at IS NULL OR expires_at > now())
);
