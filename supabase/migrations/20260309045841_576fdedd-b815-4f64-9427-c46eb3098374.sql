-- =====================================================
-- MASTER FIX: Convert ALL restrictive RLS policies to PERMISSIVE
-- =====================================================

-- ==================== academy_settings ====================
DROP POLICY IF EXISTS "admin_manage_settings" ON public.academy_settings;
DROP POLICY IF EXISTS "admin_users_manage_settings" ON public.academy_settings;
DROP POLICY IF EXISTS "public_read_settings" ON public.academy_settings;
CREATE POLICY "admin_manage_settings" ON public.academy_settings FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_settings" ON public.academy_settings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "public_read_settings" ON public.academy_settings FOR SELECT TO authenticated USING (true);
-- ==================== admin_users ====================
DROP POLICY IF EXISTS "Admin can read own admin record" ON public.admin_users;
CREATE POLICY "Admin can read own admin record" ON public.admin_users FOR SELECT TO authenticated
  USING (email = auth.email());
-- ==================== announcements ====================
DROP POLICY IF EXISTS "admin_manage_announcements" ON public.announcements;
DROP POLICY IF EXISTS "admin_users_manage_announcements" ON public.announcements;
DROP POLICY IF EXISTS "authenticated_read_active_announcements" ON public.announcements;
CREATE POLICY "admin_manage_announcements" ON public.announcements FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_announcements" ON public.announcements FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "authenticated_read_active_announcements" ON public.announcements FOR SELECT TO authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));
-- ==================== attendance ====================
DROP POLICY IF EXISTS "admin_manage_attendance" ON public.attendance;
DROP POLICY IF EXISTS "admin_users_manage_attendance" ON public.attendance;
DROP POLICY IF EXISTS "student_read_own_attendance" ON public.attendance;
CREATE POLICY "admin_manage_attendance" ON public.attendance FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_attendance" ON public.attendance FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_read_own_attendance" ON public.attendance FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = attendance.student_id));
-- ==================== audit_logs ====================
DROP POLICY IF EXISTS "Admin roles view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admin roles view audit logs" ON public.audit_logs FOR SELECT TO authenticated
  USING (has_role('admin'::text));
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
-- ==================== belt_exam_notifications ====================
DROP POLICY IF EXISTS "admin_manage_belt_exam_notifications" ON public.belt_exam_notifications;
DROP POLICY IF EXISTS "admin_role_manage_belt_exam_notifications" ON public.belt_exam_notifications;
DROP POLICY IF EXISTS "student_read_own_belt_exam_notifications" ON public.belt_exam_notifications;
DROP POLICY IF EXISTS "student_update_own_belt_exam_notifications" ON public.belt_exam_notifications;
CREATE POLICY "admin_manage_belt_exam_notifications" ON public.belt_exam_notifications FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "admin_role_manage_belt_exam_notifications" ON public.belt_exam_notifications FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "student_read_own_belt_exam_notifications" ON public.belt_exam_notifications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = belt_exam_notifications.student_id));
CREATE POLICY "student_update_own_belt_exam_notifications" ON public.belt_exam_notifications FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = belt_exam_notifications.student_id))
  WITH CHECK (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = belt_exam_notifications.student_id));
