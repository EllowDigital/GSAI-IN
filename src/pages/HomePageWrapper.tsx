import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Index from './Index';

const ADMIN_EMAIL = 'ghatakgsai@gmail.com';

const HomePageWrapper: React.FC = () => {
  const navigate = useNavigate();

  // Helper: Check and redirect if user is admin
  const redirectIfAdmin = (email?: string | null) => {
    if (email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      navigate('/admin/dashboard', { replace: true });
    }
  };

  useEffect(() => {
    // On initial mount: check session
    const checkInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) return;
        const email = data?.session?.user?.email;
        redirectIfAdmin(email);
      } catch (err) {
        // Silent error handling
      }
    };

    checkInitialSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          const email = session?.user?.email;
          redirectIfAdmin(email);
        }
      }
    );

    // Cleanup
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  return <Index />;
};

export default HomePageWrapper;
