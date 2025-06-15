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
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";

const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1300); // fade out after 1.3s
    return () => clearTimeout(timeout);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {loading && <Preloader />}
        {!loading && (
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