-- ==================== belt_levels ====================
DROP POLICY IF EXISTS "Admin roles delete belts" ON public.belt_levels;
DROP POLICY IF EXISTS "Admin roles insert belts" ON public.belt_levels;
DROP POLICY IF EXISTS "Admin roles select belts" ON public.belt_levels;
DROP POLICY IF EXISTS "Admin roles update belts" ON public.belt_levels;
DROP POLICY IF EXISTS "Admins manage belt levels" ON public.belt_levels;
DROP POLICY IF EXISTS "admin_users_manage_belt_levels" ON public.belt_levels;
DROP POLICY IF EXISTS "student_read_belt_levels" ON public.belt_levels;
CREATE POLICY "admin_role_manage_belt_levels" ON public.belt_levels FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_belt_levels" ON public.belt_levels FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_read_belt_levels" ON public.belt_levels FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid()));
-- ==================== blogs ====================
DROP POLICY IF EXISTS "Admin roles manage blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins can do everything on blogs" ON public.blogs;
DROP POLICY IF EXISTS "Public can read blogs" ON public.blogs;
DROP POLICY IF EXISTS "public_select_blogs" ON public.blogs;
DROP POLICY IF EXISTS "sitemap_reads_blogs" ON public.blogs;
CREATE POLICY "admin_role_manage_blogs" ON public.blogs FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_blogs" ON public.blogs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "public_read_blogs" ON public.blogs FOR SELECT USING (true);
-- ==================== competition_certificates ====================
DROP POLICY IF EXISTS "admin_manage_certificates" ON public.competition_certificates;
DROP POLICY IF EXISTS "admin_users_manage_comp_certificates" ON public.competition_certificates;
DROP POLICY IF EXISTS "student_view_certificates" ON public.competition_certificates;
CREATE POLICY "admin_manage_certificates" ON public.competition_certificates FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_comp_certificates" ON public.competition_certificates FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_view_certificates" ON public.competition_certificates FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = competition_certificates.student_id));
-- ==================== competition_registrations ====================
DROP POLICY IF EXISTS "admin_manage_registrations" ON public.competition_registrations;
DROP POLICY IF EXISTS "admin_users_manage_comp_registrations" ON public.competition_registrations;
DROP POLICY IF EXISTS "student_register" ON public.competition_registrations;
DROP POLICY IF EXISTS "student_view_registrations" ON public.competition_registrations;
CREATE POLICY "admin_manage_registrations" ON public.competition_registrations FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_comp_registrations" ON public.competition_registrations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_register" ON public.competition_registrations FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = competition_registrations.student_id));
CREATE POLICY "student_view_registrations" ON public.competition_registrations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = competition_registrations.student_id));
-- ==================== competitions ====================
DROP POLICY IF EXISTS "admin_manage_competitions" ON public.competitions;
DROP POLICY IF EXISTS "admin_users_manage_competitions" ON public.competitions;
DROP POLICY IF EXISTS "public_read_competitions" ON public.competitions;
CREATE POLICY "admin_manage_competitions" ON public.competitions FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_competitions" ON public.competitions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "public_read_competitions" ON public.competitions FOR SELECT USING (true);
-- ==================== discipline_levels ====================
DROP POLICY IF EXISTS "Admin roles can manage discipline levels" ON public.discipline_levels;
DROP POLICY IF EXISTS "Public can read discipline levels" ON public.discipline_levels;
CREATE POLICY "admin_manage_discipline_levels" ON public.discipline_levels FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_discipline_levels" ON public.discipline_levels FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "public_read_discipline_levels" ON public.discipline_levels FOR SELECT USING (true);
-- ==================== disciplines ====================
DROP POLICY IF EXISTS "admin_manage_disciplines" ON public.disciplines;
DROP POLICY IF EXISTS "admin_role_manage_disciplines" ON public.disciplines;
DROP POLICY IF EXISTS "public_read_disciplines" ON public.disciplines;
CREATE POLICY "admin_manage_disciplines" ON public.disciplines FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "admin_role_manage_disciplines" ON public.disciplines FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "public_read_disciplines" ON public.disciplines FOR SELECT USING (true);
-- ==================== enrollment_requests ====================
DROP POLICY IF EXISTS "admin_manage_enrollment" ON public.enrollment_requests;
DROP POLICY IF EXISTS "admin_users_manage_enrollment" ON public.enrollment_requests;
DROP POLICY IF EXISTS "public_submit_enrollment" ON public.enrollment_requests;
CREATE POLICY "admin_manage_enrollment" ON public.enrollment_requests FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_enrollment" ON public.enrollment_requests FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "public_submit_enrollment" ON public.enrollment_requests FOR INSERT WITH CHECK (true);
-- ==================== events ====================
DROP POLICY IF EXISTS "Admin roles manage events" ON public.events;
DROP POLICY IF EXISTS "Admins can access and modify all events (standard)" ON public.events;
DROP POLICY IF EXISTS "Public can read events" ON public.events;
DROP POLICY IF EXISTS "public_select_events" ON public.events;
DROP POLICY IF EXISTS "sitemap_reads_events" ON public.events;
CREATE POLICY "admin_role_manage_events" ON public.events FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_events" ON public.events FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "public_read_events" ON public.events FOR SELECT USING (true);
-- ==================== fees ====================
DROP POLICY IF EXISTS "Admin roles delete fees" ON public.fees;
DROP POLICY IF EXISTS "Admin roles insert fees" ON public.fees;
DROP POLICY IF EXISTS "Admin roles select fees" ON public.fees;
DROP POLICY IF EXISTS "Admin roles update fees" ON public.fees;
DROP POLICY IF EXISTS "Verified admins can delete fees" ON public.fees;
DROP POLICY IF EXISTS "Verified admins can insert fees" ON public.fees;
DROP POLICY IF EXISTS "Verified admins can update fees" ON public.fees;
DROP POLICY IF EXISTS "Verified admins can view all fees" ON public.fees;
DROP POLICY IF EXISTS "student_read_own_fees" ON public.fees;
CREATE POLICY "admin_role_manage_fees" ON public.fees FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_fees" ON public.fees FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_read_own_fees" ON public.fees FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = fees.student_id));
-- ==================== gallery_images ====================
DROP POLICY IF EXISTS "Admin roles manage gallery" ON public.gallery_images;
DROP POLICY IF EXISTS "Admins can do everything on gallery_images" ON public.gallery_images;
DROP POLICY IF EXISTS "Admins can insert gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Admins manage gallery" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow logged-in users to insert" ON public.gallery_images;
DROP POLICY IF EXISTS "Anyone can select gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Authenticated insert" ON public.gallery_images;
DROP POLICY IF EXISTS "Public can read gallery images" ON public.gallery_images;
CREATE POLICY "admin_role_manage_gallery" ON public.gallery_images FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_gallery" ON public.gallery_images FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "public_read_gallery" ON public.gallery_images FOR SELECT USING (true);
-- ==================== news ====================
DROP POLICY IF EXISTS "Admin roles manage news" ON public.news;
DROP POLICY IF EXISTS "Admins can do everything on news" ON public.news;
DROP POLICY IF EXISTS "Public can read news" ON public.news;
DROP POLICY IF EXISTS "public_select_news" ON public.news;
DROP POLICY IF EXISTS "sitemap_reads_news" ON public.news;
CREATE POLICY "admin_role_manage_news" ON public.news FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_news" ON public.news FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "public_read_news" ON public.news FOR SELECT USING (true);
-- ==================== program_testimonials ====================
DROP POLICY IF EXISTS "Admin roles manage testimonials" ON public.program_testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.program_testimonials;
DROP POLICY IF EXISTS "Public can read published testimonials" ON public.program_testimonials;
CREATE POLICY "admin_role_manage_testimonials" ON public.program_testimonials FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_testimonials" ON public.program_testimonials FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "public_read_published_testimonials" ON public.program_testimonials FOR SELECT USING (is_published = true);
-- ==================== promotion_history ====================
DROP POLICY IF EXISTS "Admin roles can delete promotion history" ON public.promotion_history;
DROP POLICY IF EXISTS "Admin roles can insert promotion history" ON public.promotion_history;
DROP POLICY IF EXISTS "Admin roles can view promotion history" ON public.promotion_history;
DROP POLICY IF EXISTS "admin_users_manage_promotion_history" ON public.promotion_history;
DROP POLICY IF EXISTS "student_read_own_promotions" ON public.promotion_history;
CREATE POLICY "admin_role_manage_promotion_history" ON public.promotion_history FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_promotion_history" ON public.promotion_history FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_read_own_promotions" ON public.promotion_history FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = promotion_history.student_id));
-- ==================== sensitive_data_audit ====================
DROP POLICY IF EXISTS "Admin roles view sensitive logs" ON public.sensitive_data_audit;
DROP POLICY IF EXISTS "Allow audit logging" ON public.sensitive_data_audit;
CREATE POLICY "admin_view_sensitive_logs" ON public.sensitive_data_audit FOR SELECT TO authenticated
  USING (has_role('admin'::text));
