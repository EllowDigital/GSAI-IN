-- Consolidated Supabase schema for GSAI-IN
-- Run this script inside the Supabase SQL editor to align the database
-- with the latest application expectations. The statements are written to
-- be idempotent where possible so they can be applied on an existing
-- project without wiping data (including previously uploaded media).

BEGIN;

-- Core extensions & shared enums -------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'instructor', 'staff', 'student');
  END IF;
END$$;

-- Tables -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content text NOT NULL,
  image_url text,
  published_at timestamptz DEFAULT now(),
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  short_description text,
  date date NOT NULL,
  status text DEFAULT 'draft',
  image_url text,
  created_by text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  tag text,
  caption text,
  created_by text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  program text NOT NULL,
  join_date date NOT NULL,
  fee_status text DEFAULT 'unpaid',
  profile_image_url text,
  created_by text,
  created_at timestamptz DEFAULT now(),
  default_monthly_fee integer DEFAULT 2000,
  aadhar_number text,
  parent_name text,
  parent_contact text,
  encrypted_aadhar_number bytea
);

ALTER TABLE public.students
  ALTER COLUMN default_monthly_fee SET DEFAULT 2000;

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS default_monthly_fee integer DEFAULT 2000,
  ADD COLUMN IF NOT EXISTS aadhar_number text,
  ADD COLUMN IF NOT EXISTS parent_name text,
  ADD COLUMN IF NOT EXISTS parent_contact text,
  ADD COLUMN IF NOT EXISTS encrypted_aadhar_number bytea;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'students_aadhar_number_key'
      AND conrelid = 'public.students'::regclass
  ) THEN
    ALTER TABLE public.students
      ADD CONSTRAINT students_aadhar_number_key UNIQUE (aadhar_number);
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date date NOT NULL,
  image_url text,
  from_date date,
  end_date date,
  tag text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  year integer NOT NULL,
  monthly_fee integer NOT NULL,
  paid_amount integer NOT NULL DEFAULT 0,
  balance_due integer NOT NULL DEFAULT 0,
  notes text,
  receipt_url text,
  status text DEFAULT 'unpaid',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.fees
  ADD COLUMN IF NOT EXISTS receipt_url text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'unpaid';

CREATE UNIQUE INDEX IF NOT EXISTS fees_student_month_year_idx
  ON public.fees(student_id, month, year);

CREATE TABLE IF NOT EXISTS public.belt_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  color text NOT NULL,
  rank int NOT NULL,
  requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  min_age int,
  min_sessions int,
  next_level_id uuid REFERENCES public.belt_levels(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS belt_levels_rank_key
  ON public.belt_levels(rank);

CREATE TABLE IF NOT EXISTS public.student_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  belt_level_id uuid NOT NULL REFERENCES public.belt_levels(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('needs_work','ready','passed','deferred')) DEFAULT 'needs_work',
  assessment_date date,
  coach_notes text,
  evidence_media_urls text[] NOT NULL DEFAULT '{}',
  assessed_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_progress_student_belt_key UNIQUE (student_id, belt_level_id)
);

CREATE TABLE IF NOT EXISTS public.sensitive_data_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_email text,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  accessed_at timestamptz DEFAULT now(),
  ip_address text,
  details jsonb
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation text NOT NULL,
  record_id uuid,
  user_email text,
  user_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid DEFAULT auth.uid()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_roles_user_role_key
  ON public.user_roles(user_id, role);

