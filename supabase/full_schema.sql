-- full_schema.sql
-- Auto-generated from ordered Supabase migrations
-- Source: supabase/migrations
-- Generated: 2026-04-09T13:18:01.3439372+05:30

BEGIN;

-- =====================================================================
-- Migration: 20250614214309_96b40163-10ae-422a-8909-e2fc51c67f8d.sql
-- =====================================================================
-- 1. Admin user table for role-based access
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO public.admin_users (email) VALUES ('ghatakgsai@gmail.com')
ON CONFLICT (email) DO NOTHING;
-- 2. Blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- 3. News table
CREATE TABLE IF NOT EXISTS public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  short_description TEXT,
  date DATE NOT NULL,
  status TEXT DEFAULT 'draft',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- 4. Gallery Images
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  tag TEXT,
  caption TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- 5. Students
CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  program TEXT NOT NULL,
  join_date DATE NOT NULL,
  fee_status TEXT DEFAULT 'unpaid',
  profile_image_url TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- 6. Events (stub, for stats)
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL
);
-- RLS policies

-- Enable RLS on all admin tables
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
-- Only allow admin users to SELECT, INSERT, UPDATE, DELETE data
CREATE POLICY "Admins can do everything on blogs"
  ON blogs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.admin_users WHERE email = auth.email()
  ));
CREATE POLICY "Admins can do everything on news"
  ON news FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.admin_users WHERE email = auth.email()
  ));
CREATE POLICY "Admins can do everything on gallery_images"
  ON gallery_images FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.admin_users WHERE email = auth.email()
  ));
CREATE POLICY "Admins can do everything on students"
  ON students FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.admin_users WHERE email = auth.email()
  ));
-- Optionally, public read policies for blogs/news/gallery if you want the public site to query them

-- Allow anyone to SELECT from blogs, news, gallery_images
CREATE POLICY "Public can read blogs"
  ON blogs FOR SELECT
  USING (true);
CREATE POLICY "Public can read news"
  ON news FOR SELECT
  USING (true);
CREATE POLICY "Public can read gallery images"
  ON gallery_images FOR SELECT
  USING (true);
-- Enable RLS on admin_users (only you can select your admin record)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can read own admin record" 
  ON admin_users FOR SELECT
  USING (email = auth.email());
-- Create a storage bucket for gallery uploads
insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true)
on conflict (id) do nothing;


-- =====================================================================
-- Migration: 20250614220232_c4043b46-dad6-48ec-be42-476678e73f25.sql
-- =====================================================================
-- Create a public bucket for blog images
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;


-- =====================================================================
-- Migration: 20250614224346_f04c848a-15e4-4bb0-9e45-6084d25bae47.sql
-- =====================================================================
-- Create a public bucket for news images
insert into storage.buckets (id, name, public)
values ('news-images', 'news-images', true)
on conflict (id) do nothing;


-- =====================================================================
-- Migration: 20250614224502_b9e2d04f-f59f-47d4-8b9c-856c5312d33d.sql
-- =====================================================================
-- Add an image_url column to the public.news table for news images
ALTER TABLE public.news
ADD COLUMN IF NOT EXISTS image_url text;


-- =====================================================================
-- Migration: 20250614231020_6295603c-84bf-4245-afe2-a4ffb796b371.sql
-- =====================================================================
-- Enable Row Level Security on the gallery_images table (if not already enabled)
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
-- Anyone can insert rows into gallery_images
CREATE POLICY "Anyone can insert gallery images"
  ON public.gallery_images
  FOR INSERT
  WITH CHECK (true);
-- Anyone can update rows in gallery_images
CREATE POLICY "Anyone can update gallery images"
  ON public.gallery_images
  FOR UPDATE
  USING (true);
-- Anyone can select rows in gallery_images
CREATE POLICY "Anyone can select gallery images"
  ON public.gallery_images
  FOR SELECT
  USING (true);
-- Anyone can delete rows in gallery_images
CREATE POLICY "Anyone can delete gallery images"
  ON public.gallery_images
  FOR DELETE
  USING (true);


-- =====================================================================
-- Migration: 20250614231732_2fd80d1b-7885-4bea-9949-aba96787f2fb.sql
-- =====================================================================
-- Drop policies if they already exist
drop policy if exists "Anyone can upload files to gallery" on storage.objects;
drop policy if exists "Anyone can update files in gallery" on storage.objects;
drop policy if exists "Anyone can delete files in gallery" on storage.objects;
drop policy if exists "Anyone can download files in gallery" on storage.objects;
-- Anyone can upload (insert) into gallery bucket
create policy "Anyone can upload files to gallery"
  on storage.objects
  for insert
  with check (bucket_id = 'gallery');
-- Anyone can update (overwrite) files in gallery
create policy "Anyone can update files in gallery"
  on storage.objects
  for update
  using (bucket_id = 'gallery');
-- Anyone can delete files in gallery
create policy "Anyone can delete files in gallery"
  on storage.objects
  for delete
  using (bucket_id = 'gallery');
-- Anyone can select/download files in gallery
create policy "Anyone can download files in gallery"
  on storage.objects
  for select
  using (bucket_id = 'gallery');


-- =====================================================================
-- Migration: 20250614233131_a86f5f1e-fcf2-42fe-b20e-727ff5dbdf26.sql
-- =====================================================================
-- Add missing columns for student details
ALTER TABLE public.students
ADD COLUMN aadhar_number text NOT NULL UNIQUE,
ADD COLUMN parent_name text NOT NULL,
ADD COLUMN parent_contact text NOT NULL;
-- Optionally: If existing rows present, you may need to set default values or update them after running this.
-- If the table isn't empty, let me know!;


-- =====================================================================
-- Migration: 20250614234135_0d5f6a90-85d9-4334-9d18-e607438446a9.sql
-- =====================================================================
-- 1. Add 'default_monthly_fee' column to students
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS default_monthly_fee integer NOT NULL DEFAULT 2000;
-- 2. Create fees table 
CREATE TABLE public.fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL,
  monthly_fee integer NOT NULL,
  paid_amount integer NOT NULL DEFAULT 0,
  balance_due integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status text GENERATED ALWAYS AS (
    CASE 
      WHEN paid_amount >= monthly_fee + balance_due THEN 'paid'
      WHEN paid_amount > 0 THEN 'partial'
      ELSE 'unpaid'
    END
  ) STORED
);
-- 3. Enforce unique month/year/student combo
CREATE UNIQUE INDEX fees_student_month_year_idx ON public.fees(student_id, month, year);
-- 4. Enable RLS on fees table
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
-- 5. Read/write policy: only admins (role checked by email domain for now, adapt to your auth)
CREATE POLICY "Admin can manage fees"
  ON public.fees
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.email = current_setting('request.jwt.claim.email', true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.email = current_setting('request.jwt.claim.email', true)
    )
  );


-- =====================================================================
-- Migration: 20250615000958_c8b86477-4175-4ee4-aad4-3ccb4d91e3d9.sql
-- =====================================================================
-- Enable Row Level Security if not already enabled
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
-- Grant full access to admin users, matching users with their email
-- Assumes your app authenticates Supabase Auth users, and that
-- admin emails are listed in the admin_users table.

-- Remove any conflicting/old policies if needed
DROP POLICY IF EXISTS "Admin can manage fees" ON public.fees;
-- Allow admin users (whose email is present in admin_users) to do everything
CREATE POLICY "Admin can manage fees"
    ON public.fees
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users WHERE admin_users.email = current_setting('request.jwt.claim.email', true)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users WHERE admin_users.email = current_setting('request.jwt.claim.email', true)
        )
    );


-- =====================================================================
-- Migration: 20250615002859_b5093631-f141-4395-b724-da6e77e78108.sql
-- =====================================================================
-- The error occurs because the "status" column in the "fees" table is generated as a "GENERATED ALWAYS" column,
-- which means you CANNOT insert or update it directly. It must only be assigned by Postgres.
-- To fix this and allow direct setting of "status" in inserts and updates, we'll drop the generated property and make it a normal text column,
-- then set its default to 'unpaid' for new rows.

-- Drop expression and keep status as normal TEXT with default 'unpaid'
ALTER TABLE public.fees
ALTER COLUMN status DROP EXPRESSION;
ALTER TABLE public.fees
ALTER COLUMN status SET DEFAULT 'unpaid';
-- (optional but recommended) Update all existing rows with NULL status to 'unpaid'
UPDATE public.fees SET status = 'unpaid' WHERE status IS NULL;


-- =====================================================================
-- Migration: 20250615010725_b30b62e4-99eb-49b8-bf59-74e5d392cda1.sql
-- =====================================================================
-- 1. Backup (optional) the old "fees" table if critical.
-- 2. Update "fees" table to match required dashboard/fee management shape.

-- (a) Add new columns for the current system
ALTER TABLE public.fees
  ADD COLUMN IF NOT EXISTS monthly_fee integer NOT NULL DEFAULT 2000,
  ADD COLUMN IF NOT EXISTS paid_amount integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_due integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS year integer NOT NULL DEFAULT 2025;
-- (b) Ensure "month" is integer (not text), remove/rename if needed
ALTER TABLE public.fees
  ALTER COLUMN month TYPE integer USING (month::integer);
-- (c) Remove "amount", "due_date" columns if not needed by UI
ALTER TABLE public.fees
  DROP COLUMN IF EXISTS amount,
  DROP COLUMN IF EXISTS due_date;
-- (d) Set "status" to be a simple text with default
ALTER TABLE public.fees
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status SET DEFAULT 'unpaid';
-- (e) Ensure unique constraint for (student_id, month, year)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename = 'fees' AND indexname = 'fees_student_month_year_idx'
  ) THEN
    CREATE UNIQUE INDEX fees_student_month_year_idx ON public.fees(student_id, month, year);
  END IF;
END$$;
-- (f) Update any rows with NULL monthly_fee, paid_amount, etc.
UPDATE public.fees SET monthly_fee = 2000 WHERE monthly_fee IS NULL;
UPDATE public.fees SET paid_amount = 0 WHERE paid_amount IS NULL;
UPDATE public.fees SET balance_due = 0 WHERE balance_due IS NULL;
UPDATE public.fees SET year = 2025 WHERE year IS NULL;
-- (g) (OPTIONAL) Fix "status" values
UPDATE public.fees SET status = 'unpaid' WHERE status IS NULL;


-- =====================================================================
-- Migration: 20250615013023_8bfdac15-3c83-4e9b-a513-cf744ff62279.sql
-- =====================================================================
ALTER TABLE public.fees
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
-- Set default value for all rows
UPDATE public.fees SET updated_at = now() WHERE updated_at IS NULL;


-- =====================================================================
-- Migration: 20250615013735_d6859552-7724-454f-97e3-af58bbc219d8.sql
-- =====================================================================
-- Add new columns to the events table, if not exist
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS from_date date,
  ADD COLUMN IF NOT EXISTS end_date date,
  ADD COLUMN IF NOT EXISTS tag text;
-- If required, set NOT NULL constraint on title, description, from_date, end_date, image_url
ALTER TABLE public.events
  ALTER COLUMN title SET NOT NULL;
-- For optional tags, we can leave as nullable for now.

-- Make sure the storage bucket exists
insert into storage.buckets (id, name, public)
values ('events', 'events', true)
on conflict (id) do nothing;
-- Enable RLS if not already enabled
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
-- Example admin RLS policy (replace with your actual admin logic/account/email if needed)
CREATE POLICY "Admins can access and modify all events"
ON public.events
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.admin_users WHERE email = auth.jwt()::json->>'email'
));


