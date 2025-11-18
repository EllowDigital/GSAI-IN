-- Security Enhancement: Encrypt and protect sensitive student data
-- This migration adds multiple layers of security for protecting student personal information

-- 1. Create encrypted storage for Aadhar numbers using pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Add new encrypted column for Aadhar numbers
ALTER TABLE public.students 
ADD COLUMN encrypted_aadhar_number bytea;

-- 3. Create security functions for data protection
CREATE OR REPLACE FUNCTION public.encrypt_aadhar(aadhar_text text) 
RETURNS bytea
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT pgp_sym_encrypt(aadhar_text, current_setting('app.settings.encryption_key', true));
$$;

CREATE OR REPLACE FUNCTION public.decrypt_aadhar(encrypted_data bytea) 
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT pgp_sym_decrypt(encrypted_data, current_setting('app.settings.encryption_key', true));
$$;

-- 4. Create data masking functions for UI display
CREATE OR REPLACE FUNCTION public.mask_aadhar(aadhar_text text) 
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT CASE 
    WHEN length(aadhar_text) >= 8 THEN 
      'XXXX-XXXX-' || right(aadhar_text, 4)
    ELSE 
      'XXXX-XXXX-XXXX'
  END;
$$;

CREATE OR REPLACE FUNCTION public.mask_phone(phone_text text) 
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT CASE 
    WHEN length(phone_text) >= 6 THEN 
      'XXXXX' || right(phone_text, 5)
    ELSE 
      'XXXXXXXXXX'
  END;
$$;

-- 5. Create audit log table for sensitive data access
CREATE TABLE IF NOT EXISTS public.sensitive_data_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  student_id uuid,
  accessed_at timestamp with time zone DEFAULT now(),
  user_email text,
  ip_address inet,
  user_agent text
);

-- Enable RLS on audit table
ALTER TABLE public.sensitive_data_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON public.sensitive_data_audit
FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email())
);

-- 6. Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_sensitive_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.sensitive_data_audit (
    user_id,
    action,
    table_name,
    student_id,
    user_email
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    auth.email()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 7. Add audit triggers to students table
CREATE TRIGGER audit_students_access
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_access();

-- 8. Create secure view for student data with masking
CREATE OR REPLACE VIEW public.students_secure AS 
SELECT 
  id,
  name,
  mask_aadhar(aadhar_number) as masked_aadhar,
  parent_name,
  mask_phone(parent_contact) as masked_parent_contact,
  profile_image_url,
  created_by,
  default_monthly_fee,
  join_date,
  created_at,
  program,
  fee_status
FROM public.students;

-- Enable RLS on the secure view
ALTER VIEW public.students_secure SET (security_invoker = on);

-- 9. Create additional RLS policies with more granular controls
CREATE POLICY "Admin audit trail required" ON public.students
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.email()
  ) AND
  -- Ensure audit logging is enabled
  current_setting('app.settings.audit_enabled', true)::boolean = true
);

-- 10. Create function to validate Aadhar format
CREATE OR REPLACE FUNCTION public.validate_aadhar(aadhar_text text) 
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT aadhar_text ~ '^[0-9]{12}$' AND length(aadhar_text) = 12;
$$;

-- 11. Add check constraint for Aadhar validation
ALTER TABLE public.students 
ADD CONSTRAINT valid_aadhar_format 
CHECK (validate_aadhar(aadhar_number));

-- 12. Create function for secure data migration (to be used in application)
CREATE OR REPLACE FUNCTION public.migrate_aadhar_encryption() 
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update existing records to encrypt Aadhar numbers
  UPDATE public.students 
  SET encrypted_aadhar_number = encrypt_aadhar(aadhar_number)
  WHERE encrypted_aadhar_number IS NULL AND aadhar_number IS NOT NULL;
END;
$$;

-- 13. Set default encryption key (should be changed in production)
-- Note: In production, this should be set via environment variables
ALTER DATABASE postgres SET app.settings.encryption_key = 'your-secret-encryption-key-change-in-production';
ALTER DATABASE postgres SET app.settings.audit_enabled = 'true';