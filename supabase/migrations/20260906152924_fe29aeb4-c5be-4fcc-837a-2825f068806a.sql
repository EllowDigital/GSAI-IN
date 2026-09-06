CREATE OR REPLACE FUNCTION public.is_academy_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','super_admin','staff','finance_admin','content_admin','instructor')),
    false
  ) OR EXISTS (SELECT 1 FROM public.admin_users au WHERE au.email = auth.email());
$$;

DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='storage' AND tablename='objects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', p.policyname);
  END LOOP;
END $$;

CREATE POLICY "Public read public buckets"
ON storage.objects FOR SELECT
USING (bucket_id IN ('gallery','events','blog-images','news-images','certificates','progress-media','student-avatars'));

CREATE POLICY "Admins read fee receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'fees' AND public.is_academy_admin());

CREATE POLICY "Admins insert academy files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('gallery','events','fees','blog-images','news-images','certificates','progress-media','student-avatars')
  AND public.is_academy_admin()
);

CREATE POLICY "Admins update academy files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('gallery','events','fees','blog-images','news-images','certificates','progress-media','student-avatars')
  AND public.is_academy_admin()
)
WITH CHECK (
  bucket_id IN ('gallery','events','fees','blog-images','news-images','certificates','progress-media','student-avatars')
  AND public.is_academy_admin()
);

CREATE POLICY "Admins delete academy files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id IN ('gallery','events','fees','blog-images','news-images','certificates','progress-media','student-avatars')
  AND public.is_academy_admin()
);

DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='sensitive_data_audit' AND cmd IN ('INSERT','ALL')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.sensitive_data_audit', p.policyname);
  END LOOP;
END $$;

REVOKE INSERT, UPDATE, DELETE ON public.sensitive_data_audit FROM anon, authenticated;
GRANT ALL ON public.sensitive_data_audit TO service_role;