-- =====================================================================
-- Migration: 20250615015119_d4b12c3b-f82e-4ed0-8755-370b5c2dea27.sql
-- =====================================================================
-- Enable RLS to enforce security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
-- Drop old policy if it exists (policy name may differ, adjust as needed)
DROP POLICY IF EXISTS "Admins can access and modify all events" ON public.events;
-- Add a robust RLS policy using auth.email()
CREATE POLICY "Admins can access and modify all events (standard)"
  ON public.events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE email = auth.email()
    )
  );


-- =====================================================================
-- Migration: 20250615015643_a4ebbb7b-8914-49a2-98f4-5c081eabe74b.sql
-- =====================================================================
-- Make sure the "events" storage bucket allows uploads, updates, deletes, selects by anyone
drop policy if exists "Anyone can upload files to events" on storage.objects;
drop policy if exists "Anyone can update files in events" on storage.objects;
drop policy if exists "Anyone can delete files in events" on storage.objects;
drop policy if exists "Anyone can download files in events" on storage.objects;
create policy "Anyone can upload files to events"
  on storage.objects
  for insert
  with check (bucket_id = 'events');
create policy "Anyone can update files in events"
  on storage.objects
  for update
  using (bucket_id = 'events');
create policy "Anyone can delete files in events"
  on storage.objects
  for delete
  using (bucket_id = 'events');
create policy "Anyone can download files in events"
  on storage.objects
  for select
  using (bucket_id = 'events');


-- =====================================================================
-- Migration: 20250615020757_0bd525ab-fa9a-4a17-b90e-36767e15366c.sql
-- =====================================================================
-- Remove ALL existing policies on fees
DROP POLICY IF EXISTS "Admin can manage fees" ON public.fees;
DROP POLICY IF EXISTS "Admin can insert fees" ON public.fees;
DROP POLICY IF EXISTS "Admin can update fees" ON public.fees;
DROP POLICY IF EXISTS "Admin can delete fees" ON public.fees;
DROP POLICY IF EXISTS "Admin can select fees" ON public.fees;
-- This is a single new policy: allow all access IF the user's email is in admin_users.
CREATE POLICY "Admin can manage fees"
    ON public.fees
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users WHERE admin_users.email = current_setting('request.jwt.claim.email', true)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users WHERE admin_users.email = current_setting('request.jwt.claim.email', true)
        )
    );


-- =====================================================================
-- Migration: 20250615025442_aeebbd9e-6190-48f7-b667-758268dabc0f.sql
-- =====================================================================
-- 1. Drop the old fees table (if it exists)
DROP TABLE IF EXISTS public.fees CASCADE;
-- 2. Recreate the fees table
CREATE TABLE public.fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL,
  monthly_fee integer NOT NULL,
  paid_amount integer NOT NULL DEFAULT 0,
  balance_due integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'unpaid'
);
-- 3. Ensure unique fee per student for month/year
CREATE UNIQUE INDEX IF NOT EXISTS fees_student_month_year_idx ON fees(student_id, month, year);
-- 4. Enable Row-Level Security
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
-- 5. Only admin users (who are in admin_users) can manage fees
DROP POLICY IF EXISTS "Admin can manage fees" ON public.fees;
CREATE POLICY "Admin can manage fees"
  ON public.fees
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.email = current_setting('request.jwt.claim.email', true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.email = current_setting('request.jwt.claim.email', true)
    )
  );
-- 6. Update students table: add default_monthly_fee if it doesn't exist
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS default_monthly_fee integer NOT NULL DEFAULT 2000;
-- 7. Update students table: add profile_image_url if not present (for photo in admin UI)
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS profile_image_url text;
-- 8. Ensure admin_users RLS is enabled
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;


-- =====================================================================
-- Migration: 20250615025715_6facd873-10f3-4037-a7d1-1f736fc6639c.sql
-- =====================================================================
-- 1. Create a new storage bucket for storing fee receipts/files
insert into storage.buckets (id, name, public) values ('fees', 'fees', true);
-- 2. Add a column in `fees` table to store reference to file URL
alter table public.fees add column if not exists receipt_url text;


-- =====================================================================
-- Migration: 20250615030316_baea903a-c284-43d0-a9eb-9c08cf0c594c.sql
-- =====================================================================
-- Allow anyone to upload files to the fees bucket
drop policy if exists "Anyone can upload files to fees" on storage.objects;
create policy "Anyone can upload files to fees"
  on storage.objects
  for insert
  with check (bucket_id = 'fees');
-- Allow anyone to update files in the fees bucket
drop policy if exists "Anyone can update files in fees" on storage.objects;
create policy "Anyone can update files in fees"
  on storage.objects
  for update
  using (bucket_id = 'fees');
-- Allow anyone to delete files in the fees bucket
drop policy if exists "Anyone can delete files in fees" on storage.objects;
create policy "Anyone can delete files in fees"
  on storage.objects
  for delete
  using (bucket_id = 'fees');
-- Allow anyone to select/download files in the fees bucket
drop policy if exists "Anyone can download files in fees" on storage.objects;
create policy "Anyone can download files in fees"
  on storage.objects
  for select
  using (bucket_id = 'fees');


-- =====================================================================
-- Migration: 20250615030857_6c060857-a55e-4a69-b494-00212470918e.sql
-- =====================================================================
-- Remove all existing policies on fees
DROP POLICY IF EXISTS "Admin can manage fees" ON public.fees;
DROP POLICY IF EXISTS "Admin can insert fees" ON public.fees;
DROP POLICY IF EXISTS "Admin can update fees" ON public.fees;
DROP POLICY IF EXISTS "Admin can delete fees" ON public.fees;
DROP POLICY IF EXISTS "Admin can select fees" ON public.fees;
-- Allow ANYONE (no login required) to select from the fees table
CREATE POLICY "Anyone can select fees"
    ON public.fees
    FOR SELECT
    USING (true);
-- Allow ANYONE to insert into the fees table
CREATE POLICY "Anyone can insert fees"
    ON public.fees
    FOR INSERT
    WITH CHECK (true);
-- Allow ANYONE to update any row in the fees table
CREATE POLICY "Anyone can update fees"
    ON public.fees
    FOR UPDATE
    USING (true);
-- Allow ANYONE to delete any row in the fees table
CREATE POLICY "Anyone can delete fees"
    ON public.fees
    FOR DELETE
    USING (true);


-- =====================================================================
-- Migration: 20250615141508_57ea3a1c-143d-46c1-97de-7ef82cdf7bfb.sql
-- =====================================================================
-- Allow anyone (including unauthenticated users) to select (read) events
CREATE POLICY "Public can read events"
ON public.events
FOR SELECT
TO public
USING (true);


-- =====================================================================
-- Migration: 20250813170812_978b81a3-4b95-4970-9089-95a534a9be06.sql
-- =====================================================================
-- Fix critical security vulnerabilities in fees and gallery_images tables

-- 1. Drop existing insecure policies for fees table
DROP POLICY IF EXISTS "Anyone can delete fees" ON public.fees;
DROP POLICY IF EXISTS "Anyone can insert fees" ON public.fees;
DROP POLICY IF EXISTS "Anyone can select fees" ON public.fees;
DROP POLICY IF EXISTS "Anyone can update fees" ON public.fees;
-- 2. Create secure RLS policies for fees table - ADMIN ONLY ACCESS
CREATE POLICY "Admin users can view all fees" 
ON public.fees 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.email = auth.email()
  )
);
CREATE POLICY "Admin users can insert fees" 
ON public.fees 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.email = auth.email()
  )
);
CREATE POLICY "Admin users can update fees" 
ON public.fees 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.email = auth.email()
  )
);
CREATE POLICY "Admin users can delete fees" 
ON public.fees 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.email = auth.email()
  )
);
-- 3. Fix gallery_images table - drop insecure policies
DROP POLICY IF EXISTS "Anyone can delete gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Anyone can insert gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Anyone can update gallery images" ON public.gallery_images;
-- Keep existing secure admin policies and public read access
-- The following policies should remain:
-- - "Admins can do everything on gallery_images" 
-- - "Public can read gallery images";


-- =====================================================================
-- Migration: 20250813170832_b4e75e9f-7269-4b47-851e-25bf1116670a.sql
-- =====================================================================
-- Fix critical security vulnerabilities in fees and gallery_images tables

-- 1. Drop existing insecure policies for fees table
DROP POLICY IF EXISTS "Anyone can delete fees" ON public.fees;
DROP POLICY IF EXISTS "Anyone can insert fees" ON public.fees;
DROP POLICY IF EXISTS "Anyone can select fees" ON public.fees;
DROP POLICY IF EXISTS "Anyone can update fees" ON public.fees;
-- 2. Create secure RLS policies for fees table - ADMIN ONLY ACCESS
CREATE POLICY "Admin users can view all fees" 
ON public.fees 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.email = auth.email()
  )
);
CREATE POLICY "Admin users can insert fees" 
ON public.fees 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.email = auth.email()
  )
);
CREATE POLICY "Admin users can update fees" 
ON public.fees 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.email = auth.email()
  )
);
CREATE POLICY "Admin users can delete fees" 
ON public.fees 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.email = auth.email()
  )
);
-- 3. Fix gallery_images table - drop insecure policies
DROP POLICY IF EXISTS "Anyone can delete gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Anyone can insert gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Anyone can update gallery images" ON public.gallery_images;
-- Keep existing secure admin policies and public read access
-- The following policies should remain:
-- - "Admins can do everything on gallery_images" 
-- - "Public can read gallery images";


-- =====================================================================
-- Migration: 20250908142656_41defae4-1406-4839-8e8f-cd8b2eca8d58.sql
-- =====================================================================
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


-- =====================================================================
-- Migration: 20250908142736_c9a730a9-aae4-4cd6-a54d-97e2d40663ee.sql
-- =====================================================================
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


-- =====================================================================
-- Migration: 20250908142812_38061ffe-3cb7-4b3c-b50e-a00a9eabee0c.sql
-- =====================================================================
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


-- =====================================================================
-- Migration: 20250908142901_cf5880ff-376c-4e82-8099-f676cda57797.sql
-- =====================================================================
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


-- =====================================================================
-- Migration: 20250908142954_9cd11e03-4e09-4705-b00a-e4d5a4050ead.sql
-- =====================================================================
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


-- =====================================================================
-- Migration: 20250909180537_a94e8cb9-cdf6-4826-a8d7-bfc907ff3e42.sql
-- =====================================================================
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


-- =====================================================================
-- Migration: 20250909181101_887dc36e-4ca8-4691-8559-8e82556ef8c3.sql
-- =====================================================================
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


-- =====================================================================
-- Migration: 20251117120000_add_belt_progression.sql
-- =====================================================================
begin;
create table if not exists public.belt_levels (
  id uuid primary key default gen_random_uuid(),
  color text not null,
  rank int not null,
  requirements jsonb not null default '[]'::jsonb,
  min_age int,
  min_sessions int,
  next_level_id uuid references public.belt_levels(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists belt_levels_rank_key on public.belt_levels(rank);
create table if not exists public.student_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  belt_level_id uuid not null references public.belt_levels(id) on delete cascade,
  status text not null check (status in ('needs_work','ready','passed','deferred')) default 'needs_work',
  assessment_date date,
  coach_notes text,
  evidence_media_urls text[] not null default '{}',
  assessed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, belt_level_id)
);
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
drop trigger if exists belt_levels_touch on public.belt_levels;
create trigger belt_levels_touch
before update on public.belt_levels
for each row execute procedure public.touch_updated_at();
drop trigger if exists student_progress_touch on public.student_progress;
create trigger student_progress_touch
before update on public.student_progress
for each row execute procedure public.touch_updated_at();
alter table public.belt_levels enable row level security;
alter table public.student_progress enable row level security;
drop policy if exists "Admins manage belt levels" on public.belt_levels;
create policy "Admins manage belt levels"
  on public.belt_levels
  for all
  using (
    auth.uid() in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );
