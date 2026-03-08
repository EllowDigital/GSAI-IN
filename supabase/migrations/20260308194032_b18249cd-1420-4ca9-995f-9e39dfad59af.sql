
-- Fix RLS: Add admin_users email-based policies for enrollment_requests
CREATE POLICY "admin_users_manage_enrollment"
ON public.enrollment_requests FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));

-- Fix RLS: Add admin_users email-based policies for student_portal_accounts
CREATE POLICY "admin_users_manage_portal_accounts"
ON public.student_portal_accounts FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));

-- Fix RLS: Add admin_users email-based policies for attendance
CREATE POLICY "admin_users_manage_attendance"
ON public.attendance FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));

-- Fix RLS: Add admin_users email-based policies for announcements
CREATE POLICY "admin_users_manage_announcements"
ON public.announcements FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));

-- Fix RLS: Add admin_users email-based policies for competition tables
CREATE POLICY "admin_users_manage_competitions"
ON public.competitions FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));

CREATE POLICY "admin_users_manage_comp_registrations"
ON public.competition_registrations FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));

CREATE POLICY "admin_users_manage_comp_certificates"
ON public.competition_certificates FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));

-- Fix RLS: Add admin_users email-based policies for progression tables
CREATE POLICY "admin_users_manage_student_progress"
ON public.student_progress FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));

CREATE POLICY "admin_users_manage_discipline_progress"
ON public.student_discipline_progress FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));

CREATE POLICY "admin_users_manage_promotion_history"
ON public.promotion_history FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));

-- Fix RLS: Add admin_users email-based policies for belt_levels
CREATE POLICY "admin_users_manage_belt_levels"
ON public.belt_levels FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));

-- Fix RLS: Add admin_users email-based policy for academy_settings
CREATE POLICY "admin_users_manage_settings"
ON public.academy_settings FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
