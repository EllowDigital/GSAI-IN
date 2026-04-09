
-- Enable Row Level Security if not already enabled
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

-- Grant full access to admin users, matching users with their email
-- Assumes your app authenticates Supabase Auth users, and that
-- admin emails are listed in the admin_users table.

-- Remove any conflicting/old policies if needed
DROP POLICY IF EXISTS "Admin can manage fees" ON public.fees;

-- Allow admin users (whose email is present in admin_users) to do everything
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
