import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import usePageViews from '../hooks/usePageViews';
import Index from './Index';
import { motion } from 'framer-motion';

const ADMIN_EMAIL = 'ghatakgsai@gmail.com';

const HomePageWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

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
        if (
          error?.message?.includes('refresh_token_not_found') ||
          error?.message?.includes('Invalid Refresh Token')
        ) {
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
      } finally {
        // Add a small delay to prevent flash of loading state
        setTimeout(() => setIsLoading(false), 800);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-24 h-24 mb-8">
            <motion.div
              className="absolute inset-0 border-4 border-t-yellow-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 border-4 border-t-transparent border-r-red-600 border-b-transparent border-l-transparent rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white font-bold text-xl tracking-widest uppercase"
          >
            Loading
          </motion.h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dark bg-black min-h-screen">
      <Index />
    </div>
  );
};

export default HomePageWrapper;
