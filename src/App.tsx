
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AdminAuthProvider } from "./pages/admin/AdminAuthProvider";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import StatsHome from "./pages/admin/dashboard/StatsHome";
import Blogs from "./pages/admin/dashboard/Blogs";
import News from "./pages/admin/dashboard/News";
import Gallery from "./pages/admin/dashboard/Gallery";
import Students from "./pages/admin/dashboard/Students";
import NotFoundAdmin from "./pages/admin/NotFoundAdmin";
import FeesManager from "./pages/admin/dashboard/FeesManager";
import Events from "./pages/admin/dashboard/Events";
import Preloader from "./components/Preloader";
import React from "react";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";

const queryClient = new QueryClient();

const OfflineOverlay = () => (
  <div className="fixed inset-0 bg-background z-[9999] flex flex-col items-center justify-center text-center p-4 font-montserrat">
    <div className="text-red-500 mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wifi-off"><line x1="2" x2="22" y1="2" y2="22"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 4.17-2.65"/><path d="M10.66 5c.85-.35 1.76-.59 2.7-.72"/><path d="M16.84 6.18a14.95 14.95 0 0 1 5.16 2.64"/><path d="M5.18 12.81a10 10 0 0 1 13.64 0"/><path d="M12 20h.01"/></svg>
    </div>
    <h1 className="text-3xl font-bold text-gray-800 mb-2">Connection Lost</h1>
    <p className="text-lg text-gray-600">
      This app requires an internet connection. Please check your network.
    </p>
  </div>
);

const App = () => {
  const [loading, setLoading] = React.useState(true);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1300); // fade out after 1.3s
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      alert("You are offline. This app only works with an internet connection.");
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {loading && <Preloader />}
        {!loading && !isOnline && <OfflineOverlay />}
        {!loading && isOnline && (
          <>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
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
          </>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
