import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePageWrapper from './pages/HomePageWrapper';
import NotFound from './pages/NotFound';
import { AdminAuthProvider } from './pages/admin/AdminAuthProvider';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import StatsHome from './pages/admin/dashboard/StatsHome';
import Blogs from './pages/admin/dashboard/Blogs';
import News from './pages/admin/dashboard/News';
import Gallery from './pages/admin/dashboard/Gallery';
import Students from './pages/admin/dashboard/Students';
import NotFoundAdmin from './pages/admin/NotFoundAdmin';
import FeesManager from './pages/admin/dashboard/FeesManager';
import Events from './pages/admin/dashboard/Events';
import Preloader from './components/Preloader';
import React from 'react';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import OfflineBanner from './components/OfflineBanner';
import InstallPWAButton from './components/InstallPWAButton';

const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = React.useState(true);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = React.useState<any>(null);

  React.useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1300); // fade out after 1.3s

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      console.log('PWA install prompt event captured.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then(() => {
      setInstallPrompt(null);
    });
  };

  const isPWAInstalled = () => {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {loading && <Preloader />}

        <div
          style={{ visibility: loading ? 'hidden' : 'visible' }}
          className="h-full"
        >
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
                        <Route index element={<StatsHome />} />
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
