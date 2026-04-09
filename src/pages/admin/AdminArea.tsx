import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './AdminAuthProvider';
import { Loader2 } from 'lucide-react';

// --- Lazy Loaded Components ---
// These are only fetched over the network when the user visits the specific route.
const AdminLogin = lazy(() => import('./AdminLogin'));
const AdminLayout = lazy(() => import('./AdminLayout'));
const NotFoundAdmin = lazy(() => import('./NotFoundAdmin'));

// Dashboard Views
const DashboardHome = lazy(() => import('./dashboard/DashboardHome'));
const EnrollmentRequests = lazy(() => import('./dashboard/EnrollmentRequests'));
const Students = lazy(() => import('./dashboard/Students'));
const FeesManager = lazy(() => import('./dashboard/FeesManager'));
const Progression = lazy(() => import('./dashboard/Progression'));
const Disciplines = lazy(() => import('./dashboard/Disciplines'));

// Content Management Views
const Events = lazy(() => import('./dashboard/Events'));
const Competitions = lazy(() => import('./dashboard/Competitions'));
const Blogs = lazy(() => import('./dashboard/Blogs'));
const News = lazy(() => import('./dashboard/News'));
const Gallery = lazy(() => import('./dashboard/Gallery'));
const Testimonials = lazy(() => import('./dashboard/Testimonials'));
const Announcements = lazy(() => import('./dashboard/Announcements'));
const About = lazy(() => import('./dashboard/About'));

// --- Loading Fallback ---
const AdminPageLoader = () => (
  <div className="flex h-screen w-full flex-col items-center justify-center bg-[#050505] space-y-4">
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-xl animate-pulse" />
      <Loader2 className="h-10 w-10 animate-spin text-yellow-500 relative z-10" />
    </div>
    <p className="text-sm font-medium text-gray-400 animate-pulse tracking-wide">
      Loading module...
    </p>
  </div>
);

const AdminArea = () => {
  return (
    <AdminAuthProvider>
      <Suspense fallback={<AdminPageLoader />}>
        <Routes>
          {/* Base Redirect */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* Public/Auth Route */}
          <Route path="login" element={<AdminLogin />} />

          {/* Protected Dashboard Routes */}
          <Route path="dashboard" element={<AdminLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="enrollments" element={<EnrollmentRequests />} />
            <Route path="students" element={<Students />} />
            <Route path="fees" element={<FeesManager />} />
            <Route path="progression" element={<Progression />} />
            <Route path="disciplines" element={<Disciplines />} />

            <Route path="events" element={<Events />} />
            <Route path="competitions" element={<Competitions />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="news" element={<News />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="about" element={<About />} />

            {/* Nested 404 - Catches bad URLs under /admin/dashboard/* */}
            <Route path="*" element={<NotFoundAdmin />} />
          </Route>

          {/* Global Admin 404 - Catches bad URLs under /admin/* */}
          <Route path="*" element={<NotFoundAdmin />} />
        </Routes>
      </Suspense>
    </AdminAuthProvider>
  );
};

export default AdminArea;
