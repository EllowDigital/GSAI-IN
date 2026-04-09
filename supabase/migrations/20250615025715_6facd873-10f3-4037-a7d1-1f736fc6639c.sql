
-- 1. Create a new storage bucket for storing fee receipts/files
insert into storage.buckets (id, name, public) values ('fees', 'fees', true);

-- 2. Add a column in `fees` table to store reference to file URL
alter table public.fees add column if not exists receipt_url text;
