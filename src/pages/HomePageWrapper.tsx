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
      console.info('✅ Admin detected — redirecting to /admin/dashboard');
      navigate('/admin/dashboard', { replace: true });
    }
  };

  useEffect(() => {
    // On initial mount: check session
    const checkInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ Failed to get session:', error.message);
          return;
        }
        const email = data?.session?.user?.email;
        redirectIfAdmin(email);
      } catch (err) {
        console.error('❌ Unexpected error while checking session:', err);
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
