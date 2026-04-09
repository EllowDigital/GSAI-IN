-- Idempotent enrollment action emails + helper tools for legacy Aadhaar duplicate cleanup.

ALTER TABLE public.enrollment_requests
  ADD COLUMN IF NOT EXISTS contacted_email_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS approved_email_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS rejected_email_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contacted_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_email_sent_at timestamptz;
CREATE TABLE IF NOT EXISTS public.enrollment_email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_request_id uuid NOT NULL REFERENCES public.enrollment_requests(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('contacted', 'approved', 'rejected')),
  idempotency_key text NOT NULL,
  status text NOT NULL CHECK (status IN ('processing', 'sent', 'failed')) DEFAULT 'processing',
  recipient_email text NOT NULL,
  subject text NOT NULL,
  provider_message_id text,
  error_message text,
  triggered_by uuid DEFAULT auth.uid(),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollment_email_events_idempotency_key
  ON public.enrollment_email_events (idempotency_key);
-- Ensure only one active sender per request/action and at most one successful send.
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollment_email_events_active_action
  ON public.enrollment_email_events (enrollment_request_id, action)
  WHERE status IN ('processing', 'sent');
CREATE INDEX IF NOT EXISTS idx_enrollment_email_events_request_action
  ON public.enrollment_email_events (enrollment_request_id, action, created_at DESC);
ALTER TABLE public.enrollment_email_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_manage_enrollment_email_events" ON public.enrollment_email_events;
DROP POLICY IF EXISTS "admin_users_manage_enrollment_email_events" ON public.enrollment_email_events;
CREATE POLICY "admin_manage_enrollment_email_events"
ON public.enrollment_email_events
FOR ALL
TO authenticated
USING (has_role('admin'::text))
WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_enrollment_email_events"
ON public.enrollment_email_events
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.admin_users WHERE admin_users.email = auth.email()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users WHERE admin_users.email = auth.email()
));
CREATE OR REPLACE FUNCTION public.sync_enrollment_email_sent_flags()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();

  IF NEW.status = 'sent' THEN
    UPDATE public.enrollment_requests
    SET
      contacted_email_sent = CASE WHEN NEW.action = 'contacted' THEN true ELSE contacted_email_sent END,
      contacted_email_sent_at = CASE WHEN NEW.action = 'contacted' THEN COALESCE(NEW.sent_at, now()) ELSE contacted_email_sent_at END,
      approved_email_sent = CASE WHEN NEW.action = 'approved' THEN true ELSE approved_email_sent END,
      approved_email_sent_at = CASE WHEN NEW.action = 'approved' THEN COALESCE(NEW.sent_at, now()) ELSE approved_email_sent_at END,
      rejected_email_sent = CASE WHEN NEW.action = 'rejected' THEN true ELSE rejected_email_sent END,
      rejected_email_sent_at = CASE WHEN NEW.action = 'rejected' THEN COALESCE(NEW.sent_at, now()) ELSE rejected_email_sent_at END
    WHERE id = NEW.enrollment_request_id;
  END IF;

  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_sync_enrollment_email_sent_flags ON public.enrollment_email_events;
CREATE TRIGGER trg_sync_enrollment_email_sent_flags
BEFORE INSERT OR UPDATE ON public.enrollment_email_events
FOR EACH ROW
EXECUTE FUNCTION public.sync_enrollment_email_sent_flags();
-- Detect active-status Aadhaar duplicates.
CREATE OR REPLACE VIEW public.vw_duplicate_active_enrollment_aadhar AS
SELECT
  aadhar_number,
  COUNT(*) AS active_count,
  ARRAY_AGG(id ORDER BY created_at ASC) AS request_ids,
  ARRAY_AGG(status ORDER BY created_at ASC) AS statuses,
  MIN(created_at) AS first_created_at,
  MAX(created_at) AS last_created_at
FROM public.enrollment_requests
WHERE aadhar_number IS NOT NULL
  AND btrim(aadhar_number) <> ''
  AND lower(status) IN ('pending', 'contacted', 'approved')
GROUP BY aadhar_number
HAVING COUNT(*) > 1;
CREATE OR REPLACE FUNCTION public.clean_duplicate_active_enrollment_aadhar(
  p_aadhar_number text,
  p_keep_request_id uuid,
  p_admin_note text DEFAULT 'Auto-cleaned duplicate active Aadhaar enrollment request'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  IF NOT (
    has_role('admin'::text)
    OR EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.email = auth.email())
  ) THEN
    RAISE EXCEPTION 'Only admin users can clean duplicate enrollment requests.' USING ERRCODE = '42501';
  END IF;

  UPDATE public.enrollment_requests
  SET
    status = 'rejected',
    admin_notes = COALESCE(NULLIF(admin_notes, ''), p_admin_note),
    reviewed_at = COALESCE(reviewed_at, now())
  WHERE aadhar_number = p_aadhar_number
    AND id <> p_keep_request_id
    AND lower(status) IN ('pending', 'contacted', 'approved');

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;
REVOKE ALL ON public.vw_duplicate_active_enrollment_aadhar FROM anon, authenticated;
GRANT SELECT ON public.vw_duplicate_active_enrollment_aadhar TO service_role;
GRANT EXECUTE ON FUNCTION public.clean_duplicate_active_enrollment_aadhar(text, uuid, text) TO authenticated;
