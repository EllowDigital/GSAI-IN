
-- Program testimonials table
CREATE TABLE public.program_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_slug text NOT NULL,
  student_name text NOT NULL,
  review text NOT NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text,
  is_published boolean NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.program_testimonials ENABLE ROW LEVEL SECURITY;

-- Public can read published testimonials
CREATE POLICY "Public can read published testimonials"
  ON public.program_testimonials FOR SELECT
  USING (is_published = true);

-- Admins can manage testimonials
CREATE POLICY "Admin roles manage testimonials"
  ON public.program_testimonials FOR ALL
  TO authenticated
  USING (has_role('admin'::text))
  WITH CHECK (has_role('admin'::text));

-- Admins via admin_users table
CREATE POLICY "Admins can manage testimonials"
  ON public.program_testimonials FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.email()));
