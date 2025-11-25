import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import usePageViews from '../hooks/usePageViews';
import Index from './Index';
import { motion } from 'framer-motion';

const ADMIN_EMAIL = 'ghatakgsai@gmail.com';

const HomePageWrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Track page views and performance
  usePageViews();

  // Helper: Check and redirect if user is admin
  const redirectIfAdmin = (email?: string | null) => {
    if (email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      navigate('/admin/dashboard', { replace: true });
    }
  };

  // Handle hash scrolling after loading
  useEffect(() => {
    if (!isLoading && location.hash) {
      const timer = setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          const offsetTop =
            element.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth',
          });
        }
      }, 500); // Small delay to ensure content is rendered
      return () => clearTimeout(timer);
    }
  }, [isLoading, location.hash]);

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

  // Show in-app success banner when redirected from contact form
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  useEffect(() => {
    try {
      const search = new URLSearchParams(window.location.search);
      if (search.get('success') === '1') {
        setShowSuccessBanner(true);
        // remove query param without reloading
        search.delete('success');
        const newSearch = search.toString();
        const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}${window.location.hash}`;
        window.history.replaceState({}, document.title, newUrl);
      }
    } catch (err) {
      // ignore
    }
  }, []);

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
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-2 border-4 border-t-transparent border-r-red-600 border-b-transparent border-l-transparent rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
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
      {showSuccessBanner && (
        <div className="fixed top-4 left-0 right-0 z-[9999] px-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 rounded-xl border border-yellow-500/20 bg-[#0a0a0a]/95 p-4 shadow-lg shadow-yellow-500/10 backdrop-blur-md">
            <div className="flex items-center gap-3 text-sm sm:text-base text-white">
              <div className="p-2 bg-yellow-500/10 rounded-full">
                <svg
                  className="w-5 h-5 text-yellow-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white">Message sent</span>
                <span className="text-gray-400 text-xs sm:text-sm">
                  Thanks — we'll get back to you soon.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSuccessBanner(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Dismiss success banner"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
      <Index />
    </div>
  );
};

export default HomePageWrapper;