drop policy if exists "Admins manage student progress" on public.student_progress;
create policy "Admins manage student progress"
  on public.student_progress
  for all
  using (
    auth.uid() in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );
insert into public.belt_levels (color, rank, requirements, min_age, min_sessions)
values
  ('White', 1, '[{"focus":"Basics","techniques":["Stance","Guard"]}]', 5, 0),
  ('Yellow', 2, '[{"focus":"Kicks","techniques":["Front Kick","Side Kick"]}]', 7, 12),
  ('Orange', 3, '[{"focus":"Combinations","techniques":["1-2-3","Parry & Counter"]}]', 8, 24),
  ('Green', 4, '[{"focus":"Defense","techniques":["Blocks","Footwork"]}]', 9, 40),
  ('Blue', 5, '[{"focus":"Sparring","techniques":["Light Spar","Ring Craft"]}]', 10, 60),
  ('Brown', 6, '[{"focus":"Advanced","techniques":["Feints","Counters"]}]', 12, 90),
  ('Black', 7, '[{"focus":"Mastery","techniques":["Full Spar","Teaching"]}]', 14, 120)
on conflict (rank) do nothing;
commit;


-- =====================================================================
-- Migration: 20251117143000_update_progression_policies.sql
-- =====================================================================
begin;
drop policy if exists "Admins manage belt levels" on public.belt_levels;
drop policy if exists "Admins manage belt levels - insert" on public.belt_levels;
drop policy if exists "Admins manage belt levels - update" on public.belt_levels;
drop policy if exists "Admins manage belt levels - delete" on public.belt_levels;
drop policy if exists "Admins manage student progress" on public.student_progress;
drop policy if exists "Admins write student progress" on public.student_progress;
drop policy if exists "Admins update student progress" on public.student_progress;
drop policy if exists "Instructors add evidence" on public.student_progress;
drop function if exists public.is_progress_status_unchanged(uuid, text);
drop view if exists public.profiles;
create view public.profiles as
select
  id,
  coalesce(nullif(raw_user_meta_data->>'role', ''), 'student') as role,
  email,
  raw_user_meta_data
from auth.users;
create or replace function public.is_progress_status_unchanged(row_id uuid, new_status text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_status text;
begin
  select status into current_status from public.student_progress where id = row_id;
  return current_status is null or current_status = new_status;
end;
$$;
create policy "Admins manage belt levels"
  on public.belt_levels
  for select using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );
create policy "Admins manage belt levels - insert"
  on public.belt_levels
  for insert
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );
create policy "Admins manage belt levels - update"
  on public.belt_levels
  for update using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );
create policy "Admins manage belt levels - delete"
  on public.belt_levels
  for delete using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );
create policy "Admins manage student progress"
  on public.student_progress
  for select using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );
create policy "Admins write student progress"
  on public.student_progress
  for insert
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );
create policy "Admins update student progress"
  on public.student_progress
  for update using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );
create policy "Instructors add evidence"
  on public.student_progress
  for update using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'instructor'
    )
  )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'instructor'
    )
    and public.is_progress_status_unchanged(id, status)
  );
commit;


-- =====================================================================
-- Migration: 20251117153000_backfill_belt_links.sql
-- =====================================================================
begin;
update public.belt_levels b
set next_level_id = sub.next_id
from (
  select current.id as id, next.id as next_id
  from public.belt_levels current
  left join public.belt_levels next on next.rank = current.rank + 1
) as sub
where sub.id = b.id
  and (b.next_level_id is distinct from sub.next_id);
commit;


-- =====================================================================
-- Migration: 20251117170000_role_based_security.sql
-- =====================================================================
begin;
-- Remove insecure profiles view exposed from auth.users
drop view if exists public.profiles;
-- Ensure shared role enum exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'instructor', 'staff', 'student');
  END IF;
END$$;
-- Role membership table
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz default now(),
  created_by uuid default auth.uid()
);
alter table public.user_roles enable row level security;
create unique index if not exists user_roles_user_role_key on public.user_roles(user_id, role);
-- Secure helper that bypasses RLS on user_roles
create or replace function public.has_role(required_role text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = required_role::public.app_role
  );
end;
$$;
drop policy if exists "Users read own roles" on public.user_roles;
create policy "Users read own roles"
  on public.user_roles
  for select
  using (auth.uid() = user_id);
drop policy if exists "Admins manage user roles" on public.user_roles;
create policy "Admins manage user roles"
  on public.user_roles
  for all
  using (has_role('admin'))
  with check (has_role('admin'));
-- Seed admin role memberships for legacy admin_users entries
insert into public.user_roles (user_id, role)
select auth_users.id, 'admin'::public.app_role
from auth.users as auth_users
join public.admin_users as legacy on lower(legacy.email) = lower(auth_users.email)
on conflict (user_id, role) do nothing;
-- Blogs
DROP POLICY IF EXISTS "Admins can do everything on blogs" ON public.blogs;
CREATE POLICY "Admin roles manage blogs"
  ON public.blogs
  FOR ALL
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));
-- News
DROP POLICY IF EXISTS "Admins can do everything on news" ON public.news;
CREATE POLICY "Admin roles manage news"
  ON public.news
  FOR ALL
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));
-- Gallery images
DROP POLICY IF EXISTS "Admins can do everything on gallery_images" ON public.gallery_images;
CREATE POLICY "Admin roles manage gallery" 
  ON public.gallery_images
  FOR ALL
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));
-- Events
DROP POLICY IF EXISTS "Admins can access and modify all events" ON public.events;
DROP POLICY IF EXISTS "Admins can access and modify all events (standard)" ON public.events;
CREATE POLICY "Admin roles manage events"
  ON public.events
  FOR ALL
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));
-- Students
DROP POLICY IF EXISTS "Admins can do everything on students" ON public.students;
DROP POLICY IF EXISTS "Enhanced admin access to students" ON public.students;
CREATE POLICY "Admin roles manage students"
  ON public.students
  FOR ALL
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));
-- Fees
DROP POLICY IF EXISTS "Admin can manage fees" ON public.fees;
DROP POLICY IF EXISTS "Admin users can view all fees" ON public.fees;
DROP POLICY IF EXISTS "Admin users can insert fees" ON public.fees;
DROP POLICY IF EXISTS "Admin users can update fees" ON public.fees;
DROP POLICY IF EXISTS "Admin users can delete fees" ON public.fees;
DROP POLICY IF EXISTS "Enhanced admin access to fees" ON public.fees;
DROP POLICY IF EXISTS "Verified admins can view all fees" ON public.fees;
DROP POLICY IF EXISTS "Verified admins can insert fees" ON public.fees;
DROP POLICY IF EXISTS "Verified admins can update fees" ON public.fees;
DROP POLICY IF EXISTS "Verified admins can delete fees" ON public.fees;
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
-- Sensitive audit logs
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.sensitive_data_audit;
CREATE POLICY "Admin roles view sensitive logs"
  ON public.sensitive_data_audit
  FOR SELECT
  USING (has_role('admin'));
-- Main audit logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admin roles view audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (has_role('admin'));
-- Belt levels policies
DROP POLICY IF EXISTS "Admins manage belt levels" ON public.belt_levels;
DROP POLICY IF EXISTS "Admins manage belt levels - insert" ON public.belt_levels;
DROP POLICY IF EXISTS "Admins manage belt levels - update" ON public.belt_levels;
DROP POLICY IF EXISTS "Admins manage belt levels - delete" ON public.belt_levels;
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
-- Student progression board policies
DROP POLICY IF EXISTS "Admins manage student progress" ON public.student_progress;
DROP POLICY IF EXISTS "Admins write student progress" ON public.student_progress;
DROP POLICY IF EXISTS "Admins update student progress" ON public.student_progress;
DROP POLICY IF EXISTS "Instructors add evidence" ON public.student_progress;
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
  WITH CHECK (
    has_role('instructor')
    AND public.is_progress_status_unchanged(id, status)
  );
commit;


-- =====================================================================
-- Migration: 20251209110839_9739c8b5-4af5-4ce5-8946-6e06b1a93ade.sql
-- =====================================================================
-- Create promotion history table
CREATE TABLE public.promotion_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  from_belt_id UUID REFERENCES public.belt_levels(id),
  to_belt_id UUID NOT NULL REFERENCES public.belt_levels(id),
  promoted_by UUID REFERENCES auth.users(id),
  promoted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- Enable Row Level Security
ALTER TABLE public.promotion_history ENABLE ROW LEVEL SECURITY;
-- Create policies for admin access
CREATE POLICY "Admin roles can view promotion history" 
ON public.promotion_history 
FOR SELECT 
USING (has_role('admin'::text));
CREATE POLICY "Admin roles can insert promotion history" 
ON public.promotion_history 
FOR INSERT 
WITH CHECK (has_role('admin'::text));
CREATE POLICY "Admin roles can delete promotion history" 
ON public.promotion_history 
FOR DELETE 
USING (has_role('admin'::text));
-- Create index for faster lookups
CREATE INDEX idx_promotion_history_student ON public.promotion_history(student_id);
CREATE INDEX idx_promotion_history_date ON public.promotion_history(promoted_at DESC);


-- =====================================================================
-- Migration: 20251224145646_6dec9239-43cd-4c3f-ad75-6037d8ea222f.sql
-- =====================================================================
-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
-- Fix SECURITY DEFINER functions with proper search_path using extensions schema
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data_text text)
RETURNS bytea
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT extensions.pgp_sym_encrypt(data_text, 'student-data-encryption-key-2025');
$$;
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(encrypted_data bytea)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT extensions.pgp_sym_decrypt(encrypted_data, 'student-data-encryption-key-2025');
$$;
-- Fix audit_sensitive_data_changes with search_path
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


-- =====================================================================
-- Migration: 20251224145713_3f1f13f5-8fe8-48a0-b296-aa9efb2c295e.sql
-- =====================================================================
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


-- =====================================================================
-- Migration: 20251224163412_916ad2ae-cd1c-4a50-9283-e7cfa7003974.sql
-- =====================================================================
-- Step 1: Create function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
-- Step 2: Add discipline column to belt_levels
ALTER TABLE public.belt_levels ADD COLUMN IF NOT EXISTS discipline TEXT DEFAULT 'general';
-- Step 3: Add stripe_count to student_progress for BJJ stripes
ALTER TABLE public.student_progress ADD COLUMN IF NOT EXISTS stripe_count INTEGER DEFAULT 0;
-- Step 4: Add check constraint for stripe_count
ALTER TABLE public.student_progress DROP CONSTRAINT IF EXISTS student_progress_stripe_count_check;
ALTER TABLE public.student_progress ADD CONSTRAINT student_progress_stripe_count_check CHECK (stripe_count >= 0 AND stripe_count <= 4);


