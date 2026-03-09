
-- Belt exam notifications table
CREATE TABLE public.belt_exam_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  exam_date DATE NOT NULL,
  discipline TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.belt_exam_notifications ENABLE ROW LEVEL SECURITY;

-- Admin can manage all notifications
CREATE POLICY "admin_manage_belt_exam_notifications" ON public.belt_exam_notifications
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));

CREATE POLICY "admin_role_manage_belt_exam_notifications" ON public.belt_exam_notifications
  FOR ALL TO authenticated
  USING (has_role('admin'::text))
  WITH CHECK (has_role('admin'::text));

-- Students can read their own notifications
CREATE POLICY "student_read_own_belt_exam_notifications" ON public.belt_exam_notifications
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid() AND spa.student_id = belt_exam_notifications.student_id
  ));

-- Students can mark their own notifications as read
CREATE POLICY "student_update_own_belt_exam_notifications" ON public.belt_exam_notifications
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid() AND spa.student_id = belt_exam_notifications.student_id
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid() AND spa.student_id = belt_exam_notifications.student_id
  ));

-- Disciplines management table
CREATE TABLE public.disciplines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'belt' CHECK (type IN ('belt', 'level')),
  has_stripes BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_disciplines" ON public.disciplines
  FOR SELECT USING (true);

CREATE POLICY "admin_manage_disciplines" ON public.disciplines
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));

CREATE POLICY "admin_role_manage_disciplines" ON public.disciplines
  FOR ALL TO authenticated
  USING (has_role('admin'::text))
  WITH CHECK (has_role('admin'::text));

-- Seed default disciplines
INSERT INTO public.disciplines (name, type, has_stripes, description, display_order) VALUES
  ('Taekwondo', 'belt', false, 'Korean martial art with belt progression', 1),
  ('Karate', 'belt', false, 'Japanese martial art with belt progression', 2),
  ('Kickboxing', 'belt', false, 'Combat sport with grade/belt progression', 3),
  ('BJJ', 'belt', true, 'Brazilian Jiu-Jitsu with IBJJF belt system', 4),
  ('Grappling', 'belt', true, 'Grappling following IBJJF belt system', 5),
  ('Boxing', 'level', false, 'Performance-based progression', 6),
  ('MMA', 'level', false, 'Experience/fight readiness levels', 7),
  ('Self-Defense', 'level', false, 'Skill-based progression', 8),
  ('Fitness', 'level', false, 'Milestone-based progression', 9),
  ('Fat Loss', 'level', false, 'Program phase progression', 10),
  ('Kalaripayattu', 'level', false, 'Traditional Indian martial art', 11);
