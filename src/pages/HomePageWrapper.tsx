
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Index from './Index';

// This is a hardcoded value from AdminAuthProvider.tsx
// In a real app, this should probably come from a shared config.
const ADMIN_EMAIL = "ghatakgsai@gmail.com";

const HomePageWrapper = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && session.user.email === ADMIN_EMAIL) {
        console.log("Admin session found on homepage, redirecting to dashboard.");
        navigate('/admin/dashboard', { replace: true });
      }
    };

    checkSessionAndRedirect();

    // Also listen for auth changes in case user logs in in another tab
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user.email === ADMIN_EMAIL) {
        console.log("Admin signed in, redirecting to dashboard.");
        navigate('/admin/dashboard', { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return <Index />;
};

export default HomePageWrapper;
