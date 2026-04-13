import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  lazy,
  Suspense,
} from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeSupabaseOptimization } from '@/utils/supabaseOptimization';
import { performanceMonitor } from '@/utils/performance';
import { initializeAuthTelemetry } from '@/utils/authTelemetry';

import Preloader from '@/components/common/Preloader';
import OfflineBanner from '@/components/common/OfflineBanner';
import PWAInstallToast from '@/components/common/PWAInstallToast';
import EnhancedErrorBoundary from '@/components/feedback/EnhancedErrorBoundary';
import PageTracker from '@/components/layout/PageTracker';
import RouteTitleManager from '@/components/layout/RouteTitleManager';
import ScrollToTop from '@/components/layout/ScrollToTop';
import {
  getPortalPwaScope,
  isPortalLoginPath,
  syncManifestForPath,
} from '@/utils/pwa';
import {
  canEnablePushNotifications,
  syncPushSubscriptionWithBackend,
} from '@/utils/pushNotifications';

// Lazy load components for better performance
const HomePageWrapper = lazy(() => import('@/pages/public/HomePageWrapper'));
const NotFound = lazy(() => import('@/pages/public/NotFoundPage'));
const PrivacyPage = lazy(() => import('@/pages/public/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/public/TermsPage'));
const BlogPost = lazy(() => import('@/pages/public/BlogPostPage'));
const EventDetail = lazy(() => import('@/pages/public/EventDetailPage'));
const NewsDetail = lazy(() => import('@/pages/public/NewsDetailPage'));
const AllEventsPage = lazy(() => import('@/pages/public/AllEventsPage'));
const AllNewsPage = lazy(() => import('@/pages/public/AllNewsPage'));
const AllBlogsPage = lazy(() => import('@/pages/public/AllBlogsPage'));
const AllGalleryPage = lazy(() => import('@/pages/public/AllGalleryPage'));
const LocationLucknow = lazy(
  () => import('@/pages/public/LocationLucknowPage')
);
const ProgramDetail = lazy(() => import('@/pages/public/ProgramDetailPage'));
const AllProgramsPage = lazy(() => import('@/pages/public/AllProgramsPage'));
const AllCompetitionsPage = lazy(
  () => import('@/pages/public/AllCompetitionsPage')
);
const EnrollPage = lazy(() => import('@/pages/public/EnrollPage'));
const StudentPortal = lazy(() => import('./pages/student/StudentPortal'));

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
      staleTime: 1000 * 60 * 10, // 10 minutes
      gcTime: 1000 * 60 * 60, // 60 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
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
    // Backward compatibility: if legacy dismissal exists, treat as admin dismissal.
    try {
      const legacyDismissed = localStorage.getItem('pwa-install-dismissed');
      if (legacyDismissed) {
        const { timestamp } = JSON.parse(legacyDismissed);
        if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
          localStorage.setItem('pwa-install-dismissed-admin', legacyDismissed);
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
  const interceptInstallPromptRef = useRef(true);
  const installPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  const activePortalScope = getPortalPwaScope(location.pathname);
  const isLoginPortalPage = isPortalLoginPath(location.pathname);
  const pushSupported = canEnablePushNotifications();

  useEffect(() => {
    syncManifestForPath(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (!isLoginPortalPage) {
      setDismissedInstallToast(true);
      return;
    }

    const key = `pwa-install-dismissed-${activePortalScope}`;
    try {
      const dismissed = localStorage.getItem(key);
      if (!dismissed) {
        setDismissedInstallToast(false);
        return;
      }

      const { timestamp } = JSON.parse(dismissed);
      const isStillDismissed = Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000;
      setDismissedInstallToast(isStillDismissed);
    } catch {
      setDismissedInstallToast(false);
    }
  }, [activePortalScope, isLoginPortalPage]);

  // Check if already installed as PWA
  const isPWAInstalled = useCallback(
    () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true,
    []
  );

  useEffect(() => {
    const scheduleIdleTask = (task: () => void) => {
      if (typeof window === 'undefined') {
        task();
        return () => {};
      }

      if ('requestIdleCallback' in window) {
        const idleId = (
          window as Window & {
            requestIdleCallback: (callback: IdleRequestCallback) => number;
          }
        ).requestIdleCallback(() => task());
        return () => {
          if ('cancelIdleCallback' in window) {
            (
              window as Window & {
                cancelIdleCallback: (id: number) => void;
              }
            ).cancelIdleCallback(idleId);
          }
        };
      }

      const timeoutId = window.setTimeout(task, 120);
      return () => window.clearTimeout(timeoutId);
    };

    const cancelIdleInit = scheduleIdleTask(() => {
      try {
        initializeSupabaseOptimization();
        initializeAuthTelemetry();
      } catch (error) {
        console.error('Failed to initialize Supabase optimization:', error);
      }
    });

    try {
      // Let the UI render as soon as possible.
      setLoading(false);
    } catch {
      setLoading(false);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleBeforeInstallPrompt = (event: Event) => {
      const path = window.location.pathname;
      if (!isPortalLoginPath(path)) {
        return;
      }

      syncManifestForPath(path);

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
      cancelIdleInit();
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
      const key = `pwa-install-dismissed-${activePortalScope}`;
      localStorage.setItem(key, JSON.stringify({ timestamp: Date.now() }));
    } catch {
      // Ignore localStorage errors
    }
  }, [activePortalScope]);

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

  const handleEnableNotifications = useCallback(async () => {
    if (activePortalScope === 'public') return;

    try {
      await syncPushSubscriptionWithBackend(activePortalScope);
    } catch (error) {
      console.warn('Push subscription setup failed:', error);
    }
  }, [activePortalScope]);

  useEffect(() => {
    if (!pushSupported || activePortalScope === 'public') return;
    if (Notification.permission !== 'granted') return;

    void syncPushSubscriptionWithBackend(activePortalScope).catch((error) => {
      console.warn('Push subscription auto-sync skipped:', error);
    });
  }, [activePortalScope, pushSupported]);

  // Show install toast only on login entry points of admin/student portals.
  const shouldShowInstallToast =
    showInstallCTA &&
    !isPWAInstalled() &&
    isLoginPortalPage &&
    !dismissedInstallToast &&
    !!installPrompt;

  return (
    <EnhancedErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            {/* GTM PageTracker for SPA routing - tracks all route changes */}
            <RouteTitleManager />
            <PageTracker />
            <ScrollToTop />

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
                    portalType={
                      activePortalScope === 'student' ? 'student' : 'admin'
                    }
                    onEnableNotifications={handleEnableNotifications}
                    pushReady={pushSupported}
                  />
                )}

                <Suspense fallback={<Preloader />}>
                  <Routes>
                    <Route path="/" element={<HomePageWrapper />} />

                    {/* --- ADMIN ROUTES --- */}
                    <Route path="/admin/*" element={<AdminArea />} />

                    {/* --- STUDENT PORTAL --- */}
                    <Route path="/student/*" element={<StudentPortal />} />

                    {/* CUSTOM ROUTES */}
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/blog/:id" element={<BlogPost />} />
                    <Route path="/event/:id" element={<EventDetail />} />
                    <Route path="/news/:id" element={<NewsDetail />} />

                    {/* VIEW ALL PAGES */}
                    <Route
                      path="/event"
                      element={<Navigate to="/events" replace />}
                    />
                    <Route
                      path="/event/"
                      element={<Navigate to="/events" replace />}
                    />
                    <Route path="/events" element={<AllEventsPage />} />
                    <Route path="/news" element={<AllNewsPage />} />
                    <Route path="/blogs" element={<AllBlogsPage />} />
                    <Route path="/gallery" element={<AllGalleryPage />} />
                    <Route
                      path="/competitions"
                      element={<AllCompetitionsPage />}
                    />

                    {/* Section landing aliases to prevent direct-link 404s */}
                    <Route path="/contact" element={<HomePageWrapper />} />
                    <Route path="/corporate" element={<HomePageWrapper />} />

                    {/* Legacy static path aliases */}
                    <Route
                      path="/pages/privacy.html"
                      element={<Navigate to="/privacy" replace />}
                    />
                    <Route
                      path="/pages/terms.html"
                      element={<Navigate to="/terms" replace />}
                    />
                    <Route
                      path="/locations/lucknow"
                      element={<LocationLucknow />}
                    />
                    <Route path="/programs" element={<AllProgramsPage />} />
                    <Route path="/programs/:slug" element={<ProgramDetail />} />
                    <Route path="/enroll" element={<EnrollPage />} />

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