-- =====================================================================
-- Migration: 20251224163435_236340a3-00d9-4fa3-a4e2-ad6ba610a02f.sql
-- =====================================================================
-- Create discipline_levels table for non-belt disciplines
CREATE TABLE public.discipline_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discipline TEXT NOT NULL,
  level_name TEXT NOT NULL,
  level_order INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  requirements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(discipline, level_order)
);
-- Enable RLS on discipline_levels
ALTER TABLE public.discipline_levels ENABLE ROW LEVEL SECURITY;
-- Create RLS policies for discipline_levels
CREATE POLICY "Admin roles can manage discipline levels" 
ON public.discipline_levels 
FOR ALL 
USING (has_role('admin'::text))
WITH CHECK (has_role('admin'::text));
CREATE POLICY "Public can read discipline levels" 
ON public.discipline_levels 
FOR SELECT 
USING (true);
-- Create updated_at trigger for discipline_levels
CREATE TRIGGER update_discipline_levels_updated_at
BEFORE UPDATE ON public.discipline_levels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create student_discipline_progress table for non-belt disciplines
CREATE TABLE public.student_discipline_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  discipline_level_id UUID NOT NULL REFERENCES public.discipline_levels(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'on_hold')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  coach_notes TEXT,
  milestones JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, discipline_level_id)
);
-- Enable RLS on student_discipline_progress
ALTER TABLE public.student_discipline_progress ENABLE ROW LEVEL SECURITY;
-- Create RLS policies for student_discipline_progress
CREATE POLICY "Admin roles can manage student discipline progress" 
ON public.student_discipline_progress 
FOR ALL 
USING (has_role('admin'::text))
WITH CHECK (has_role('admin'::text));
-- Create updated_at trigger for student_discipline_progress
CREATE TRIGGER update_student_discipline_progress_updated_at
BEFORE UPDATE ON public.student_discipline_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- =====================================================================
-- Migration: 20251224164929_14b81eea-dcd4-436e-ae69-639171e6817a.sql
-- =====================================================================
-- Drop the unique index on rank (it should be unique per discipline, not globally)
DROP INDEX IF EXISTS belt_levels_rank_key;
-- Create a proper unique index on discipline + rank
CREATE UNIQUE INDEX IF NOT EXISTS belt_levels_discipline_rank_key ON belt_levels(discipline, rank);
-- Insert discipline-specific belt levels
-- Taekwondo
INSERT INTO belt_levels (discipline, color, rank, min_age, min_sessions, requirements) VALUES
  ('Taekwondo', 'White', 1, 5, 0, '[]'::jsonb),
  ('Taekwondo', 'Yellow', 2, 6, 12, '[]'::jsonb),
  ('Taekwondo', 'Green', 3, 7, 24, '[]'::jsonb),
  ('Taekwondo', 'Blue', 4, 8, 40, '[]'::jsonb),
  ('Taekwondo', 'Red', 5, 10, 60, '[]'::jsonb),
  ('Taekwondo', 'Black', 6, 12, 90, '[]'::jsonb)
ON CONFLICT (discipline, rank) DO NOTHING;
-- Karate
INSERT INTO belt_levels (discipline, color, rank, min_age, min_sessions, requirements) VALUES
  ('Karate', 'White', 1, 5, 0, '[]'::jsonb),
  ('Karate', 'Yellow', 2, 6, 12, '[]'::jsonb),
  ('Karate', 'Orange', 3, 7, 20, '[]'::jsonb),
  ('Karate', 'Green', 4, 8, 32, '[]'::jsonb),
  ('Karate', 'Blue', 5, 9, 48, '[]'::jsonb),
  ('Karate', 'Brown', 6, 11, 72, '[]'::jsonb),
  ('Karate', 'Black', 7, 14, 100, '[]'::jsonb)
ON CONFLICT (discipline, rank) DO NOTHING;
-- Kickboxing
INSERT INTO belt_levels (discipline, color, rank, min_age, min_sessions, requirements) VALUES
  ('Kickboxing', 'White', 1, 6, 0, '[]'::jsonb),
  ('Kickboxing', 'Yellow', 2, 7, 12, '[]'::jsonb),
  ('Kickboxing', 'Green', 3, 8, 24, '[]'::jsonb),
  ('Kickboxing', 'Blue', 4, 9, 40, '[]'::jsonb),
  ('Kickboxing', 'Brown', 5, 11, 60, '[]'::jsonb),
  ('Kickboxing', 'Black', 6, 14, 90, '[]'::jsonb)
ON CONFLICT (discipline, rank) DO NOTHING;
-- BJJ (with stripe support)
INSERT INTO belt_levels (discipline, color, rank, min_age, min_sessions, requirements) VALUES
  ('BJJ', 'White', 1, 16, 0, '[]'::jsonb),
  ('BJJ', 'Blue', 2, 16, 100, '[]'::jsonb),
  ('BJJ', 'Purple', 3, 16, 200, '[]'::jsonb),
  ('BJJ', 'Brown', 4, 18, 300, '[]'::jsonb),
  ('BJJ', 'Black', 5, 19, 400, '[]'::jsonb)
ON CONFLICT (discipline, rank) DO NOTHING;
-- Grappling
INSERT INTO belt_levels (discipline, color, rank, min_age, min_sessions, requirements) VALUES
  ('Grappling', 'White', 1, 16, 0, '[]'::jsonb),
  ('Grappling', 'Blue', 2, 16, 100, '[]'::jsonb),
  ('Grappling', 'Purple', 3, 16, 200, '[]'::jsonb),
  ('Grappling', 'Brown', 4, 18, 300, '[]'::jsonb),
  ('Grappling', 'Black', 5, 19, 400, '[]'::jsonb)
ON CONFLICT (discipline, rank) DO NOTHING;
-- Set up next_level_id references for each discipline
UPDATE belt_levels t SET next_level_id = (
  SELECT n.id FROM belt_levels n 
  WHERE n.discipline = t.discipline AND n.rank = t.rank + 1
);
-- Insert discipline levels for non-belt disciplines
INSERT INTO discipline_levels (discipline, level_name, level_order, description) VALUES
  ('Boxing', 'Beginner', 1, 'Foundation training'),
  ('Boxing', 'Intermediate', 2, 'Technique development'),
  ('Boxing', 'Advanced', 3, 'Sparring and strategy'),
  ('Boxing', 'Competition', 4, 'Fight preparation'),
  ('MMA', 'Foundation', 1, 'Basic striking and grappling'),
  ('MMA', 'Intermediate', 2, 'Combination training'),
  ('MMA', 'Advanced', 3, 'Full MMA integration'),
  ('MMA', 'Fighter', 4, 'Competition ready'),
  ('Self-Defense', 'Awareness', 1, 'Situational awareness'),
  ('Self-Defense', 'Basic Defense', 2, 'Core defensive techniques'),
  ('Self-Defense', 'Advanced Defense', 3, 'Complex scenarios'),
  ('Self-Defense', 'Instructor', 4, 'Teaching capability'),
  ('Fitness', 'Starter', 1, 'Getting started'),
  ('Fitness', 'Active', 2, 'Regular training'),
  ('Fitness', 'Fit', 3, 'Peak performance'),
  ('Fitness', 'Elite', 4, 'Elite athlete'),
  ('Fat Loss', 'Week 1-4', 1, 'Initial phase'),
  ('Fat Loss', 'Week 5-8', 2, 'Building phase'),
  ('Fat Loss', 'Week 9-12', 3, 'Transformation phase'),
  ('Fat Loss', 'Maintenance', 4, 'Long-term maintenance'),
  ('Kalaripayattu', 'Meythari', 1, 'Body conditioning'),
  ('Kalaripayattu', 'Kolthari', 2, 'Wooden weapons'),
  ('Kalaripayattu', 'Ankathari', 3, 'Metal weapons'),
  ('Kalaripayattu', 'Verumkai', 4, 'Empty hand combat'),
  ('Kalaripayattu', 'Gurukkal', 5, 'Master instructor')
ON CONFLICT (discipline, level_order) DO NOTHING;


-- =====================================================================
-- Migration: 20260308163652_90061d28-333b-43fd-a7fd-3ec9919daf09.sql
-- =====================================================================
-- Program testimonials table
CREATE TABLE public.program_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_slug text NOT NULL,
  student_name text NOT NULL,
  review text NOT NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text,
  is_published boolean NOT NULL DEFAULT true
);
-- Enable RLS
ALTER TABLE public.program_testimonials ENABLE ROW LEVEL SECURITY;
-- Public can read published testimonials
CREATE POLICY "Public can read published testimonials"
  ON public.program_testimonials FOR SELECT
  USING (is_published = true);
-- Admins can manage testimonials
CREATE POLICY "Admin roles manage testimonials"
  ON public.program_testimonials FOR ALL
  TO authenticated
  USING (has_role('admin'::text))
  WITH CHECK (has_role('admin'::text));
-- Admins via admin_users table
CREATE POLICY "Admins can manage testimonials"
  ON public.program_testimonials FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.email()));


-- =====================================================================
-- Migration: 20260308171015_cfa1224b-d1c8-4044-a481-cdc279c3d6ee.sql
-- =====================================================================
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS location text DEFAULT NULL;


-- =====================================================================
-- Migration: 20260308171634_283f0e56-99b5-4a81-9bfc-5bb5185b7a5c.sql
-- =====================================================================
-- 1. Create all tables first (no cross-references in policies yet)
CREATE TABLE IF NOT EXISTS public.student_portal_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL UNIQUE,
  login_id text NOT NULL UNIQUE,
  auth_user_id uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  date date NOT NULL,
  end_date date,
  location_text text,
  location_lat double precision,
  location_lng double precision,
  max_participants integer,
  image_url text,
  status text NOT NULL DEFAULT 'upcoming',
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.competition_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'registered',
  registered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(competition_id, student_id)
);
CREATE TABLE IF NOT EXISTS public.competition_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  certificate_url text NOT NULL,
  uploaded_by text,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(competition_id, student_id)
);
-- 2. Enable RLS
ALTER TABLE public.student_portal_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_certificates ENABLE ROW LEVEL SECURITY;
-- 3. Admin policies
CREATE POLICY "admin_manage_portal_accounts" ON public.student_portal_accounts FOR ALL TO authenticated USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "student_read_own_account" ON public.student_portal_accounts FOR SELECT TO authenticated USING (auth_user_id = auth.uid());
CREATE POLICY "admin_manage_competitions" ON public.competitions FOR ALL TO authenticated USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "public_read_competitions" ON public.competitions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_manage_registrations" ON public.competition_registrations FOR ALL TO authenticated USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "student_register" ON public.competition_registrations FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = competition_registrations.student_id));
CREATE POLICY "student_view_registrations" ON public.competition_registrations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = competition_registrations.student_id));
CREATE POLICY "admin_manage_certificates" ON public.competition_certificates FOR ALL TO authenticated USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "student_view_certificates" ON public.competition_certificates FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = competition_certificates.student_id));
-- 4. Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', true) ON CONFLICT (id) DO NOTHING;
-- 5. Trigger
CREATE TRIGGER update_competitions_updated_at BEFORE UPDATE ON public.competitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- =====================================================================
-- Migration: 20260308185043_5d8169de-74b8-4f56-a895-e886526fbd71.sql
-- =====================================================================
-- 1. Students can read their own record via portal account link
CREATE POLICY "student_read_own_profile"
ON public.students
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid()
    AND spa.student_id = students.id
  )
);
-- 2. Students can read their own fees
CREATE POLICY "student_read_own_fees"
ON public.fees
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid()
    AND spa.student_id = fees.student_id
  )
);
-- 3. Students can read their own progression
CREATE POLICY "student_read_own_progress"
ON public.student_progress
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid()
    AND spa.student_id = student_progress.student_id
  )
);
-- 4. Students can read belt levels (reference data)
CREATE POLICY "student_read_belt_levels"
ON public.belt_levels
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid()
  )
);
-- 5. Students can read their own promotion history
CREATE POLICY "student_read_own_promotions"
ON public.promotion_history
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid()
    AND spa.student_id = promotion_history.student_id
  )
);
-- 6. Create announcements table
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  priority text NOT NULL DEFAULT 'normal',
  is_active boolean NOT NULL DEFAULT true,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
