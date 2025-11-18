
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
