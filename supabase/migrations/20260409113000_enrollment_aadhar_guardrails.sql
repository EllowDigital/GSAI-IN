-- Enforce Aadhaar duplicate rules for enrollment requests at the database layer.
-- Rules:
-- 1) approved/pending/contacted: block duplicate submission
-- 2) rejected: allow re-submission

CREATE OR REPLACE FUNCTION public.enforce_enrollment_aadhar_guardrails()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.aadhar_number IS NULL OR btrim(NEW.aadhar_number) = '' THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.enrollment_requests
    WHERE aadhar_number = NEW.aadhar_number
      AND lower(status) = 'approved'
  ) THEN
    RAISE EXCEPTION 'You are already registered. Please use the student portal to log in.'
      USING ERRCODE = 'P0001';
  ELSIF EXISTS (
    SELECT 1
    FROM public.enrollment_requests
    WHERE aadhar_number = NEW.aadhar_number
      AND lower(status) = 'contacted'
  ) THEN
    RAISE EXCEPTION 'Your request has already been processed and contacted. Please check your status or wait for further updates.'
      USING ERRCODE = 'P0001';
  ELSIF EXISTS (
    SELECT 1
    FROM public.enrollment_requests
    WHERE aadhar_number = NEW.aadhar_number
      AND lower(status) = 'pending'
  ) OR EXISTS (
    SELECT 1
    FROM public.enrollment_requests
    WHERE aadhar_number = NEW.aadhar_number
      AND lower(status) NOT IN ('approved', 'rejected', 'pending', 'contacted')
  ) THEN
    RAISE EXCEPTION 'Your enrollment request is already under review. Please wait for approval.'
      USING ERRCODE = 'P0001';
  END IF;

  -- rejected/not_found are allowed.
  RETURN NEW;
END;
$$;
DROP FUNCTION IF EXISTS public.get_enrollment_aadhar_state(text);
DROP TRIGGER IF EXISTS trg_enrollment_aadhar_guardrails ON public.enrollment_requests;
CREATE TRIGGER trg_enrollment_aadhar_guardrails
BEFORE INSERT ON public.enrollment_requests
FOR EACH ROW
EXECUTE FUNCTION public.enforce_enrollment_aadhar_guardrails();
-- Strong uniqueness guarantee for active (non-rejected) requests.
DO $$
BEGIN
  IF EXISTS (
    SELECT aadhar_number
    FROM public.enrollment_requests
    WHERE aadhar_number IS NOT NULL
      AND btrim(aadhar_number) <> ''
      AND lower(status) IN ('pending', 'contacted', 'approved')
    GROUP BY aadhar_number
    HAVING COUNT(*) > 1
  ) THEN
    RAISE NOTICE 'Skipped creating idx_enrollment_unique_aadhar_active because existing duplicates were found.';
  ELSE
    CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollment_unique_aadhar_active
      ON public.enrollment_requests (aadhar_number)
      WHERE aadhar_number IS NOT NULL
        AND btrim(aadhar_number) <> ''
        AND lower(status) IN ('pending', 'contacted', 'approved');
  END IF;
END
$$;