-- Admins manage announcements
CREATE POLICY "admin_manage_announcements"
ON public.announcements
FOR ALL
TO authenticated
USING (has_role('admin'::text))
WITH CHECK (has_role('admin'::text));
-- Students can read active announcements
CREATE POLICY "student_read_announcements"
ON public.announcements
FOR SELECT
TO authenticated
USING (
  is_active = true
  AND (expires_at IS NULL OR expires_at > now())
);


-- =====================================================================
-- Migration: 20260308190551_2cd5fb66-dff2-4766-905a-9bdaef0fd673.sql
-- =====================================================================
-- Create enrollment_requests table for website enrollment form submissions
CREATE TABLE public.enrollment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL,
  parent_name text NOT NULL,
  parent_phone text NOT NULL,
  program text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by text
);
-- Enable RLS
ALTER TABLE public.enrollment_requests ENABLE ROW LEVEL SECURITY;
-- Anyone can submit enrollment requests (public insert)
CREATE POLICY "public_submit_enrollment" ON public.enrollment_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
-- Admins can manage all enrollment requests
CREATE POLICY "admin_manage_enrollment" ON public.enrollment_requests
  FOR ALL TO authenticated
  USING (has_role('admin'::text))
  WITH CHECK (has_role('admin'::text));
-- Fix announcements: add permissive SELECT for anon (public announcements should be readable)
-- Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "student_read_announcements" ON public.announcements;
DROP POLICY IF EXISTS "admin_manage_announcements" ON public.announcements;
CREATE POLICY "admin_manage_announcements" ON public.announcements
  FOR ALL TO authenticated
  USING (has_role('admin'::text))
  WITH CHECK (has_role('admin'::text));
CREATE POLICY "authenticated_read_active_announcements" ON public.announcements
  FOR SELECT TO authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));


-- =====================================================================
-- Migration: 20260308191519_ffd653a8-b154-4f3a-ad63-86a01e8abf45.sql
-- =====================================================================
-- Add position column to competition_registrations
ALTER TABLE public.competition_registrations 
ADD COLUMN IF NOT EXISTS position text DEFAULT NULL;
-- Add position_announced flag
ALTER TABLE public.competition_registrations 
ADD COLUMN IF NOT EXISTS position_notes text DEFAULT NULL;
-- Create student-avatars storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student-avatars', 'student-avatars', true)
ON CONFLICT (id) DO NOTHING;
-- RLS for student-avatars bucket: students can upload their own avatars
CREATE POLICY "Students can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'student-avatars' 
  AND EXISTS (
    SELECT 1 FROM public.student_portal_accounts spa 
    WHERE spa.auth_user_id = auth.uid()
  )
);
CREATE POLICY "Students can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'student-avatars' 
  AND EXISTS (
    SELECT 1 FROM public.student_portal_accounts spa 
    WHERE spa.auth_user_id = auth.uid()
  )
);
CREATE POLICY "Public can read student avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'student-avatars');
-- Allow students to update their own profile (name, parent_name, parent_contact, profile_image_url only)
CREATE POLICY "student_update_own_profile"
ON public.students FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.student_portal_accounts spa 
    WHERE spa.auth_user_id = auth.uid() AND spa.student_id = students.id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.student_portal_accounts spa 
    WHERE spa.auth_user_id = auth.uid() AND spa.student_id = students.id
  )
);


-- =====================================================================
-- Migration: 20260308192414_3567b00c-0d13-4a25-867c-b4674d77a330.sql
-- =====================================================================
-- Add aadhar_number to enrollment_requests for duplicate checking
ALTER TABLE public.enrollment_requests ADD COLUMN IF NOT EXISTS aadhar_number text;
-- Create attendance table
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  check_in_time timestamptz,
  check_out_time timestamptz,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'holiday')),
  notes text,
  marked_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, date)
);
-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
-- Admin full access
CREATE POLICY "admin_manage_attendance" ON public.attendance
  FOR ALL TO authenticated
  USING (has_role('admin'::text))
  WITH CHECK (has_role('admin'::text));
-- Students read own attendance
CREATE POLICY "student_read_own_attendance" ON public.attendance
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid() AND spa.student_id = attendance.student_id
  ));
-- Create index for fast queries
CREATE INDEX idx_attendance_student_date ON public.attendance (student_id, date);
CREATE INDEX idx_attendance_date ON public.attendance (date);


-- =====================================================================
-- Migration: 20260308192913_46b76851-14eb-4d16-a365-db9ac84d8495.sql
-- =====================================================================
-- Academy settings table for global defaults
CREATE TABLE IF NOT EXISTS public.academy_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text
);
ALTER TABLE public.academy_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_manage_settings" ON public.academy_settings
  FOR ALL TO authenticated
  USING (has_role('admin'::text))
  WITH CHECK (has_role('admin'::text));
CREATE POLICY "public_read_settings" ON public.academy_settings
  FOR SELECT TO authenticated
  USING (true);
-- Insert default fee setting
INSERT INTO public.academy_settings (key, value) VALUES ('default_monthly_fee', '2000') ON CONFLICT (key) DO NOTHING;
-- Add discount_percent to students table
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS discount_percent integer NOT NULL DEFAULT 0;


-- =====================================================================
-- Migration: 20260308193443_93c7f7e7-9e30-454b-a119-a3bfeeda1653.sql
-- =====================================================================
-- ============================================================
-- SCHEMA AUDIT & OPTIMIZATION
-- ============================================================

-- 1. INDEXES for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_fees_student_month_year ON public.fees (student_id, month, year);
CREATE INDEX IF NOT EXISTS idx_fees_status ON public.fees (status);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance (student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance (date);
CREATE INDEX IF NOT EXISTS idx_students_program ON public.students (program);
CREATE INDEX IF NOT EXISTS idx_students_name ON public.students (name);
CREATE INDEX IF NOT EXISTS idx_student_progress_student ON public.student_progress (student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_belt ON public.student_progress (belt_level_id);
CREATE INDEX IF NOT EXISTS idx_promotion_history_student ON public.promotion_history (student_id);
CREATE INDEX IF NOT EXISTS idx_competition_registrations_student ON public.competition_registrations (student_id);
CREATE INDEX IF NOT EXISTS idx_competition_registrations_competition ON public.competition_registrations (competition_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_status ON public.enrollment_requests (status);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_aadhar ON public.enrollment_requests (aadhar_number);
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON public.blogs (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events (date DESC);
CREATE INDEX IF NOT EXISTS idx_news_date ON public.news (date DESC);
CREATE INDEX IF NOT EXISTS idx_belt_levels_discipline_rank ON public.belt_levels (discipline, rank);
CREATE INDEX IF NOT EXISTS idx_student_discipline_progress_student ON public.student_discipline_progress (student_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements (is_active, expires_at);
-- 2. Add proper CASCADING foreign keys where missing
-- attendance â†’ students
ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_student_id_fkey;
ALTER TABLE public.attendance ADD CONSTRAINT attendance_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- fees â†’ students  
ALTER TABLE public.fees DROP CONSTRAINT IF EXISTS fees_student_id_fkey;
ALTER TABLE public.fees ADD CONSTRAINT fees_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- student_progress â†’ students
ALTER TABLE public.student_progress DROP CONSTRAINT IF EXISTS student_progress_student_id_fkey;
ALTER TABLE public.student_progress ADD CONSTRAINT student_progress_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- promotion_history â†’ students
ALTER TABLE public.promotion_history DROP CONSTRAINT IF EXISTS promotion_history_student_id_fkey;
ALTER TABLE public.promotion_history ADD CONSTRAINT promotion_history_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- competition_registrations â†’ students
ALTER TABLE public.competition_registrations DROP CONSTRAINT IF EXISTS competition_registrations_student_id_fkey;
ALTER TABLE public.competition_registrations ADD CONSTRAINT competition_registrations_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- competition_certificates â†’ students
ALTER TABLE public.competition_certificates DROP CONSTRAINT IF EXISTS competition_certificates_student_id_fkey;
ALTER TABLE public.competition_certificates ADD CONSTRAINT competition_certificates_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- student_discipline_progress â†’ students
ALTER TABLE public.student_discipline_progress DROP CONSTRAINT IF EXISTS student_discipline_progress_student_id_fkey;
ALTER TABLE public.student_discipline_progress ADD CONSTRAINT student_discipline_progress_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- student_portal_accounts â†’ students
ALTER TABLE public.student_portal_accounts DROP CONSTRAINT IF EXISTS student_portal_accounts_student_id_fkey;
ALTER TABLE public.student_portal_accounts ADD CONSTRAINT student_portal_accounts_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- competition_certificates â†’ competitions
ALTER TABLE public.competition_certificates DROP CONSTRAINT IF EXISTS competition_certificates_competition_id_fkey;
ALTER TABLE public.competition_certificates ADD CONSTRAINT competition_certificates_competition_id_fkey 
  FOREIGN KEY (competition_id) REFERENCES public.competitions(id) ON DELETE CASCADE;
-- competition_registrations â†’ competitions
ALTER TABLE public.competition_registrations DROP CONSTRAINT IF EXISTS competition_registrations_competition_id_fkey;
ALTER TABLE public.competition_registrations ADD CONSTRAINT competition_registrations_competition_id_fkey 
  FOREIGN KEY (competition_id) REFERENCES public.competitions(id) ON DELETE CASCADE;
-- 3. Add updated_at trigger to tables missing it
CREATE OR REPLACE FUNCTION public.auto_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_students_updated_at') THEN
    CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON public.students
      FOR EACH ROW EXECUTE FUNCTION public.auto_updated_at();
  END IF;
END $$;
-- 4. Add unique constraint for enrollment_requests aadhar (prevent duplicates at DB level)
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollment_unique_aadhar_pending 
  ON public.enrollment_requests (aadhar_number) 
  WHERE status = 'pending';


-- =====================================================================
-- Migration: 20260308194032_b18249cd-1420-4ca9-995f-9e39dfad59af.sql
-- =====================================================================
-- Fix RLS: Add admin_users email-based policies for enrollment_requests
CREATE POLICY "admin_users_manage_enrollment"
ON public.enrollment_requests FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
-- Fix RLS: Add admin_users email-based policies for student_portal_accounts
CREATE POLICY "admin_users_manage_portal_accounts"
ON public.student_portal_accounts FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
-- Fix RLS: Add admin_users email-based policies for attendance
CREATE POLICY "admin_users_manage_attendance"
ON public.attendance FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
-- Fix RLS: Add admin_users email-based policies for announcements
CREATE POLICY "admin_users_manage_announcements"
ON public.announcements FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
-- Fix RLS: Add admin_users email-based policies for competition tables
CREATE POLICY "admin_users_manage_competitions"
ON public.competitions FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "admin_users_manage_comp_registrations"
ON public.competition_registrations FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "admin_users_manage_comp_certificates"
ON public.competition_certificates FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
-- Fix RLS: Add admin_users email-based policies for progression tables
CREATE POLICY "admin_users_manage_student_progress"
ON public.student_progress FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "admin_users_manage_discipline_progress"
ON public.student_discipline_progress FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "admin_users_manage_promotion_history"
ON public.promotion_history FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
-- Fix RLS: Add admin_users email-based policies for belt_levels
CREATE POLICY "admin_users_manage_belt_levels"
ON public.belt_levels FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
-- Fix RLS: Add admin_users email-based policy for academy_settings
CREATE POLICY "admin_users_manage_settings"
ON public.academy_settings FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));


-- =====================================================================
-- Migration: 20260308194350_40eaeb86-ae74-4976-badb-a9aa810b04db.sql
-- =====================================================================
-- Add ON DELETE CASCADE to all tables referencing students
-- 1. attendance
ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_student_id_fkey;
ALTER TABLE public.attendance ADD CONSTRAINT attendance_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- 2. fees
ALTER TABLE public.fees DROP CONSTRAINT IF EXISTS fees_student_id_fkey;
ALTER TABLE public.fees ADD CONSTRAINT fees_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- 3. student_progress
ALTER TABLE public.student_progress DROP CONSTRAINT IF EXISTS student_progress_student_id_fkey;
ALTER TABLE public.student_progress ADD CONSTRAINT student_progress_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- 4. student_discipline_progress
ALTER TABLE public.student_discipline_progress DROP CONSTRAINT IF EXISTS student_discipline_progress_student_id_fkey;
ALTER TABLE public.student_discipline_progress ADD CONSTRAINT student_discipline_progress_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- 5. promotion_history
ALTER TABLE public.promotion_history DROP CONSTRAINT IF EXISTS promotion_history_student_id_fkey;
ALTER TABLE public.promotion_history ADD CONSTRAINT promotion_history_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- 6. competition_registrations
ALTER TABLE public.competition_registrations DROP CONSTRAINT IF EXISTS competition_registrations_student_id_fkey;
ALTER TABLE public.competition_registrations ADD CONSTRAINT competition_registrations_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- 7. competition_certificates
ALTER TABLE public.competition_certificates DROP CONSTRAINT IF EXISTS competition_certificates_student_id_fkey;
ALTER TABLE public.competition_certificates ADD CONSTRAINT competition_certificates_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- 8. student_portal_accounts
ALTER TABLE public.student_portal_accounts DROP CONSTRAINT IF EXISTS student_portal_accounts_student_id_fkey;
ALTER TABLE public.student_portal_accounts ADD CONSTRAINT student_portal_accounts_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


-- =====================================================================
-- Migration: 20260308194632_d366646c-fa4d-4f95-b3f2-2f4cad53506a.sql
-- =====================================================================
-- Fix: Add unique constraint for competition certificates upsert
ALTER TABLE public.competition_certificates
  ADD CONSTRAINT competition_certificates_comp_student_unique
  UNIQUE (competition_id, student_id);


-- =====================================================================
-- Migration: 20260308194857_2d3fed10-8474-4e64-90cb-9d352b3eb746.sql
-- =====================================================================
-- Add storage policies for certificates bucket
CREATE POLICY "Authenticated users can upload certificates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'certificates');
CREATE POLICY "Public can read certificates"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'certificates');
CREATE POLICY "Authenticated users can update certificates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'certificates');
CREATE POLICY "Authenticated users can delete certificates"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'certificates');
-- Also add storage policies for progress-media bucket (missing)
CREATE POLICY "Authenticated users can upload progress media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'progress-media');
CREATE POLICY "Public can read progress media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'progress-media');
CREATE POLICY "Authenticated users can update progress media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'progress-media');
CREATE POLICY "Authenticated users can delete progress media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'progress-media');


-- =====================================================================
-- Migration: 20260308195746_76f18167-3e3b-4267-9957-a756bd761f66.sql
-- =====================================================================
-- Enforce one attendance record per student per day
ALTER TABLE public.attendance
  ADD CONSTRAINT attendance_student_date_unique
  UNIQUE (student_id, date);
-- Prevent updates to attendance status once marked (only allow check_out_time updates)
CREATE OR REPLACE FUNCTION public.prevent_attendance_status_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Allow updating check_out_time only
  IF OLD.status IS NOT NULL AND NEW.status != OLD.status THEN
    RAISE EXCEPTION 'Attendance status cannot be changed once marked.';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_prevent_attendance_status_change
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_attendance_status_change();


-- =====================================================================
-- Migration: 20260308202727_2f846e4b-a2f1-4603-bcba-f14348c52ea3.sql
-- =====================================================================
ALTER TABLE public.enrollment_requests 
  ADD COLUMN IF NOT EXISTS student_email text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS student_phone text DEFAULT NULL;


-- =====================================================================
-- Migration: 20260308203448_2551d615-746f-4fcd-8dc1-b1f23c4c577d.sql
-- =====================================================================
-- Add unique constraint on aadhar_number in students table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'students_aadhar_number_unique'
  ) THEN
    ALTER TABLE public.students ADD CONSTRAINT students_aadhar_number_unique UNIQUE (aadhar_number);
  END IF;
