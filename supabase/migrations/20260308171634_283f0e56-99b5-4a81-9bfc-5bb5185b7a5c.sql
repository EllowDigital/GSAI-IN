
-- 1. Create all tables first (no cross-references in policies yet)
CREATE TABLE IF NOT EXISTS public.student_portal_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL UNIQUE,
  login_id text NOT NULL UNIQUE,
  auth_user_id uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  date date NOT NULL,
  end_date date,
  location_text text,
  location_lat double precision,
  location_lng double precision,
  max_participants integer,
  image_url text,
  status text NOT NULL DEFAULT 'upcoming',
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.competition_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'registered',
  registered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(competition_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.competition_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  certificate_url text NOT NULL,
  uploaded_by text,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(competition_id, student_id)
);

-- 2. Enable RLS
ALTER TABLE public.student_portal_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_certificates ENABLE ROW LEVEL SECURITY;

-- 3. Admin policies
CREATE POLICY "admin_manage_portal_accounts" ON public.student_portal_accounts FOR ALL TO authenticated USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "student_read_own_account" ON public.student_portal_accounts FOR SELECT TO authenticated USING (auth_user_id = auth.uid());

CREATE POLICY "admin_manage_competitions" ON public.competitions FOR ALL TO authenticated USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "public_read_competitions" ON public.competitions FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "admin_manage_registrations" ON public.competition_registrations FOR ALL TO authenticated USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "student_register" ON public.competition_registrations FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = competition_registrations.student_id));
CREATE POLICY "student_view_registrations" ON public.competition_registrations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = competition_registrations.student_id));

CREATE POLICY "admin_manage_certificates" ON public.competition_certificates FOR ALL TO authenticated USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "student_view_certificates" ON public.competition_certificates FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = competition_certificates.student_id));

-- 4. Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', true) ON CONFLICT (id) DO NOTHING;

-- 5. Trigger
CREATE TRIGGER update_competitions_updated_at BEFORE UPDATE ON public.competitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
