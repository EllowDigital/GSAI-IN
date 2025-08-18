import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import usePageViews from '../hooks/usePageViews';
import Index from './Index';

const ADMIN_EMAIL = 'ghatakgsai@gmail.com';

const HomePageWrapper: React.FC = () => {
  const navigate = useNavigate();
  
  // Track page views and performance
  usePageViews();

  // Helper: Check and redirect if user is admin
  const redirectIfAdmin = (email?: string | null) => {
    if (email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      navigate('/admin/dashboard', { replace: true });
    }
  };

  useEffect(() => {
    // Enhanced auth session check with better error handling
    const checkInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        // Handle refresh token errors gracefully
        if (error?.message?.includes('refresh_token_not_found') || 
            error?.message?.includes('Invalid Refresh Token')) {
          // Clear potentially corrupted session
          await supabase.auth.signOut();
          return;
        }
        
        if (error) {
          console.warn('Auth session check error:', error.message);
          return;
        }
        
        const email = data?.session?.user?.email;
        redirectIfAdmin(email);
      } catch (err) {
        // Enhanced error logging for development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Auth session check failed:', err);
        }
      }
    };

    checkInitialSession();

    // Listen for auth state changes with better error handling
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        try {
          if (event === 'SIGNED_IN') {
            const email = session?.user?.email;
            redirectIfAdmin(email);
          } else if (event === 'TOKEN_REFRESHED') {
            // Handle successful token refresh
            const email = session?.user?.email;
            redirectIfAdmin(email);
          } else if (event === 'SIGNED_OUT') {
            // Ensure we're on the correct page after sign out
            if (window.location.pathname.startsWith('/admin')) {
              navigate('/', { replace: true });
            }
          }
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Auth state change error:', err);
          }
        }
      }
    );

    // Cleanup function
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  return <Index />;
};

export default HomePageWrapper;
