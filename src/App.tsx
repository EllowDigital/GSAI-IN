import React, { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeSupabaseOptimization } from '@/utils/supabaseOptimization';
import { performanceMonitor } from '@/utils/performance';

import Preloader from './components/Preloader';
import OfflineBanner from './components/OfflineBanner';
import InstallPWAButton from './components/InstallPWAButton';
import ErrorBoundary from './components/ErrorBoundary';
import EnhancedErrorBoundary from './components/EnhancedErrorBoundary';

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

// Admin components (keep eager loading for admin as they're less critical for SEO)
import { AdminAuthProvider } from './pages/admin/AdminAuthProvider';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import NotFoundAdmin from './pages/admin/NotFoundAdmin';
import DashboardHome from './pages/admin/dashboard/DashboardHome';
import Blogs from './pages/admin/dashboard/Blogs';
import News from './pages/admin/dashboard/News';
import Gallery from './pages/admin/dashboard/Gallery';
import Students from './pages/admin/dashboard/Students';
import FeesManager from './pages/admin/dashboard/FeesManager';
import Events from './pages/admin/dashboard/Events';

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

  useEffect(() => {
    // Initialize performance monitoring and optimizations
    initializeSupabaseOptimization();

    const timeout = setTimeout(() => setLoading(false), 1000); // Reduced loading time

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Cleanup performance monitoring on unmount
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      performanceMonitor.disconnect();
    };
  }, []);

  const handleInstallClick = useCallback(() => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice?.then(() => setInstallPrompt(null));
  }, [installPrompt]);

  const isPWAInstalled = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone;

  return (
    <EnhancedErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {loading && <Preloader />}

            {!loading && (
              <>
                {!isOnline && <OfflineBanner />}
                {installPrompt && !isPWAInstalled() && (
                  <InstallPWAButton onInstall={handleInstallClick} />
                )}

                <BrowserRouter>
                  <Suspense fallback={<Preloader />}>
                    <Routes>
                      <Route path="/" element={<HomePageWrapper />} />

                      {/* --- ADMIN ROUTES --- */}
                      <Route
                        path="/admin/*"
                        element={
                          <AdminAuthProvider>
                            <Routes>
                              <Route path="login" element={<AdminLogin />} />
                              <Route path="dashboard" element={<AdminLayout />}>
                                <Route index element={<DashboardHome />} />
                                <Route path="fees" element={<FeesManager />} />
                                <Route path="blogs" element={<Blogs />} />
                                <Route path="news" element={<News />} />
                                <Route path="gallery" element={<Gallery />} />
                                <Route path="students" element={<Students />} />
                                <Route path="events" element={<Events />} />
                                <Route path="*" element={<NotFoundAdmin />} />
                              </Route>
                              <Route path="*" element={<NotFoundAdmin />} />
                            </Routes>
                          </AdminAuthProvider>
                        }
                      />

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

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
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
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}
