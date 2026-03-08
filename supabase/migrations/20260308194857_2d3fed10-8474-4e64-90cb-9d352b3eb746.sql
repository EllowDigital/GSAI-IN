
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
