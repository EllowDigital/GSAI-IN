
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
