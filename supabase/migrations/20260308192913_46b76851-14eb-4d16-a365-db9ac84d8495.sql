-- Academy settings table for global defaults
CREATE TABLE IF NOT EXISTS public.academy_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text
);
ALTER TABLE public.academy_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_manage_settings" ON public.academy_settings
  FOR ALL TO authenticated
  USING (has_role('admin'::text))
  WITH CHECK (has_role('admin'::text));
CREATE POLICY "public_read_settings" ON public.academy_settings
  FOR SELECT TO authenticated
  USING (true);
-- Insert default fee setting
INSERT INTO public.academy_settings (key, value) VALUES ('default_monthly_fee', '2000') ON CONFLICT (key) DO NOTHING;
-- Add discount_percent to students table
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS discount_percent integer NOT NULL DEFAULT 0;
