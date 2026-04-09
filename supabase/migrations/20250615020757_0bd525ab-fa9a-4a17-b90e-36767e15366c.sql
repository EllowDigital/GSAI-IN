
-- Remove ALL existing policies on fees
DROP POLICY IF EXISTS "Admin can manage fees" ON public.fees;
DROP POLICY IF EXISTS "Admin can insert fees" ON public.fees;
DROP POLICY IF EXISTS "Admin can update fees" ON public.fees;
DROP POLICY IF EXISTS "Admin can delete fees" ON public.fees;
DROP POLICY IF EXISTS "Admin can select fees" ON public.fees;

-- This is a single new policy: allow all access IF the user's email is in admin_users.
CREATE POLICY "Admin can manage fees"
    ON public.fees
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users WHERE admin_users.email = current_setting('request.jwt.claim.email', true)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users WHERE admin_users.email = current_setting('request.jwt.claim.email', true)
        )
    );