END $$;
-- Add unique constraint on login_id in student_portal_accounts (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'student_portal_accounts_login_id_unique'
  ) THEN
    ALTER TABLE public.student_portal_accounts ADD CONSTRAINT student_portal_accounts_login_id_unique UNIQUE (login_id);
  END IF;
END $$;


-- =====================================================================
-- Migration: 20260308203632_ffde5710-64d8-4720-b9fc-e2f45ab3e5b9.sql
-- =====================================================================
-- Create student_programs junction table for multi-program enrollment
CREATE TABLE public.student_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  program_name text NOT NULL,
  joined_at date NOT NULL DEFAULT CURRENT_DATE,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, program_name)
);
-- Enable RLS
ALTER TABLE public.student_programs ENABLE ROW LEVEL SECURITY;
-- Admin policies
CREATE POLICY "admin_manage_student_programs" ON public.student_programs
  FOR ALL TO authenticated
  USING (has_role('admin'::text))
  WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_student_programs" ON public.student_programs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_read_own_programs" ON public.student_programs
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid() AND spa.student_id = student_programs.student_id
  ));
-- Migrate existing data: insert current program as primary for all students
INSERT INTO public.student_programs (student_id, program_name, joined_at, is_primary)
SELECT id, program, join_date, true
FROM public.students
WHERE program IS NOT NULL AND program != ''
ON CONFLICT (student_id, program_name) DO NOTHING;


-- =====================================================================
-- Migration: 20260308205845_2f51c178-a1dd-4c50-b326-da82c8f172aa.sql
-- =====================================================================
-- Fix: students table has a trigger referencing updated_at but no such column
-- Drop the broken trigger since students table doesn't use updated_at
DROP TRIGGER IF EXISTS trg_students_updated_at ON public.students;


-- =====================================================================
-- Migration: 20260308205930_1ad1637b-c814-4df3-b579-b02517d9b594.sql
-- =====================================================================
-- Sync: insert missing primary program records for all students
INSERT INTO public.student_programs (student_id, program_name, joined_at, is_primary)
SELECT s.id, s.program, s.join_date, true
FROM public.students s
LEFT JOIN public.student_programs sp ON sp.student_id = s.id AND sp.is_primary = true
WHERE sp.id IS NULL
ON CONFLICT (student_id, program_name) DO UPDATE SET is_primary = true;


-- =====================================================================
-- Migration: 20260309035454_edd05072-76b9-4bd1-a758-891655197ddd.sql
-- =====================================================================
-- Allow students to read their own discipline progress records
CREATE POLICY "student_read_own_discipline_progress"
ON public.student_discipline_progress
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid()
      AND spa.student_id = student_discipline_progress.student_id
  )
);


-- =====================================================================
-- Migration: 20260309042408_53bc239d-0fb2-47d7-b9c5-9e6511fa18d7.sql
-- =====================================================================
-- Belt exam notifications table
CREATE TABLE public.belt_exam_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  exam_date DATE NOT NULL,
  discipline TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.belt_exam_notifications ENABLE ROW LEVEL SECURITY;
-- Admin can manage all notifications
CREATE POLICY "admin_manage_belt_exam_notifications" ON public.belt_exam_notifications
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "admin_role_manage_belt_exam_notifications" ON public.belt_exam_notifications
  FOR ALL TO authenticated
  USING (has_role('admin'::text))
  WITH CHECK (has_role('admin'::text));
-- Students can read their own notifications
CREATE POLICY "student_read_own_belt_exam_notifications" ON public.belt_exam_notifications
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid() AND spa.student_id = belt_exam_notifications.student_id
  ));
-- Students can mark their own notifications as read
CREATE POLICY "student_update_own_belt_exam_notifications" ON public.belt_exam_notifications
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid() AND spa.student_id = belt_exam_notifications.student_id
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM student_portal_accounts spa
    WHERE spa.auth_user_id = auth.uid() AND spa.student_id = belt_exam_notifications.student_id
  ));
-- Disciplines management table
CREATE TABLE public.disciplines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'belt' CHECK (type IN ('belt', 'level')),
  has_stripes BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_disciplines" ON public.disciplines
  FOR SELECT USING (true);
CREATE POLICY "admin_manage_disciplines" ON public.disciplines
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "admin_role_manage_disciplines" ON public.disciplines
  FOR ALL TO authenticated
  USING (has_role('admin'::text))
  WITH CHECK (has_role('admin'::text));
-- Seed default disciplines
INSERT INTO public.disciplines (name, type, has_stripes, description, display_order) VALUES
  ('Taekwondo', 'belt', false, 'Korean martial art with belt progression', 1),
  ('Karate', 'belt', false, 'Japanese martial art with belt progression', 2),
  ('Kickboxing', 'belt', false, 'Combat sport with grade/belt progression', 3),
  ('BJJ', 'belt', true, 'Brazilian Jiu-Jitsu with IBJJF belt system', 4),
  ('Grappling', 'belt', true, 'Grappling following IBJJF belt system', 5),
  ('Boxing', 'level', false, 'Performance-based progression', 6),
  ('MMA', 'level', false, 'Experience/fight readiness levels', 7),
  ('Self-Defense', 'level', false, 'Skill-based progression', 8),
  ('Fitness', 'level', false, 'Milestone-based progression', 9),
  ('Fat Loss', 'level', false, 'Program phase progression', 10),
  ('Kalaripayattu', 'level', false, 'Traditional Indian martial art', 11);


-- =====================================================================
-- Migration: 20260309043343_7e840fb2-f70f-43c5-b57a-35357660df05.sql
-- =====================================================================
-- Add missing DELETE policy for student_progress (admin roles)
CREATE POLICY "Admin roles delete student progress"
ON public.student_progress
FOR DELETE
TO authenticated
USING (has_role('admin'::text));
-- Add CASCADE foreign keys for belt_exam_notifications if missing
ALTER TABLE public.belt_exam_notifications
  DROP CONSTRAINT IF EXISTS belt_exam_notifications_student_id_fkey;
ALTER TABLE public.belt_exam_notifications
  ADD CONSTRAINT belt_exam_notifications_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE public.belt_exam_notifications
  DROP CONSTRAINT IF EXISTS belt_exam_notifications_event_id_fkey;
ALTER TABLE public.belt_exam_notifications
  ADD CONSTRAINT belt_exam_notifications_event_id_fkey
  FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE SET NULL;
-- Ensure student_programs has CASCADE
ALTER TABLE public.student_programs
  DROP CONSTRAINT IF EXISTS student_programs_student_id_fkey;
ALTER TABLE public.student_programs
  ADD CONSTRAINT student_programs_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- Ensure student_discipline_progress has CASCADE
ALTER TABLE public.student_discipline_progress
  DROP CONSTRAINT IF EXISTS student_discipline_progress_student_id_fkey;