CREATE POLICY "allow_audit_logging" ON public.sensitive_data_audit FOR INSERT WITH CHECK (true);
-- ==================== student_discipline_progress ====================
DROP POLICY IF EXISTS "Admin roles can manage student discipline progress" ON public.student_discipline_progress;
DROP POLICY IF EXISTS "admin_users_manage_discipline_progress" ON public.student_discipline_progress;
DROP POLICY IF EXISTS "student_read_own_discipline_progress" ON public.student_discipline_progress;
CREATE POLICY "admin_role_manage_discipline_progress" ON public.student_discipline_progress FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_discipline_progress" ON public.student_discipline_progress FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_read_own_discipline_progress" ON public.student_discipline_progress FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = student_discipline_progress.student_id));
-- ==================== student_portal_accounts ====================
DROP POLICY IF EXISTS "admin_manage_portal_accounts" ON public.student_portal_accounts;
DROP POLICY IF EXISTS "admin_users_manage_portal_accounts" ON public.student_portal_accounts;
DROP POLICY IF EXISTS "student_read_own_account" ON public.student_portal_accounts;
CREATE POLICY "admin_manage_portal_accounts" ON public.student_portal_accounts FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_portal_accounts" ON public.student_portal_accounts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_read_own_account" ON public.student_portal_accounts FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());
-- ==================== student_programs ====================
DROP POLICY IF EXISTS "admin_manage_student_programs" ON public.student_programs;
DROP POLICY IF EXISTS "admin_users_manage_student_programs" ON public.student_programs;
DROP POLICY IF EXISTS "student_read_own_programs" ON public.student_programs;
CREATE POLICY "admin_manage_student_programs" ON public.student_programs FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_student_programs" ON public.student_programs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_read_own_programs" ON public.student_programs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = student_programs.student_id));
-- ==================== student_progress ====================
DROP POLICY IF EXISTS "Admin roles delete student progress" ON public.student_progress;
DROP POLICY IF EXISTS "Admin roles insert student progress" ON public.student_progress;
DROP POLICY IF EXISTS "Admin roles read student progress" ON public.student_progress;
DROP POLICY IF EXISTS "Admin roles update student progress" ON public.student_progress;
DROP POLICY IF EXISTS "Instructor evidence uploads" ON public.student_progress;
DROP POLICY IF EXISTS "admin_users_manage_student_progress" ON public.student_progress;
DROP POLICY IF EXISTS "student_read_own_progress" ON public.student_progress;
CREATE POLICY "admin_role_manage_student_progress" ON public.student_progress FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_student_progress" ON public.student_progress FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "instructor_evidence_uploads" ON public.student_progress FOR UPDATE TO authenticated
  USING (has_role('instructor'::text))
  WITH CHECK (has_role('instructor'::text) AND is_progress_status_unchanged(id, status));
CREATE POLICY "student_read_own_progress" ON public.student_progress FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = student_progress.student_id));
-- ==================== students ====================
DROP POLICY IF EXISTS "Admin roles manage students" ON public.students;
DROP POLICY IF EXISTS "Admins can do everything on students" ON public.students;
DROP POLICY IF EXISTS "student_read_own_profile" ON public.students;
DROP POLICY IF EXISTS "student_update_own_profile" ON public.students;
CREATE POLICY "admin_role_manage_students" ON public.students FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_students" ON public.students FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_read_own_profile" ON public.students FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = students.id));
CREATE POLICY "student_update_own_profile" ON public.students FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = students.id))
  WITH CHECK (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = students.id));
-- ==================== user_roles ====================
DROP POLICY IF EXISTS "Admins manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "admins_manage_roles" ON public.user_roles FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "users_read_own_roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
