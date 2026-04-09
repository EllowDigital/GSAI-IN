CREATE TABLE IF NOT EXISTS public.announcement_delivery_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_type text NOT NULL CHECK (announcement_type IN ('event', 'competition')),
  announcement_title text NOT NULL,
  total_recipients integer NOT NULL DEFAULT 0,
  sent_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  triggered_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_announcement_delivery_logs_created_at
  ON public.announcement_delivery_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcement_delivery_logs_type_created_at
  ON public.announcement_delivery_logs(announcement_type, created_at DESC);
ALTER TABLE public.announcement_delivery_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_read_delivery_logs" ON public.announcement_delivery_logs;
CREATE POLICY "admin_read_delivery_logs"
  ON public.announcement_delivery_logs
  FOR SELECT
  TO authenticated
  USING (has_role('admin'::text));
DROP POLICY IF EXISTS "admin_insert_delivery_logs" ON public.announcement_delivery_logs;
CREATE POLICY "admin_insert_delivery_logs"
  ON public.announcement_delivery_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role('admin'::text));
