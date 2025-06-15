import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Hook: Handles checking if the current user is in the admin_users table for RLS operations
export function useAdminRLS() {
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isAdminInTable, setIsAdminInTable] = useState<boolean | null>(null);
  const [checkingAdminEntry, setCheckingAdminEntry] = useState<boolean>(false);
  const [rlsError, setRlsError] = useState<string | null>(null);

  useEffect(() => {
    setCheckingAdminEntry(true);
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userEmail = sessionData?.session?.user?.email;
      setAdminEmail(userEmail ?? null);

      if (userEmail) {
        const { data: foundUser } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', userEmail)
          .maybeSingle();
        setIsAdminInTable(!!foundUser);
        if (!foundUser) {
          setRlsError(
            `Your email (${userEmail}) is NOT present in the admin_users table. 
            Please add your admin email to the "admin_users" table in Supabase Dashboard.`
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