-- Helper functions ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_progress_status_unchanged(row_id uuid, new_status text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_status text;
BEGIN
  SELECT status INTO current_status FROM public.student_progress WHERE id = row_id;
  RETURN current_status IS NULL OR current_status = new_status;
END;
$$;

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

CREATE OR REPLACE FUNCTION public.mask_aadhar(aadhar_number text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF aadhar_number IS NULL OR length(aadhar_number) < 4 THEN
    RETURN '****-****-****';
  END IF;
  RETURN '****-****-' || right(aadhar_number, 4);
END;
$$;

CREATE OR REPLACE FUNCTION public.mask_phone(phone_number text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF phone_number IS NULL OR length(phone_number) < 4 THEN
    RETURN '******-****';
  END IF;
  RETURN '******-' || right(phone_number, 4);
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_aadhar(aadhar_text text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT aadhar_text IS NOT NULL
         AND aadhar_text ~ '^[0-9]{12}$'
         AND length(aadhar_text) = 12;
$$;

CREATE OR REPLACE FUNCTION public.validate_phone(phone_text text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT phone_text IS NOT NULL
         AND phone_text ~ '^[0-9]{10,15}$'
         AND length(phone_text) BETWEEN 10 AND 15;
$$;

CREATE OR REPLACE FUNCTION public.validate_student_data()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.aadhar_number IS NULL OR NEW.aadhar_number !~ '^\d{12}$' THEN
    RAISE EXCEPTION 'Invalid Aadhar number format. Must be exactly 12 digits.';
  END IF;

  IF NEW.parent_contact IS NULL OR NEW.parent_contact !~ '^[6-9]\d{9}$' THEN
    RAISE EXCEPTION 'Invalid parent contact format. Must be 10 digits starting with 6-9.';
  END IF;

  NEW.name = trim(regexp_replace(coalesce(NEW.name,''), '[<>''"&]', '', 'g'));
  NEW.parent_name = trim(regexp_replace(coalesce(NEW.parent_name,''), '[<>''"&]', '', 'g'));
  NEW.program = trim(regexp_replace(coalesce(NEW.program,''), '[<>''"&]', '', 'g'));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_fee_data()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.monthly_fee < 0 OR NEW.paid_amount < 0 THEN
    RAISE EXCEPTION 'Fee amounts cannot be negative.';
  END IF;

  IF NEW.month NOT BETWEEN 1 AND 12 THEN
    RAISE EXCEPTION 'Month must be between 1 and 12.';
  END IF;

  IF NEW.year < 2020 OR NEW.year > 2035 THEN
    RAISE EXCEPTION 'Year must be between 2020 and 2035.';
  END IF;

  IF NEW.notes IS NOT NULL THEN
    NEW.notes = trim(regexp_replace(NEW.notes, '[<>''"&]', '', 'g'));
  END IF;

  NEW.balance_due = NEW.monthly_fee - NEW.paid_amount;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_sensitive_data_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.log_sensitive_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
      CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(
  p_table_name text,
  p_record_id uuid,
  p_action text DEFAULT 'SELECT'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.has_role(required_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = required_role::public.app_role
  );
END;
$$;

-- Views --------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.students_masked AS
SELECT
  id,
  name,
  mask_aadhar(aadhar_number) AS aadhar_number_masked,
  aadhar_number AS aadhar_number_full,
  parent_name,
  mask_phone(parent_contact) AS parent_contact_masked,
  parent_contact AS parent_contact_full,
  profile_image_url,
  created_by,
  default_monthly_fee,
  join_date,
  created_at,
  program,
  fee_status,
  encrypted_aadhar_number
FROM public.students;

ALTER VIEW public.students_masked SET (security_invoker = on);

-- Triggers -----------------------------------------------------------------------
ALTER TABLE public.belt_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensitive_data_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS belt_levels_touch ON public.belt_levels;
CREATE TRIGGER belt_levels_touch
BEFORE UPDATE ON public.belt_levels
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS student_progress_touch ON public.student_progress;
CREATE TRIGGER student_progress_touch
BEFORE UPDATE ON public.student_progress
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS audit_students_changes ON public.students;
CREATE TRIGGER audit_students_changes
AFTER INSERT OR UPDATE OR DELETE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_data_changes();

DROP TRIGGER IF EXISTS audit_fees_changes ON public.fees;
CREATE TRIGGER audit_fees_changes
AFTER INSERT OR UPDATE OR DELETE ON public.fees
FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_data_changes();

DROP TRIGGER IF EXISTS audit_students_trigger ON public.students;
CREATE TRIGGER audit_students_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

DROP TRIGGER IF EXISTS audit_fees_trigger ON public.fees;
CREATE TRIGGER audit_fees_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.fees
FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

DROP TRIGGER IF EXISTS validate_student_data_trigger ON public.students;
CREATE TRIGGER validate_student_data_trigger
BEFORE INSERT OR UPDATE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.validate_student_data();

DROP TRIGGER IF EXISTS validate_fee_data_trigger ON public.fees;
CREATE TRIGGER validate_fee_data_trigger
BEFORE INSERT OR UPDATE ON public.fees
FOR EACH ROW EXECUTE FUNCTION public.validate_fee_data();

-- Table constraints depending on helper functions --------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_aadhar_format'
      AND conrelid = 'public.students'::regclass
  ) THEN
    ALTER TABLE public.students
      ADD CONSTRAINT valid_aadhar_format CHECK (validate_aadhar(aadhar_number));
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_parent_contact_format'
      AND conrelid = 'public.students'::regclass
  ) THEN
    ALTER TABLE public.students
      ADD CONSTRAINT valid_parent_contact_format CHECK (validate_phone(parent_contact));
  END IF;
END;
$$;

-- Row Level Security policies -----------------------------------------------------
DROP POLICY IF EXISTS "Admin can read own admin record" ON public.admin_users;
CREATE POLICY "Admin can read own admin record"
  ON public.admin_users
  FOR SELECT
  USING (email = auth.email());

DROP POLICY IF EXISTS "Admin roles manage blogs" ON public.blogs;
CREATE POLICY "Admin roles manage blogs"
  ON public.blogs
  FOR ALL
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));

DROP POLICY IF EXISTS "Public can read blogs" ON public.blogs;
CREATE POLICY "Public can read blogs"
  ON public.blogs
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin roles manage news" ON public.news;
CREATE POLICY "Admin roles manage news"
  ON public.news
  FOR ALL
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));

