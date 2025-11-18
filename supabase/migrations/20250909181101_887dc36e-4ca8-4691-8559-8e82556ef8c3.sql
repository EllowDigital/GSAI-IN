-- Fix security warnings by setting proper search_path for functions

-- Update log_sensitive_access function with proper search_path
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update mask_aadhar function with proper search_path
CREATE OR REPLACE FUNCTION public.mask_aadhar(aadhar_number TEXT)
RETURNS TEXT AS $$
BEGIN
  IF aadhar_number IS NULL OR LENGTH(aadhar_number) < 4 THEN
    RETURN '****-****-****';
  END IF;
  
  RETURN '****-****-' || RIGHT(aadhar_number, 4);
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Update mask_phone function with proper search_path
CREATE OR REPLACE FUNCTION public.mask_phone(phone_number TEXT)
RETURNS TEXT AS $$
BEGIN
  IF phone_number IS NULL OR LENGTH(phone_number) < 4 THEN
    RETURN '******-****';
  END IF;
  
  RETURN '******-' || RIGHT(phone_number, 4);
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Update validate_student_data function with proper search_path
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
$$ LANGUAGE plpgsql SET search_path = public;

-- Update validate_fee_data function with proper search_path
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
$$ LANGUAGE plpgsql SET search_path = public;