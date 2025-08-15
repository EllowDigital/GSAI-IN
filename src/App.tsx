import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

import Preloader from './components/Preloader';
import OfflineBanner from './components/OfflineBanner';
import InstallPWAButton from './components/InstallPWAButton';

import HomePageWrapper from './pages/HomePageWrapper';
import NotFound from './pages/NotFound';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import BlogPost from './pages/BlogPost';
import EventDetail from './pages/EventDetail';
import NewsDetail from './pages/NewsDetail';

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

const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1300);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

// TypeScript DOM extension for PWA event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}
