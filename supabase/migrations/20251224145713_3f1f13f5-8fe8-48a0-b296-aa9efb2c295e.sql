-- Fix validate_aadhar with search_path
CREATE OR REPLACE FUNCTION public.validate_aadhar(aadhar_text text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT aadhar_text IS NOT NULL
         AND aadhar_text ~ '^[0-9]{12}$'
         AND length(aadhar_text) = 12;
$$;

-- Fix validate_phone with search_path
CREATE OR REPLACE FUNCTION public.validate_phone(phone_text text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT phone_text IS NOT NULL
         AND phone_text ~ '^[0-9]{10,15}$'
         AND length(phone_text) BETWEEN 10 AND 15;
$$;