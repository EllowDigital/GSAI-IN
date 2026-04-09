
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
