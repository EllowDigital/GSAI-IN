/**
 * Admin Configuration
 * 
 * Security-focused admin management with database-backed authorization.
 * This replaces hardcoded admin emails with proper database verification.
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if the current authenticated user is an admin
 * by verifying their presence in the admin_users table
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userEmail = session?.session?.user?.email;
    
    if (!userEmail) return false;

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', userEmail)
      .maybeSingle();

    return !!adminUser;
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
    const userEmail = session?.session?.user?.email ?? null;
    
    if (!userEmail) {
      return { isAdmin: false, email: null };
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', userEmail)
      .maybeSingle();

    return {
      isAdmin: !!adminUser,
      email: userEmail
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