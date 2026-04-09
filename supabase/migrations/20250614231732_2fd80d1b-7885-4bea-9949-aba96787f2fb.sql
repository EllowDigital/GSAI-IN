
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
