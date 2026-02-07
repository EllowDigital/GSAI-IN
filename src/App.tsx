import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  lazy,
  Suspense,
} from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeSupabaseOptimization } from '@/utils/supabaseOptimization';
import { performanceMonitor } from '@/utils/performance';

import Preloader from './components/Preloader';
import OfflineBanner from './components/OfflineBanner';
import PWAInstallToast from './components/PWAInstallToast';
import EnhancedErrorBoundary from './components/EnhancedErrorBoundary';
import PageTracker from './components/PageTracker';

// Lazy load components for better performance
const HomePageWrapper = lazy(() => import('./pages/HomePageWrapper'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));
const AllEventsPage = lazy(() => import('./pages/AllEventsPage'));
const AllNewsPage = lazy(() => import('./pages/AllNewsPage'));
const AllBlogsPage = lazy(() => import('./pages/AllBlogsPage'));
const AllGalleryPage = lazy(() => import('./pages/AllGalleryPage'));
const LocationLucknow = lazy(() => import('./pages/LocationLucknow'));

const AdminArea = lazy(() => import('./pages/admin/AdminArea'));

// Enhanced QueryClient with better error handling and performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry auth errors
        if (
          error?.message?.includes('refresh_token_not_found') ||
          error?.message?.includes('Invalid Refresh Token') ||
          error?.status === 401
        ) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (replaced cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
});

const App = () => {
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissedInstallToast, setDismissedInstallToast] = useState(() => {
    // Check if user previously dismissed the prompt
    try {
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (dismissed) {
        const { timestamp } = JSON.parse(dismissed);
        // Reset after 7 days
        if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
          return true;
        }
      }
    } catch {
      // Ignore localStorage errors
    }
    return false;
  });
  const [showInstallCTA, setShowInstallCTA] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const interceptInstallPromptRef = useRef(true);
  const installPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  // Check if already installed as PWA
  const isPWAInstalled = useCallback(
    () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true,
    []
  );

  useEffect(() => {
    try {
      initializeSupabaseOptimization();
    } catch (error) {
      console.error('Failed to initialize Supabase optimization:', error);
      // Continue loading even if optimization fails
    }

    const timeout = setTimeout(() => setLoading(false), 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleBeforeInstallPrompt = (event: Event) => {
      // Only intercept if we haven't dismissed and not already installed
      if (
        !interceptInstallPromptRef.current ||
        dismissedInstallToast ||
        isPWAInstalled()
      ) {
        return;
      }
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      installPromptRef.current = promptEvent;
      setInstallPrompt(promptEvent);
      setShowInstallCTA(true);
    };

    // Handle app installed event
    const handleAppInstalled = () => {
      setShowInstallCTA(false);
      setInstallPrompt(null);
      installPromptRef.current = null;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
      performanceMonitor.disconnect();
    };
  }, [dismissedInstallToast, isPWAInstalled]);

  const dismissInstallToast = useCallback(() => {
    setShowInstallCTA(false);
    setDismissedInstallToast(true);
    installPromptRef.current = null;
    setInstallPrompt(null);

    // Persist dismissal for 7 days
    try {
      localStorage.setItem(
        'pwa-install-dismissed',
        JSON.stringify({ timestamp: Date.now() })
      );
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleInstallClick = useCallback(async () => {
    const promptEvent = installPromptRef.current ?? installPrompt;
    if (!promptEvent) return;

    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;

      if (outcome === 'accepted') {
        setShowInstallCTA(false);
      }
    } catch (error) {
      console.warn('PWA install prompt failed:', error);
    } finally {
      installPromptRef.current = null;
      setInstallPrompt(null);
    }
  }, [installPrompt]);

  // Only show install toast on admin routes for logged-in users
  const shouldShowInstallToast =
    showInstallCTA &&
    !isPWAInstalled() &&
    location.pathname.startsWith('/admin') &&
    !dismissedInstallToast &&
    !!installPrompt;

  // Redirect to admin if opened as PWA
  useEffect(() => {
    if (loading) return;
    if (!isPWAInstalled()) return;
    if (location.pathname !== '/') return;
    navigate('/admin/dashboard', { replace: true });
  }, [loading, isPWAInstalled, location.pathname, navigate]);
  return (
    <EnhancedErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            {/* GTM PageTracker for SPA routing - tracks all route changes */}
            <PageTracker />

            <Toaster />
            <Sonner />
            {loading && <Preloader />}

            {!loading && (
              <>
                {!isOnline && <OfflineBanner />}
                {shouldShowInstallToast && (
                  <PWAInstallToast
                    onInstall={handleInstallClick}
                    onDismiss={dismissInstallToast}
                  />
                )}

                <Suspense fallback={<Preloader />}>
                  <Routes>
                    <Route path="/" element={<HomePageWrapper />} />

                    {/* --- ADMIN ROUTES --- */}
                    <Route path="/admin/*" element={<AdminArea />} />

                    {/* CUSTOM ROUTES */}
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/blog/:id" element={<BlogPost />} />
                    <Route path="/event/:id" element={<EventDetail />} />
                    <Route path="/news/:id" element={<NewsDetail />} />

                    {/* VIEW ALL PAGES */}
                    <Route path="/events" element={<AllEventsPage />} />
                    <Route path="/news" element={<AllNewsPage />} />
                    <Route path="/blogs" element={<AllBlogsPage />} />
                    <Route path="/gallery" element={<AllGalleryPage />} />
                    <Route
                      path="/locations/lucknow"
                      element={<LocationLucknow />}
                    />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </>
            )}
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </EnhancedErrorBoundary>
  );
};

export default App;

// TypeScript DOM extension for PWA event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}
