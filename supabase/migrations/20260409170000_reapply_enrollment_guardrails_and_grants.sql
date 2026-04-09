-- Re-apply enrollment guardrail security and duplicate-cleanup grants safely.
-- This migration is forward-only and idempotent for environments where prior
-- migrations may already be marked as executed.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'enforce_enrollment_aadhar_guardrails'
      AND pg_get_function_identity_arguments(p.oid) = ''
  ) THEN
    EXECUTE 'ALTER FUNCTION public.enforce_enrollment_aadhar_guardrails() SECURITY DEFINER';
    EXECUTE 'ALTER FUNCTION public.enforce_enrollment_aadhar_guardrails() SET search_path = public';
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'vw_duplicate_active_enrollment_aadhar'
      AND c.relkind IN ('v', 'm')
  ) THEN
    EXECUTE 'REVOKE ALL ON public.vw_duplicate_active_enrollment_aadhar FROM anon';
    EXECUTE 'GRANT SELECT ON public.vw_duplicate_active_enrollment_aadhar TO authenticated';
    EXECUTE 'GRANT SELECT ON public.vw_duplicate_active_enrollment_aadhar TO service_role';
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'clean_duplicate_active_enrollment_aadhar'
      AND pg_get_function_identity_arguments(p.oid) = 'p_aadhar_number text, p_keep_request_id uuid, p_admin_note text'
  ) THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.clean_duplicate_active_enrollment_aadhar(text, uuid, text) TO authenticated';
  END IF;
END
$$;