ALTER TABLE public.student_discipline_progress
  ADD CONSTRAINT student_discipline_progress_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- Ensure student_progress has CASCADE  
ALTER TABLE public.student_progress
  DROP CONSTRAINT IF EXISTS student_progress_student_id_fkey;
ALTER TABLE public.student_progress
  ADD CONSTRAINT student_progress_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- Ensure promotion_history has CASCADE
ALTER TABLE public.promotion_history
  DROP CONSTRAINT IF EXISTS promotion_history_student_id_fkey;
ALTER TABLE public.promotion_history
  ADD CONSTRAINT promotion_history_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- Ensure fees has CASCADE
ALTER TABLE public.fees
  DROP CONSTRAINT IF EXISTS fees_student_id_fkey;
ALTER TABLE public.fees
  ADD CONSTRAINT fees_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- Ensure attendance has CASCADE
ALTER TABLE public.attendance
  DROP CONSTRAINT IF EXISTS attendance_student_id_fkey;
ALTER TABLE public.attendance
  ADD CONSTRAINT attendance_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- Ensure competition_registrations has CASCADE
ALTER TABLE public.competition_registrations
  DROP CONSTRAINT IF EXISTS competition_registrations_student_id_fkey;
ALTER TABLE public.competition_registrations
  ADD CONSTRAINT competition_registrations_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- Ensure competition_certificates has CASCADE
ALTER TABLE public.competition_certificates
  DROP CONSTRAINT IF EXISTS competition_certificates_student_id_fkey;
ALTER TABLE public.competition_certificates
  ADD CONSTRAINT competition_certificates_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
-- Ensure student_portal_accounts has CASCADE
ALTER TABLE public.student_portal_accounts
  DROP CONSTRAINT IF EXISTS student_portal_accounts_student_id_fkey;
ALTER TABLE public.student_portal_accounts
  ADD CONSTRAINT student_portal_accounts_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


-- =====================================================================
-- Migration: 20260309044832_32ec77f2-6202-46db-925d-e8e64adb5ccd.sql
-- =====================================================================
-- Drop restrictive policies and recreate as PERMISSIVE so they can actually grant access
DROP POLICY IF EXISTS "admin_manage_student_programs" ON public.student_programs;
DROP POLICY IF EXISTS "admin_users_manage_student_programs" ON public.student_programs;
DROP POLICY IF EXISTS "student_read_own_programs" ON public.student_programs;
-- Recreate as PERMISSIVE (default) policies
CREATE POLICY "admin_manage_student_programs" ON public.student_programs
  FOR ALL TO authenticated
  USING (public.has_role('admin'::text))
  WITH CHECK (public.has_role('admin'::text));
CREATE POLICY "admin_users_manage_student_programs" ON public.student_programs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_read_own_programs" ON public.student_programs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = student_programs.student_id));


-- =====================================================================
-- Migration: 20260309045841_576fdedd-b815-4f64-9427-c46eb3098374.sql
-- =====================================================================
-- =====================================================
-- MASTER FIX: Convert ALL restrictive RLS policies to PERMISSIVE
-- =====================================================

-- ==================== academy_settings ====================
DROP POLICY IF EXISTS "admin_manage_settings" ON public.academy_settings;
DROP POLICY IF EXISTS "admin_users_manage_settings" ON public.academy_settings;
DROP POLICY IF EXISTS "public_read_settings" ON public.academy_settings;
CREATE POLICY "admin_manage_settings" ON public.academy_settings FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_settings" ON public.academy_settings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "public_read_settings" ON public.academy_settings FOR SELECT TO authenticated USING (true);
-- ==================== admin_users ====================
DROP POLICY IF EXISTS "Admin can read own admin record" ON public.admin_users;
CREATE POLICY "Admin can read own admin record" ON public.admin_users FOR SELECT TO authenticated
  USING (email = auth.email());
-- ==================== announcements ====================
DROP POLICY IF EXISTS "admin_manage_announcements" ON public.announcements;
DROP POLICY IF EXISTS "admin_users_manage_announcements" ON public.announcements;
DROP POLICY IF EXISTS "authenticated_read_active_announcements" ON public.announcements;
CREATE POLICY "admin_manage_announcements" ON public.announcements FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_announcements" ON public.announcements FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "authenticated_read_active_announcements" ON public.announcements FOR SELECT TO authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));
-- ==================== attendance ====================
DROP POLICY IF EXISTS "admin_manage_attendance" ON public.attendance;
DROP POLICY IF EXISTS "admin_users_manage_attendance" ON public.attendance;
DROP POLICY IF EXISTS "student_read_own_attendance" ON public.attendance;
CREATE POLICY "admin_manage_attendance" ON public.attendance FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_attendance" ON public.attendance FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_read_own_attendance" ON public.attendance FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = attendance.student_id));
-- ==================== audit_logs ====================
DROP POLICY IF EXISTS "Admin roles view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admin roles view audit logs" ON public.audit_logs FOR SELECT TO authenticated
  USING (has_role('admin'::text));
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
-- ==================== belt_exam_notifications ====================
DROP POLICY IF EXISTS "admin_manage_belt_exam_notifications" ON public.belt_exam_notifications;
DROP POLICY IF EXISTS "admin_role_manage_belt_exam_notifications" ON public.belt_exam_notifications;
DROP POLICY IF EXISTS "student_read_own_belt_exam_notifications" ON public.belt_exam_notifications;
DROP POLICY IF EXISTS "student_update_own_belt_exam_notifications" ON public.belt_exam_notifications;
CREATE POLICY "admin_manage_belt_exam_notifications" ON public.belt_exam_notifications FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "admin_role_manage_belt_exam_notifications" ON public.belt_exam_notifications FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "student_read_own_belt_exam_notifications" ON public.belt_exam_notifications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = belt_exam_notifications.student_id));
CREATE POLICY "student_update_own_belt_exam_notifications" ON public.belt_exam_notifications FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = belt_exam_notifications.student_id))
  WITH CHECK (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = belt_exam_notifications.student_id));
-- ==================== belt_levels ====================
DROP POLICY IF EXISTS "Admin roles delete belts" ON public.belt_levels;
DROP POLICY IF EXISTS "Admin roles insert belts" ON public.belt_levels;
DROP POLICY IF EXISTS "Admin roles select belts" ON public.belt_levels;
DROP POLICY IF EXISTS "Admin roles update belts" ON public.belt_levels;
DROP POLICY IF EXISTS "Admins manage belt levels" ON public.belt_levels;
DROP POLICY IF EXISTS "admin_users_manage_belt_levels" ON public.belt_levels;
DROP POLICY IF EXISTS "student_read_belt_levels" ON public.belt_levels;
CREATE POLICY "admin_role_manage_belt_levels" ON public.belt_levels FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_belt_levels" ON public.belt_levels FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_read_belt_levels" ON public.belt_levels FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid()));
-- ==================== blogs ====================
DROP POLICY IF EXISTS "Admin roles manage blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins can do everything on blogs" ON public.blogs;
DROP POLICY IF EXISTS "Public can read blogs" ON public.blogs;
DROP POLICY IF EXISTS "public_select_blogs" ON public.blogs;
DROP POLICY IF EXISTS "sitemap_reads_blogs" ON public.blogs;
CREATE POLICY "admin_role_manage_blogs" ON public.blogs FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_blogs" ON public.blogs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "public_read_blogs" ON public.blogs FOR SELECT USING (true);
-- ==================== competition_certificates ====================
DROP POLICY IF EXISTS "admin_manage_certificates" ON public.competition_certificates;
DROP POLICY IF EXISTS "admin_users_manage_comp_certificates" ON public.competition_certificates;
DROP POLICY IF EXISTS "student_view_certificates" ON public.competition_certificates;
CREATE POLICY "admin_manage_certificates" ON public.competition_certificates FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_comp_certificates" ON public.competition_certificates FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_view_certificates" ON public.competition_certificates FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = competition_certificates.student_id));
-- ==================== competition_registrations ====================
DROP POLICY IF EXISTS "admin_manage_registrations" ON public.competition_registrations;
DROP POLICY IF EXISTS "admin_users_manage_comp_registrations" ON public.competition_registrations;
DROP POLICY IF EXISTS "student_register" ON public.competition_registrations;
DROP POLICY IF EXISTS "student_view_registrations" ON public.competition_registrations;
CREATE POLICY "admin_manage_registrations" ON public.competition_registrations FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_comp_registrations" ON public.competition_registrations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_register" ON public.competition_registrations FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = competition_registrations.student_id));
CREATE POLICY "student_view_registrations" ON public.competition_registrations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = competition_registrations.student_id));
-- ==================== competitions ====================
DROP POLICY IF EXISTS "admin_manage_competitions" ON public.competitions;
DROP POLICY IF EXISTS "admin_users_manage_competitions" ON public.competitions;
DROP POLICY IF EXISTS "public_read_competitions" ON public.competitions;
CREATE POLICY "admin_manage_competitions" ON public.competitions FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_competitions" ON public.competitions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "public_read_competitions" ON public.competitions FOR SELECT USING (true);
-- ==================== discipline_levels ====================
DROP POLICY IF EXISTS "Admin roles can manage discipline levels" ON public.discipline_levels;
DROP POLICY IF EXISTS "Public can read discipline levels" ON public.discipline_levels;
CREATE POLICY "admin_manage_discipline_levels" ON public.discipline_levels FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_discipline_levels" ON public.discipline_levels FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "public_read_discipline_levels" ON public.discipline_levels FOR SELECT USING (true);
-- ==================== disciplines ====================
DROP POLICY IF EXISTS "admin_manage_disciplines" ON public.disciplines;
DROP POLICY IF EXISTS "admin_role_manage_disciplines" ON public.disciplines;
DROP POLICY IF EXISTS "public_read_disciplines" ON public.disciplines;
CREATE POLICY "admin_manage_disciplines" ON public.disciplines FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "admin_role_manage_disciplines" ON public.disciplines FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "public_read_disciplines" ON public.disciplines FOR SELECT USING (true);
-- ==================== enrollment_requests ====================
DROP POLICY IF EXISTS "admin_manage_enrollment" ON public.enrollment_requests;
DROP POLICY IF EXISTS "admin_users_manage_enrollment" ON public.enrollment_requests;
DROP POLICY IF EXISTS "public_submit_enrollment" ON public.enrollment_requests;
CREATE POLICY "admin_manage_enrollment" ON public.enrollment_requests FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_enrollment" ON public.enrollment_requests FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "public_submit_enrollment" ON public.enrollment_requests FOR INSERT WITH CHECK (true);
-- ==================== events ====================
DROP POLICY IF EXISTS "Admin roles manage events" ON public.events;
DROP POLICY IF EXISTS "Admins can access and modify all events (standard)" ON public.events;
DROP POLICY IF EXISTS "Public can read events" ON public.events;
DROP POLICY IF EXISTS "public_select_events" ON public.events;
DROP POLICY IF EXISTS "sitemap_reads_events" ON public.events;
CREATE POLICY "admin_role_manage_events" ON public.events FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_events" ON public.events FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "public_read_events" ON public.events FOR SELECT USING (true);
-- ==================== fees ====================
DROP POLICY IF EXISTS "Admin roles delete fees" ON public.fees;
DROP POLICY IF EXISTS "Admin roles insert fees" ON public.fees;
DROP POLICY IF EXISTS "Admin roles select fees" ON public.fees;
DROP POLICY IF EXISTS "Admin roles update fees" ON public.fees;
DROP POLICY IF EXISTS "Verified admins can delete fees" ON public.fees;
DROP POLICY IF EXISTS "Verified admins can insert fees" ON public.fees;
DROP POLICY IF EXISTS "Verified admins can update fees" ON public.fees;
DROP POLICY IF EXISTS "Verified admins can view all fees" ON public.fees;
DROP POLICY IF EXISTS "student_read_own_fees" ON public.fees;
CREATE POLICY "admin_role_manage_fees" ON public.fees FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_fees" ON public.fees FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_read_own_fees" ON public.fees FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = fees.student_id));
-- ==================== gallery_images ====================
DROP POLICY IF EXISTS "Admin roles manage gallery" ON public.gallery_images;
DROP POLICY IF EXISTS "Admins can do everything on gallery_images" ON public.gallery_images;
DROP POLICY IF EXISTS "Admins can insert gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Admins manage gallery" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow logged-in users to insert" ON public.gallery_images;
DROP POLICY IF EXISTS "Anyone can select gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Authenticated insert" ON public.gallery_images;
DROP POLICY IF EXISTS "Public can read gallery images" ON public.gallery_images;
CREATE POLICY "admin_role_manage_gallery" ON public.gallery_images FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_gallery" ON public.gallery_images FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "public_read_gallery" ON public.gallery_images FOR SELECT USING (true);
-- ==================== news ====================
DROP POLICY IF EXISTS "Admin roles manage news" ON public.news;
DROP POLICY IF EXISTS "Admins can do everything on news" ON public.news;
DROP POLICY IF EXISTS "Public can read news" ON public.news;
DROP POLICY IF EXISTS "public_select_news" ON public.news;
DROP POLICY IF EXISTS "sitemap_reads_news" ON public.news;
CREATE POLICY "admin_role_manage_news" ON public.news FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_news" ON public.news FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "public_read_news" ON public.news FOR SELECT USING (true);
-- ==================== program_testimonials ====================
DROP POLICY IF EXISTS "Admin roles manage testimonials" ON public.program_testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.program_testimonials;
DROP POLICY IF EXISTS "Public can read published testimonials" ON public.program_testimonials;
CREATE POLICY "admin_role_manage_testimonials" ON public.program_testimonials FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_testimonials" ON public.program_testimonials FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "public_read_published_testimonials" ON public.program_testimonials FOR SELECT USING (is_published = true);
-- ==================== promotion_history ====================
DROP POLICY IF EXISTS "Admin roles can delete promotion history" ON public.promotion_history;
DROP POLICY IF EXISTS "Admin roles can insert promotion history" ON public.promotion_history;
DROP POLICY IF EXISTS "Admin roles can view promotion history" ON public.promotion_history;
DROP POLICY IF EXISTS "admin_users_manage_promotion_history" ON public.promotion_history;
DROP POLICY IF EXISTS "student_read_own_promotions" ON public.promotion_history;
CREATE POLICY "admin_role_manage_promotion_history" ON public.promotion_history FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_promotion_history" ON public.promotion_history FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_read_own_promotions" ON public.promotion_history FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = promotion_history.student_id));
-- ==================== sensitive_data_audit ====================
DROP POLICY IF EXISTS "Admin roles view sensitive logs" ON public.sensitive_data_audit;
DROP POLICY IF EXISTS "Allow audit logging" ON public.sensitive_data_audit;
CREATE POLICY "admin_view_sensitive_logs" ON public.sensitive_data_audit FOR SELECT TO authenticated
  USING (has_role('admin'::text));
