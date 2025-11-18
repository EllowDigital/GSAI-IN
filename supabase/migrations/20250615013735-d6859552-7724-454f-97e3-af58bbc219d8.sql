
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

