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
-- - "Public can read gallery images"