CREATE POLICY "allow_audit_logging" ON public.sensitive_data_audit FOR INSERT WITH CHECK (true);
-- ==================== student_discipline_progress ====================
DROP POLICY IF EXISTS "Admin roles can manage student discipline progress" ON public.student_discipline_progress;
DROP POLICY IF EXISTS "admin_users_manage_discipline_progress" ON public.student_discipline_progress;
DROP POLICY IF EXISTS "student_read_own_discipline_progress" ON public.student_discipline_progress;
CREATE POLICY "admin_role_manage_discipline_progress" ON public.student_discipline_progress FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_discipline_progress" ON public.student_discipline_progress FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_read_own_discipline_progress" ON public.student_discipline_progress FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = student_discipline_progress.student_id));
-- ==================== student_portal_accounts ====================
DROP POLICY IF EXISTS "admin_manage_portal_accounts" ON public.student_portal_accounts;
DROP POLICY IF EXISTS "admin_users_manage_portal_accounts" ON public.student_portal_accounts;
DROP POLICY IF EXISTS "student_read_own_account" ON public.student_portal_accounts;
CREATE POLICY "admin_manage_portal_accounts" ON public.student_portal_accounts FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_portal_accounts" ON public.student_portal_accounts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_read_own_account" ON public.student_portal_accounts FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());
-- ==================== student_programs ====================
DROP POLICY IF EXISTS "admin_manage_student_programs" ON public.student_programs;
DROP POLICY IF EXISTS "admin_users_manage_student_programs" ON public.student_programs;
DROP POLICY IF EXISTS "student_read_own_programs" ON public.student_programs;
CREATE POLICY "admin_manage_student_programs" ON public.student_programs FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_student_programs" ON public.student_programs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_read_own_programs" ON public.student_programs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = student_programs.student_id));
-- ==================== student_progress ====================
DROP POLICY IF EXISTS "Admin roles delete student progress" ON public.student_progress;
DROP POLICY IF EXISTS "Admin roles insert student progress" ON public.student_progress;
DROP POLICY IF EXISTS "Admin roles read student progress" ON public.student_progress;
DROP POLICY IF EXISTS "Admin roles update student progress" ON public.student_progress;
DROP POLICY IF EXISTS "Instructor evidence uploads" ON public.student_progress;
DROP POLICY IF EXISTS "admin_users_manage_student_progress" ON public.student_progress;
DROP POLICY IF EXISTS "student_read_own_progress" ON public.student_progress;
CREATE POLICY "admin_role_manage_student_progress" ON public.student_progress FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_student_progress" ON public.student_progress FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "instructor_evidence_uploads" ON public.student_progress FOR UPDATE TO authenticated
  USING (has_role('instructor'::text))
  WITH CHECK (has_role('instructor'::text) AND is_progress_status_unchanged(id, status));
CREATE POLICY "student_read_own_progress" ON public.student_progress FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = student_progress.student_id));
-- ==================== students ====================
DROP POLICY IF EXISTS "Admin roles manage students" ON public.students;
DROP POLICY IF EXISTS "Admins can do everything on students" ON public.students;
DROP POLICY IF EXISTS "student_read_own_profile" ON public.students;
DROP POLICY IF EXISTS "student_update_own_profile" ON public.students;
CREATE POLICY "admin_role_manage_students" ON public.students FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "admin_users_manage_students" ON public.students FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.email()));
CREATE POLICY "student_read_own_profile" ON public.students FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = students.id));
CREATE POLICY "student_update_own_profile" ON public.students FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = students.id))
  WITH CHECK (EXISTS (SELECT 1 FROM student_portal_accounts spa WHERE spa.auth_user_id = auth.uid() AND spa.student_id = students.id));
-- ==================== user_roles ====================
DROP POLICY IF EXISTS "Admins manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "admins_manage_roles" ON public.user_roles FOR ALL TO authenticated
  USING (has_role('admin'::text)) WITH CHECK (has_role('admin'::text));
CREATE POLICY "users_read_own_roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());


-- =====================================================================
-- Migration: 20260309045904_4c7af800-f810-4085-9222-2494787be838.sql
-- =====================================================================
-- Publish tables for Supabase Realtime (ignore if already added)
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.student_programs; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.promotion_history; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.student_progress; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.student_discipline_progress; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.belt_levels; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.students; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.fees; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.events; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.blogs; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.news; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery_images; EXCEPTION WHEN duplicate_object THEN NULL; END;

  -- Ensure unique constraint on student_programs for upsert support
  BEGIN
    ALTER TABLE public.student_programs ADD CONSTRAINT student_programs_student_id_program_name_key UNIQUE (student_id, program_name);
  EXCEPTION WHEN duplicate_table THEN NULL;
  END;
END $$;


-- =====================================================================
-- Migration: 20260402132147_83918f56-7b5d-47bb-b758-3d1a327900e1.sql
-- =====================================================================
-- Drop attendance table and related trigger/function
DROP TRIGGER IF EXISTS prevent_status_change ON public.attendance;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP FUNCTION IF EXISTS public.prevent_attendance_status_change();


-- =====================================================================
-- Migration: 20260404120000_add_linked_student_to_enrollment_requests.sql
-- =====================================================================
ALTER TABLE public.enrollment_requests
  ADD COLUMN IF NOT EXISTS linked_student_id uuid REFERENCES public.students(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_linked_student_id
  ON public.enrollment_requests(linked_student_id);
UPDATE public.enrollment_requests er
SET linked_student_id = s.id
FROM public.students s
WHERE er.linked_student_id IS NULL
  AND er.status = 'approved'
  AND er.aadhar_number IS NOT NULL
  AND er.aadhar_number = s.aadhar_number;


-- =====================================================================
-- Migration: 20260404142000_create_announcement_delivery_logs.sql
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.announcement_delivery_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_type text NOT NULL CHECK (announcement_type IN ('event', 'competition')),
  announcement_title text NOT NULL,
  total_recipients integer NOT NULL DEFAULT 0,
  sent_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  triggered_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_announcement_delivery_logs_created_at
  ON public.announcement_delivery_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcement_delivery_logs_type_created_at
  ON public.announcement_delivery_logs(announcement_type, created_at DESC);
ALTER TABLE public.announcement_delivery_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_read_delivery_logs" ON public.announcement_delivery_logs;
CREATE POLICY "admin_read_delivery_logs"
  ON public.announcement_delivery_logs
  FOR SELECT
  TO authenticated
  USING (has_role('admin'::text));
DROP POLICY IF EXISTS "admin_insert_delivery_logs" ON public.announcement_delivery_logs;
CREATE POLICY "admin_insert_delivery_logs"
  ON public.announcement_delivery_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role('admin'::text));


-- =====================================================================
-- Migration: 20260404190000_add_parent_email_to_enrollment_and_students.sql
-- =====================================================================
ALTER TABLE public.enrollment_requests
ADD COLUMN IF NOT EXISTS parent_email text;
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS parent_email text;
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_parent_email
  ON public.enrollment_requests(parent_email);
CREATE INDEX IF NOT EXISTS idx_students_parent_email
  ON public.students(parent_email);
-- Backfill students.parent_email from latest linked enrollment request when available.
WITH latest_parent_email AS (
  SELECT DISTINCT ON (linked_student_id)
    linked_student_id,
    NULLIF(TRIM(parent_email), '') AS parent_email
  FROM public.enrollment_requests
  WHERE linked_student_id IS NOT NULL
    AND parent_email IS NOT NULL
  ORDER BY linked_student_id, created_at DESC
)
UPDATE public.students s
SET parent_email = lpe.parent_email
FROM latest_parent_email lpe
WHERE s.id = lpe.linked_student_id
  AND lpe.parent_email IS NOT NULL
  AND (s.parent_email IS NULL OR TRIM(s.parent_email) = '');


-- =====================================================================
-- Migration: 20260409113000_enrollment_aadhar_guardrails.sql
-- =====================================================================
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


-- =====================================================================
-- Migration: 20260409124500_enrollment_email_idempotency_and_aadhar_cleanup.sql
-- =====================================================================
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


-- =====================================================================
-- Migration: 20260409143000_push_notifications_pipeline.sql
-- =====================================================================
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


COMMIT;