
-- Allow anyone (including unauthenticated users) to select (read) events
CREATE POLICY "Public can read events"
ON public.events
FOR SELECT
TO public
USING (true);
