CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  icon text NOT NULL DEFAULT '🥋',
  short_description text NOT NULL DEFAULT '',
  full_description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  level text NOT NULL DEFAULT '',
  benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  schedule text NOT NULL DEFAULT '',
  age_group text NOT NULL DEFAULT '',
  duration text NOT NULL DEFAULT '',
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.programs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programs TO authenticated;
GRANT ALL ON public.programs TO service_role;

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Programs are publicly readable" ON public.programs FOR SELECT USING (is_active OR public.is_academy_admin());
CREATE POLICY "Admins manage programs insert" ON public.programs FOR INSERT TO authenticated WITH CHECK (public.is_academy_admin());
CREATE POLICY "Admins manage programs update" ON public.programs FOR UPDATE TO authenticated USING (public.is_academy_admin()) WITH CHECK (public.is_academy_admin());
CREATE POLICY "Admins manage programs delete" ON public.programs FOR DELETE TO authenticated USING (public.is_academy_admin());

CREATE TRIGGER programs_updated_at BEFORE UPDATE ON public.programs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.coaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  specialties jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.coaches TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coaches TO authenticated;
GRANT ALL ON public.coaches TO service_role;

ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches are publicly readable" ON public.coaches FOR SELECT USING (is_active OR public.is_academy_admin());
CREATE POLICY "Admins manage coaches insert" ON public.coaches FOR INSERT TO authenticated WITH CHECK (public.is_academy_admin());
CREATE POLICY "Admins manage coaches update" ON public.coaches FOR UPDATE TO authenticated USING (public.is_academy_admin()) WITH CHECK (public.is_academy_admin());
CREATE POLICY "Admins manage coaches delete" ON public.coaches FOR DELETE TO authenticated USING (public.is_academy_admin());

CREATE TRIGGER coaches_updated_at BEFORE UPDATE ON public.coaches
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();