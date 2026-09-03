import React, { useEffect, useState, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthProvider';
import { AppSidebar } from '@/components/admin/AppSidebar';
import { useQueryClient } from '@tanstack/react-query';
import {
  RefreshCw,
  Menu,
  PanelLeftClose,
  PanelLeft,
  Search,
} from 'lucide-react';
import AdminCommandPalette from '@/components/admin/AdminCommandPalette';
import AdminNotificationBell from '@/components/admin/AdminNotificationBell';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { useRealtime } from '@/hooks/useRealtime';
import { supabase } from '@/services/supabase/client';
import {
  STUDENTS_QUERY_KEY,
  STUDENTS_SHARED_SELECT,
} from '@/constants/studentsQuery';

// --- Constants ---
const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/dashboard/enrollments': 'Enrollment Requests',
  '/admin/dashboard/students': 'Students',
  '/admin/dashboard/fees': 'Fee Management',
  '/admin/dashboard/progression': 'Student Progression',
  '/admin/dashboard/disciplines': 'Disciplines',
  '/admin/dashboard/events': 'Events',
  '/admin/dashboard/competitions': 'Competitions',
  '/admin/dashboard/blogs': 'Blog Management',
  '/admin/dashboard/news': 'News',
  '/admin/dashboard/gallery': 'Gallery',
  '/admin/dashboard/testimonials': 'Testimonials',
  '/admin/dashboard/announcements': 'Announcements',
  '/admin/dashboard/about': 'About',
};

const AdminLayout: React.FC = () => {
  const { isAdmin, isLoading } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem('admin:sidebar-collapsed') === '1';
    } catch {
      return false;
    }
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const location = useLocation();

  useRealtime();

  // --- Derived State ---
  const pageTitle = useMemo(
    () => PAGE_TITLES[location.pathname] || 'Admin',
    [location.pathname]
  );

  // --- Dynamic Page Title ---
  useEffect(() => {
    document.title = `${pageTitle} | GSAI Admin Portal`;
  }, [pageTitle]);

  // --- Persist Sidebar Preference ---
  useEffect(() => {
    try {
      window.localStorage.setItem(
        'admin:sidebar-collapsed',
        sidebarCollapsed ? '1' : '0'
      );
    } catch {
      // Ignore storage failures; layout still works.
    }
  }, [sidebarCollapsed]);

  // --- Keyboard Shortcuts (Cmd/Ctrl+K, [) ---
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === 'k') {
        event.preventDefault();
        setCommandOpen((prev) => !prev);
        return;
      }
      if ((event.metaKey || event.ctrlKey) && key === 'b') {
        event.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // --- Close Mobile Sidebar On Route Change ---
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // --- Mobile Scroll Lock ---
  useEffect(() => {
    if (window.innerWidth < 1024) {
      document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // --- Data Prefetching (Cache Warming) ---
  useEffect(() => {
    if (!isAdmin) return;

    const warmAdminData = async () => {
      await Promise.allSettled([
        queryClient.prefetchQuery({
          queryKey: STUDENTS_QUERY_KEY,
          queryFn: async () => {
            const { data, error } = await supabase
              .from('students')
              .select(STUDENTS_SHARED_SELECT)
              .order('created_at', { ascending: false });
            if (error) throw error;
            return data ?? [];
          },
          staleTime: 1000 * 60 * 10,
        }),
        queryClient.prefetchQuery({
          queryKey: ['fees'],
          queryFn: async () => {
            const { data, error } = await supabase
              .from('fees')
              .select('*')
              .order('created_at', { ascending: false });
            if (error) throw error;
            return data ?? [];
          },
          staleTime: 1000 * 60 * 5,
        }),
        queryClient.prefetchQuery({
          queryKey: ['enrollment-requests'],
          queryFn: async () => {
            const { data, error } = await supabase
              .from('enrollment_requests')
              .select('*')
              .order('created_at', { ascending: false });
            if (error) throw error;
            return data ?? [];
          },
          staleTime: 1000 * 60 * 5,
        }),
      ]);
    };

    const idle =
      (
        window as unknown as {
          requestIdleCallback?: (cb: () => void) => number;
        }
      ).requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    idle(() => {
      void warmAdminData();
    });
  }, [isAdmin, queryClient]);

  // --- Handlers ---
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries();
      await queryClient.refetchQueries();
      toast({ title: 'Refreshed', description: 'All data has been updated.' });
    } catch {
      toast({
        title: 'Refresh Failed',
        description: 'Unable to refresh data. Please check your connection.',
        variant: 'error',
      });
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // --- Render States ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-dvh w-screen bg-background text-foreground">
        <div className="flex flex-col items-center gap-5">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <div className="animate-spin h-12 w-12 border-[3px] border-primary/20 border-t-primary rounded-full relative z-10" />
          </div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-wide">
            Loading Secure Environment...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-shell h-dvh w-full flex overflow-hidden bg-background text-foreground selection:bg-primary/20">
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <AdminCommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onRefresh={handleRefresh}
      />

      {/* Sidebar Navigation */}
      <AppSidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Mobile Sidebar Overlay */}
      <div
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-all duration-300',
          sidebarOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col h-dvh min-w-0 transition-all duration-300">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 flex-shrink-0 shadow-sm transition-colors">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            {/* Left: Mobile menu + Page Title */}
            <div className="flex items-center gap-3">
              <button
                className="-ml-2 rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <button
                className="hidden lg:inline-flex items-center justify-center rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                aria-label={
                  sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
                }
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <PanelLeft className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>

              <div className="ml-1 sm:ml-2">
                <h1 className="truncate text-base font-bold text-foreground tracking-tight leading-none sm:text-lg">
                  {pageTitle}
                </h1>
                <p className="mt-1 hidden text-xs text-muted-foreground sm:block">
                  GSAI Admin Portal
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setCommandOpen(true)}
                className="hidden md:inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-label="Open command palette"
              >
                <Search className="h-4 w-4" />
                <span className="hidden lg:inline">Search…</span>
                <kbd className="hidden lg:inline rounded border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-medium tracking-wide">
                  ⌘K
                </kbd>
              </button>

              <button
                onClick={() => setCommandOpen(true)}
                className="md:hidden rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>

              <AdminNotificationBell />

              <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                title="Refresh dashboard data"
                aria-label="Refresh data"
              >
                <RefreshCw
                  className={cn(
                    'w-4 h-4',
                    isRefreshing && 'animate-spin text-primary'
                  )}
                />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main
          id="admin-main-content"
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain scroll-smooth bg-muted/30 [content-visibility:auto]"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
