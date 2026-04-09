import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_TITLE = 'GSAI Portal';

function getDashboardAdminTitle(pathname: string): string {
  if (pathname === '/admin/dashboard') return 'Admin Dashboard | GSAI Admin Portal';
  if (pathname.startsWith('/admin/dashboard/enrollments')) return 'Enrollment Requests | GSAI Admin Portal';
  if (pathname.startsWith('/admin/dashboard/students')) return 'Students | GSAI Admin Portal';
  if (pathname.startsWith('/admin/dashboard/fees')) return 'Fees Manager | GSAI Admin Portal';
  if (pathname.startsWith('/admin/dashboard/progression')) return 'Progression | GSAI Admin Portal';
  if (pathname.startsWith('/admin/dashboard/disciplines')) return 'Disciplines | GSAI Admin Portal';
  if (pathname.startsWith('/admin/dashboard/events')) return 'Events | GSAI Admin Portal';
  if (pathname.startsWith('/admin/dashboard/competitions')) return 'Competitions | GSAI Admin Portal';
  if (pathname.startsWith('/admin/dashboard/blogs')) return 'Blogs | GSAI Admin Portal';
  if (pathname.startsWith('/admin/dashboard/news')) return 'News | GSAI Admin Portal';
  if (pathname.startsWith('/admin/dashboard/gallery')) return 'Gallery | GSAI Admin Portal';
  if (pathname.startsWith('/admin/dashboard/testimonials')) return 'Testimonials | GSAI Admin Portal';
  if (pathname.startsWith('/admin/dashboard/announcements')) return 'Announcements | GSAI Admin Portal';
  if (pathname.startsWith('/admin/dashboard/about')) return 'About Academy | GSAI Admin Portal';
  return 'Admin Portal | GSAI Admin Portal';
}

function resolveRouteTitle(pathname: string): string {
  if (pathname === '/') {
    return 'Best Martial Arts Academy in Lucknow | Karate, MMA, Boxing Training - GSAI';
  }

  if (pathname === '/privacy') return 'Privacy Policy | GSAI';
  if (pathname === '/terms') return 'Terms & Conditions | GSAI';
  if (pathname === '/events') return 'All Events | GSAI';
  if (pathname === '/news') return 'All News | GSAI';
  if (pathname === '/blogs') return 'All Blogs | GSAI';
  if (pathname === '/gallery') return 'Gallery | GSAI';
  if (pathname === '/competitions') return 'All Competitions | GSAI';
  if (pathname === '/programs') return 'All Programs | GSAI';
  if (pathname === '/enroll') return 'Secure Admission | GSAI';
  if (pathname === '/contact') return 'Contact Us | GSAI';
  if (pathname === '/corporate') return 'Corporate Programs | GSAI';
  if (pathname === '/locations/lucknow') return 'Lucknow Martial Arts Training | GSAI';

  if (pathname.startsWith('/blog/')) return 'Blog Article | GSAI';
  if (pathname.startsWith('/event/')) return 'Event Details | GSAI';
  if (pathname.startsWith('/news/')) return 'News Article | GSAI';
  if (pathname.startsWith('/programs/')) return 'Program Details | GSAI';

  if (pathname === '/student/login') return 'Student Login | GSAI Portal';
  if (pathname === '/student/set-password') return 'Set Password | GSAI Portal';
  if (pathname === '/student/dashboard') return 'Student Dashboard | GSAI Portal';

  if (pathname === '/admin/login') return 'Admin Access | GSAI Security';
  if (pathname.startsWith('/admin/dashboard')) return getDashboardAdminTitle(pathname);

  if (pathname.startsWith('/admin')) return 'Admin Portal | GSAI Admin Portal';
  if (pathname.startsWith('/student')) return 'Student Portal | GSAI Portal';

  return 'Page Not Found | GSAI';
}

const RouteTitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    const nextTitle = resolveRouteTitle(location.pathname) || DEFAULT_TITLE;

    // Keep a deterministic title for every route; page-level SEO can still override later.
    if (document.title !== nextTitle) {
      document.title = nextTitle;
    }
  }, [location.pathname]);

  return null;
};

export default RouteTitleManager;
