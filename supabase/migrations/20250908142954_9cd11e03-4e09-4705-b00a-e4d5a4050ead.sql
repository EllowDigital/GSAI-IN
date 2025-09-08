-- Security Enhancement: Encrypt and protect sensitive student data (Fixed)
-- This migration adds multiple layers of security for protecting student personal information

-- 1. Create encrypted storage for Aadhar numbers using pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Add new encrypted column for Aadhar numbers
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS encrypted_aadhar_number bytea;

-- 3. Create security functions for data protection
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data_text text) 
RETURNS bytea
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT pgp_sym_encrypt(data_text, 'student-data-encryption-key-2025');
$$;

CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(encrypted_data bytea) 
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT pgp_sym_decrypt(encrypted_data, 'student-data-encryption-key-2025');
$$;

-- 4. Create data masking functions for UI display
CREATE OR REPLACE FUNCTION public.mask_aadhar(aadhar_text text) 
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN aadhar_text IS NULL OR length(aadhar_text) < 4 THEN 'XXXX-XXXX-XXXX'
    WHEN length(aadhar_text) >= 8 THEN 
      'XXXX-XXXX-' || right(aadhar_text, 4)
    ELSE 
      'XXXX-XXXX-XXXX'
  END;
$$;

CREATE OR REPLACE FUNCTION public.mask_phone(phone_text text) 
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN phone_text IS NULL OR length(phone_text) < 5 THEN 'XXXXXXXXXX'
    WHEN length(phone_text) >= 6 THEN 
      'XXXXX' || right(phone_text, 5)
    ELSE 
      'XXXXXXXXXX'
  END;
$$;

-- 5. Create audit log table for sensitive data access
CREATE TABLE IF NOT EXISTS public.sensitive_data_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_email text,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  accessed_at timestamp with time zone DEFAULT now(),
  ip_address text,
  details jsonb
);

-- Enable RLS on audit table
ALTER TABLE public.sensitive_data_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON public.sensitive_data_audit
FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email())
);

-- Only allow inserts for audit logging
CREATE POLICY "Allow audit logging" ON public.sensitive_data_audit
FOR INSERT WITH CHECK (true);

-- 6. Create audit trigger function for data modifications
CREATE OR REPLACE FUNCTION public.audit_sensitive_data_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.sensitive_data_audit (
    user_id,
    user_email,
    action,
    table_name,
    record_id,
    details
  ) VALUES (
    auth.uid(),
    auth.email(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'old_record', to_jsonb(OLD),
      'new_record', to_jsonb(NEW)
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 7. Add audit triggers to students table (only for INSERT, UPDATE, DELETE)
CREATE TRIGGER audit_students_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_data_changes();

-- 8. Create function to validate Aadhar format
CREATE OR REPLACE FUNCTION public.validate_aadhar(aadhar_text text) 
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT aadhar_text IS NOT NULL 
    AND aadhar_text ~ '^[0-9]{12}$' 
    AND length(aadhar_text) = 12;
$$;

-- 9. Create function to validate phone format
CREATE OR REPLACE FUNCTION public.validate_phone(phone_text text) 
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT phone_text IS NOT NULL 
    AND phone_text ~ '^[0-9]{10,15}$' 
    AND length(phone_text) BETWEEN 10 AND 15;
$$;

-- 10. Add validation constraints
ALTER TABLE public.students 
ADD CONSTRAINT IF NOT EXISTS valid_aadhar_format 
CHECK (validate_aadhar(aadhar_number));

ALTER TABLE public.students 
ADD CONSTRAINT IF NOT EXISTS valid_parent_contact_format 
CHECK (validate_phone(parent_contact));

-- 11. Create secure view for student data with masking
CREATE OR REPLACE VIEW public.students_masked AS 
SELECT 
  id,
  name,
  mask_aadhar(aadhar_number) as aadhar_number_masked,
  aadhar_number as aadhar_number_full, -- Only accessible by admins via RLS
  parent_name,
  mask_phone(parent_contact) as parent_contact_masked,
  parent_contact as parent_contact_full, -- Only accessible by admins via RLS
  profile_image_url,
  created_by,
  default_monthly_fee,
  join_date,
  created_at,
  program,
  fee_status,
  encrypted_aadhar_number
FROM public.students;

-- 12. Create RLS policies for the masked view
ALTER VIEW public.students_masked SET (security_invoker = on);

-- 13. Create function for data access logging
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(
  p_table_name text,
  p_record_id uuid,
  p_action text DEFAULT 'SELECT'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.sensitive_data_audit (
    user_id,
    user_email,
    action,
    table_name,
    record_id,
    details
  ) VALUES (
    auth.uid(),
    auth.email(),
    p_action,
    p_table_name,
    p_record_id,
    jsonb_build_object('access_time', now())
  );
END;
$$;

-- 14. Enhanced RLS policy for students with better security
DROP POLICY IF EXISTS "Admins can do everything on students" ON public.students;

CREATE POLICY "Enhanced admin access to students" ON public.students
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.email()
  )
);

-- 15. Create policy for fees table (addressing the other security issue)
CREATE POLICY "Enhanced admin access to fees" ON public.fees
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.email()
  )
);

-- Add audit trigger to fees table as well
CREATE TRIGGER audit_fees_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.fees
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_data_changes();