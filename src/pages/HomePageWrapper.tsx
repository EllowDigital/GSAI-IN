import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Index from './Index';

const ADMIN_EMAIL = 'ghatakgsai@gmail.com';

const HomePageWrapper = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectIfAdmin = (email?: string | null) => {
      if (email === ADMIN_EMAIL) {
        console.log('Admin session detected, redirecting to dashboard.');
        navigate('/admin/dashboard', { replace: true });
      }
    };

    const checkInitialSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error.message);
        return;
      }
      const email = data?.session?.user?.email;
      redirectIfAdmin(email);
    };

    checkInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          redirectIfAdmin(session?.user?.email);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  return <Index />;
};

export default HomePageWrapper;
