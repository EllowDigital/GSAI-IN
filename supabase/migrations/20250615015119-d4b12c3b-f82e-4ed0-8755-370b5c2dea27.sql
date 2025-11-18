
-- Enable RLS to enforce security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop old policy if it exists (policy name may differ, adjust as needed)
DROP POLICY IF EXISTS "Admins can access and modify all events" ON public.events;

-- Add a robust RLS policy using auth.email()
CREATE POLICY "Admins can access and modify all events (standard)"
  ON public.events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE email = auth.email()
    )
  );
