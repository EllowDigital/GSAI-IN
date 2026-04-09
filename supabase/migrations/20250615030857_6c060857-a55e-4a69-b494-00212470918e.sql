
-- Remove all existing policies on fees
DROP POLICY IF EXISTS "Admin can manage fees" ON public.fees;
DROP POLICY IF EXISTS "Admin can insert fees" ON public.fees;
DROP POLICY IF EXISTS "Admin can update fees" ON public.fees;
DROP POLICY IF EXISTS "Admin can delete fees" ON public.fees;
DROP POLICY IF EXISTS "Admin can select fees" ON public.fees;

-- Allow ANYONE (no login required) to select from the fees table
CREATE POLICY "Anyone can select fees"
    ON public.fees
    FOR SELECT
    USING (true);

-- Allow ANYONE to insert into the fees table
CREATE POLICY "Anyone can insert fees"
    ON public.fees
    FOR INSERT
    WITH CHECK (true);

-- Allow ANYONE to update any row in the fees table
CREATE POLICY "Anyone can update fees"
    ON public.fees
    FOR UPDATE
    USING (true);

-- Allow ANYONE to delete any row in the fees table
CREATE POLICY "Anyone can delete fees"
    ON public.fees
    FOR DELETE
    USING (true);
