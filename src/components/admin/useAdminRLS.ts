import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Hook: Handles checking if the current user has the admin role for RLS protections
export function useAdminRLS() {
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isAdminInTable, setIsAdminInTable] = useState<boolean | null>(null);
  // Start as true since we immediately check on mount
  const [checkingAdminEntry, setCheckingAdminEntry] = useState<boolean>(true);
  const [rlsError, setRlsError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      const userEmail = user?.email ?? null;
      const userId = user?.id ?? null;
      setAdminEmail(userEmail);

      if (userId) {
        const { data: roleEntry, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();

        setIsAdminInTable(!error && !!roleEntry);

        if (error || !roleEntry) {
          setRlsError(
            `Your account is missing the admin role. Visit the new user_roles table and add role "admin" for ${userEmail ?? 'this user'}.`
          );
        } else {
          setRlsError(null);
        }
      } else {
        setIsAdminInTable(null);
      }
      setCheckingAdminEntry(false);
    })();
  }, []);

  // Only TRUE if user is found and no error (RLS allow)
  function canSubmitFeeEdits() {
    return isAdminInTable === true && !rlsError;
  }

  return {
    adminEmail,
    isAdminInTable,
    rlsError,
    checkingAdminEntry,
    canSubmitFeeEdits,
  };
}