DROP POLICY IF EXISTS "Public can read news" ON public.news;
CREATE POLICY "Public can read news"
  ON public.news
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin roles manage gallery" ON public.gallery_images;
CREATE POLICY "Admin roles manage gallery"
  ON public.gallery_images
  FOR ALL
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));

DROP POLICY IF EXISTS "Public can read gallery images" ON public.gallery_images;
CREATE POLICY "Public can read gallery images"
  ON public.gallery_images
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin roles manage events" ON public.events;
CREATE POLICY "Admin roles manage events"
  ON public.events
  FOR ALL
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));

DROP POLICY IF EXISTS "Public can read events" ON public.events;
CREATE POLICY "Public can read events"
  ON public.events
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin roles manage students" ON public.students;
CREATE POLICY "Admin roles manage students"
  ON public.students
  FOR ALL
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));

DROP POLICY IF EXISTS "Admin roles select fees" ON public.fees;
DROP POLICY IF EXISTS "Admin roles insert fees" ON public.fees;
DROP POLICY IF EXISTS "Admin roles update fees" ON public.fees;
DROP POLICY IF EXISTS "Admin roles delete fees" ON public.fees;
CREATE POLICY "Admin roles select fees"
  ON public.fees
  FOR SELECT
  USING (has_role('admin'));
CREATE POLICY "Admin roles insert fees"
  ON public.fees
  FOR INSERT
  WITH CHECK (has_role('admin'));
CREATE POLICY "Admin roles update fees"
  ON public.fees
  FOR UPDATE
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));
CREATE POLICY "Admin roles delete fees"
  ON public.fees
  FOR DELETE
  USING (has_role('admin'));

DROP POLICY IF EXISTS "Admin roles select belts" ON public.belt_levels;
DROP POLICY IF EXISTS "Admin roles insert belts" ON public.belt_levels;
DROP POLICY IF EXISTS "Admin roles update belts" ON public.belt_levels;
DROP POLICY IF EXISTS "Admin roles delete belts" ON public.belt_levels;
CREATE POLICY "Admin roles select belts"
  ON public.belt_levels
  FOR SELECT
  USING (has_role('admin'));
CREATE POLICY "Admin roles insert belts"
  ON public.belt_levels
  FOR INSERT
  WITH CHECK (has_role('admin'));
CREATE POLICY "Admin roles update belts"
  ON public.belt_levels
  FOR UPDATE
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));
CREATE POLICY "Admin roles delete belts"
  ON public.belt_levels
  FOR DELETE
  USING (has_role('admin'));

DROP POLICY IF EXISTS "Admin roles read student progress" ON public.student_progress;
DROP POLICY IF EXISTS "Admin roles insert student progress" ON public.student_progress;
DROP POLICY IF EXISTS "Admin roles update student progress" ON public.student_progress;
DROP POLICY IF EXISTS "Instructor evidence uploads" ON public.student_progress;
CREATE POLICY "Admin roles read student progress"
  ON public.student_progress
  FOR SELECT
  USING (has_role('admin'));
CREATE POLICY "Admin roles insert student progress"
  ON public.student_progress
  FOR INSERT
  WITH CHECK (has_role('admin'));
CREATE POLICY "Admin roles update student progress"
  ON public.student_progress
  FOR UPDATE
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));
CREATE POLICY "Instructor evidence uploads"
  ON public.student_progress
  FOR UPDATE
  USING (has_role('instructor'))
  WITH CHECK (has_role('instructor') AND public.is_progress_status_unchanged(id, status));

DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage user roles" ON public.user_roles;
CREATE POLICY "Admins manage user roles"
  ON public.user_roles
  FOR ALL
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));

DROP POLICY IF EXISTS "Admin roles view sensitive logs" ON public.sensitive_data_audit;
CREATE POLICY "Admin roles view sensitive logs"
  ON public.sensitive_data_audit
  FOR SELECT
  USING (has_role('admin'));

DROP POLICY IF EXISTS "Allow audit logging" ON public.sensitive_data_audit;
CREATE POLICY "Allow audit logging"
  ON public.sensitive_data_audit
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin roles view audit logs" ON public.audit_logs;
CREATE POLICY "Admin roles view audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (has_role('admin'));

-- Storage buckets & policies ------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('news-images', 'news-images', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('fees', 'fees', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Gallery uploads" ON storage.objects;
DROP POLICY IF EXISTS "Gallery updates" ON storage.objects;
DROP POLICY IF EXISTS "Gallery deletes" ON storage.objects;
DROP POLICY IF EXISTS "Gallery downloads" ON storage.objects;
CREATE POLICY "Gallery uploads"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'gallery');
CREATE POLICY "Gallery updates"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'gallery');
CREATE POLICY "Gallery deletes"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'gallery');
CREATE POLICY "Gallery downloads"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'gallery');

-- Event bucket policies
DROP POLICY IF EXISTS "Events uploads" ON storage.objects;
DROP POLICY IF EXISTS "Events updates" ON storage.objects;
DROP POLICY IF EXISTS "Events deletes" ON storage.objects;
DROP POLICY IF EXISTS "Events downloads" ON storage.objects;
CREATE POLICY "Events uploads"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'events');
CREATE POLICY "Events updates"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'events');
CREATE POLICY "Events deletes"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'events');
CREATE POLICY "Events downloads"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'events');

-- Fees bucket policies
DROP POLICY IF EXISTS "Fees uploads" ON storage.objects;
DROP POLICY IF EXISTS "Fees updates" ON storage.objects;
DROP POLICY IF EXISTS "Fees deletes" ON storage.objects;
DROP POLICY IF EXISTS "Fees downloads" ON storage.objects;
CREATE POLICY "Fees uploads"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'fees');
CREATE POLICY "Fees updates"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'fees');
CREATE POLICY "Fees deletes"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'fees');
CREATE POLICY "Fees downloads"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'fees');

-- Seed data ----------------------------------------------------------------------
INSERT INTO public.admin_users (email)
VALUES ('ghatakgsai@gmail.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.belt_levels (color, rank, requirements, min_age, min_sessions)
VALUES
  ('White', 1, '[{"focus":"Basics","techniques":["Stance","Guard"]}]', 5, 0),
  ('Yellow', 2, '[{"focus":"Kicks","techniques":["Front Kick","Side Kick"]}]', 7, 12),
  ('Orange', 3, '[{"focus":"Combinations","techniques":["1-2-3","Parry & Counter"]}]', 8, 24),
  ('Green', 4, '[{"focus":"Defense","techniques":["Blocks","Footwork"]}]', 9, 40),
  ('Blue', 5, '[{"focus":"Sparring","techniques":["Light Spar","Ring Craft"]}]', 10, 60),
  ('Brown', 6, '[{"focus":"Advanced","techniques":["Feints","Counters"]}]', 12, 90),
  ('Black', 7, '[{"focus":"Mastery","techniques":["Full Spar","Teaching"]}]', 14, 120)
ON CONFLICT (rank) DO NOTHING;

WITH ordered AS (
  SELECT current.id, next.id AS next_id
  FROM public.belt_levels current
  LEFT JOIN public.belt_levels next ON next.rank = current.rank + 1
)
UPDATE public.belt_levels b
SET next_level_id = ordered.next_id
FROM ordered
WHERE ordered.id = b.id
  AND (b.next_level_id IS DISTINCT FROM ordered.next_id);

INSERT INTO public.user_roles (user_id, role)
SELECT auth_users.id, 'admin'::public.app_role
FROM auth.users AS auth_users
JOIN public.admin_users legacy ON lower(legacy.email) = lower(auth_users.email)
ON CONFLICT (user_id, role) DO NOTHING;

COMMIT;
