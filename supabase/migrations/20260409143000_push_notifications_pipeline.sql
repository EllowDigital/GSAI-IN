-- Push notifications pipeline (Supabase free-tier friendly): subscriptions + delivery logs.

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  portal_scope text NOT NULL CHECK (portal_scope IN ('admin', 'student')),
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  expiration_time bigint,
  user_agent text,
  is_active boolean NOT NULL DEFAULT true,
  fail_count integer NOT NULL DEFAULT 0,
  disabled_at timestamptz,
  disable_reason text,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint_unique
  ON public.push_subscriptions (endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_active
  ON public.push_subscriptions (auth_user_id, is_active, portal_scope);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_scope_active
  ON public.push_subscriptions (portal_scope, is_active, last_seen_at DESC);
CREATE TABLE IF NOT EXISTS public.push_notification_delivery_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_scope text CHECK (portal_scope IN ('admin', 'student')),
  triggered_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  total_targets integer NOT NULL DEFAULT 0,
  sent_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  title text NOT NULL,
  body text NOT NULL,
  target_url text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_push_delivery_logs_created_at
  ON public.push_notification_delivery_logs (created_at DESC);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notification_delivery_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "push_subscriptions_owner_select" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_subscriptions_owner_insert" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_subscriptions_owner_update" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_subscriptions_owner_delete" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_subscriptions_admin_manage" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_owner_select"
ON public.push_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = auth_user_id);
CREATE POLICY "push_subscriptions_owner_insert"
ON public.push_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = auth_user_id);
CREATE POLICY "push_subscriptions_owner_update"
ON public.push_subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);
CREATE POLICY "push_subscriptions_owner_delete"
ON public.push_subscriptions
FOR DELETE
TO authenticated
USING (auth.uid() = auth_user_id);
CREATE POLICY "push_subscriptions_admin_manage"
ON public.push_subscriptions
FOR ALL
TO authenticated
USING (has_role('admin'::text))
WITH CHECK (has_role('admin'::text));
DROP POLICY IF EXISTS "push_delivery_logs_owner_read" ON public.push_notification_delivery_logs;
DROP POLICY IF EXISTS "push_delivery_logs_admin_manage" ON public.push_notification_delivery_logs;
CREATE POLICY "push_delivery_logs_owner_read"
ON public.push_notification_delivery_logs
FOR SELECT
TO authenticated
USING (
  auth.uid() = triggered_by
  OR auth.uid() = target_user_id
);
CREATE POLICY "push_delivery_logs_admin_manage"
ON public.push_notification_delivery_logs
FOR ALL
TO authenticated
USING (has_role('admin'::text))
WITH CHECK (has_role('admin'::text));
CREATE OR REPLACE FUNCTION public.trg_push_subscriptions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_push_subscriptions_updated_at ON public.push_subscriptions;
CREATE TRIGGER trg_push_subscriptions_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.trg_push_subscriptions_updated_at();
CREATE OR REPLACE FUNCTION public.clean_stale_push_subscriptions(
  p_inactive_days integer DEFAULT 60,
  p_max_fail_count integer DEFAULT 3
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows integer;
BEGIN
  IF NOT (
    has_role('admin'::text)
    OR EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.email = auth.email())
  ) THEN
    RAISE EXCEPTION 'Only admin users can clean push subscriptions.' USING ERRCODE = '42501';
  END IF;

  UPDATE public.push_subscriptions
  SET
    is_active = false,
    disabled_at = COALESCE(disabled_at, now()),
    disable_reason = COALESCE(disable_reason, 'stale_or_failed')
  WHERE is_active = true
    AND (
      fail_count >= GREATEST(p_max_fail_count, 1)
      OR last_seen_at < now() - make_interval(days => GREATEST(p_inactive_days, 7))
    );

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows;
END;
$$;
CREATE OR REPLACE FUNCTION public.increment_push_failures(
  p_subscription_ids uuid[]
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated integer;
BEGIN
  IF p_subscription_ids IS NULL OR array_length(p_subscription_ids, 1) IS NULL THEN
    RETURN 0;
  END IF;

  UPDATE public.push_subscriptions
  SET
    fail_count = fail_count + 1,
    is_active = CASE WHEN fail_count + 1 >= 3 THEN false ELSE is_active END,
    disable_reason = CASE WHEN fail_count + 1 >= 3 THEN 'delivery_failed' ELSE disable_reason END,
    disabled_at = CASE WHEN fail_count + 1 >= 3 THEN COALESCE(disabled_at, now()) ELSE disabled_at END
  WHERE id = ANY (p_subscription_ids)
    AND is_active = true;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;
GRANT EXECUTE ON FUNCTION public.clean_stale_push_subscriptions(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_push_failures(uuid[]) TO service_role;
