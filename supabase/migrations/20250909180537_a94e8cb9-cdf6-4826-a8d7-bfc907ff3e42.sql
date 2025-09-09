-- Security Enhancement Migration
-- Phase 1: Critical security improvements

-- Create audit log table for tracking sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE, SELECT
  record_id UUID,
  user_email TEXT,
  user_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email())
  );

-- Create function to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to students and fees tables
  IF TG_TABLE_NAME IN ('students', 'fees') THEN
    INSERT INTO public.audit_logs (
      table_name,
      operation,
      record_id,
      user_email,
      user_id,
      old_values,
      new_values
    ) VALUES (
      TG_TABLE_NAME,
      TG_OP,
      COALESCE(NEW.id, OLD.id),
      auth.email(),
      auth.uid(),
      CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_students_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

CREATE TRIGGER audit_fees_trigger  
  AFTER INSERT OR UPDATE OR DELETE ON public.fees
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

-- Create function to mask sensitive data for display
CREATE OR REPLACE FUNCTION public.mask_aadhar(aadhar_number TEXT)
RETURNS TEXT AS $$
BEGIN
  IF aadhar_number IS NULL OR LENGTH(aadhar_number) < 4 THEN
    RETURN '****-****-****';
  END IF;
  
  RETURN '****-****-' || RIGHT(aadhar_number, 4);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to mask phone numbers
CREATE OR REPLACE FUNCTION public.mask_phone(phone_number TEXT)
RETURNS TEXT AS $$
BEGIN
  IF phone_number IS NULL OR LENGTH(phone_number) < 4 THEN
    RETURN '******-****';
  END IF;
  
  RETURN '******-' || RIGHT(phone_number, 4);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Enhanced RLS policies with better security
-- Drop any conflicting policies first
DROP POLICY IF EXISTS "Admin users can view all fees" ON public.fees;
DROP POLICY IF EXISTS "Admin users can insert fees" ON public.fees;
DROP POLICY IF EXISTS "Admin users can update fees" ON public.fees;
DROP POLICY IF EXISTS "Admin users can delete fees" ON public.fees;

-- Create comprehensive admin fee policies
CREATE POLICY "Verified admins can view all fees" ON public.fees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    ) AND auth.email() IS NOT NULL
  );

CREATE POLICY "Verified admins can insert fees" ON public.fees
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    ) AND auth.email() IS NOT NULL
  );

CREATE POLICY "Verified admins can update fees" ON public.fees
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    ) AND auth.email() IS NOT NULL
  );

CREATE POLICY "Verified admins can delete fees" ON public.fees
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    ) AND auth.email() IS NOT NULL
  );

-- Add additional validation triggers for data integrity
CREATE OR REPLACE FUNCTION public.validate_student_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate Aadhar number format
  IF NEW.aadhar_number !~ '^\d{12}$' THEN
    RAISE EXCEPTION 'Invalid Aadhar number format. Must be exactly 12 digits.';
  END IF;
  
  -- Validate phone number format
  IF NEW.parent_contact !~ '^[6-9]\d{9}$' THEN
    RAISE EXCEPTION 'Invalid phone number format. Must be 10 digits starting with 6-9.';
  END IF;
  
  -- Sanitize text inputs
  NEW.name = TRIM(REGEXP_REPLACE(NEW.name, '[<>''\"&]', '', 'g'));
  NEW.parent_name = TRIM(REGEXP_REPLACE(NEW.parent_name, '[<>''\"&]', '', 'g'));
  NEW.program = TRIM(REGEXP_REPLACE(NEW.program, '[<>''\"&]', '', 'g'));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add validation trigger to students table
DROP TRIGGER IF EXISTS validate_student_data_trigger ON public.students;
CREATE TRIGGER validate_student_data_trigger
  BEFORE INSERT OR UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.validate_student_data();

-- Create function to validate fee data
CREATE OR REPLACE FUNCTION public.validate_fee_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure non-negative amounts
  IF NEW.monthly_fee < 0 OR NEW.paid_amount < 0 THEN
    RAISE EXCEPTION 'Fee amounts cannot be negative.';
  END IF;
  
  -- Validate month and year ranges
  IF NEW.month < 1 OR NEW.month > 12 THEN
    RAISE EXCEPTION 'Month must be between 1 and 12.';
  END IF;
  
  IF NEW.year < 2020 OR NEW.year > 2030 THEN
    RAISE EXCEPTION 'Year must be between 2020 and 2030.';
  END IF;
  
  -- Calculate balance due
  NEW.balance_due = NEW.monthly_fee - NEW.paid_amount;
  
  -- Sanitize notes if present
  IF NEW.notes IS NOT NULL THEN
    NEW.notes = TRIM(REGEXP_REPLACE(NEW.notes, '[<>''\"&]', '', 'g'));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add validation trigger to fees table
DROP TRIGGER IF EXISTS validate_fee_data_trigger ON public.fees;
CREATE TRIGGER validate_fee_data_trigger
  BEFORE INSERT OR UPDATE ON public.fees
  FOR EACH ROW EXECUTE FUNCTION public.validate_fee_data();