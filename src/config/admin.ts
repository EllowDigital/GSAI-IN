/**
 * Admin Configuration
 *
 * Security-focused admin management with database-backed authorization.
 * This replaces hardcoded admin emails with proper database verification.
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if the current authenticated user is an admin
 * by verifying their presence in the user_roles table
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    if (!userId) return false;

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (error) return false;

    return !!data;
  } catch (error) {
    return false;
  }
}

/**
 * Gets the current user's admin status and email
 */
export async function getCurrentUserAdminInfo(): Promise<{
  isAdmin: boolean;
  email: string | null;
}> {
  try {
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;
    const userEmail = user?.email ?? null;
    const userId = user?.id ?? null;

    if (!userId) {
      return { isAdmin: false, email: null };
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    return {
      isAdmin: !error && !!data,
      email: userEmail,
    };
  } catch (error) {
    return { isAdmin: false, email: null };
  }
}

/**
 * Validates that the current user can perform admin operations
 * Throws an error if not authorized
 */
export async function requireAdminAccess(): Promise<void> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }
}
