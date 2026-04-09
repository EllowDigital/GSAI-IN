import React, { useEffect, useState, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthProvider';
import { AppSidebar } from '@/components/admin/AppSidebar';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Menu, PanelLeftClose, PanelLeft } from 'lucide-react';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

    void warmAdminData();
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
        variant: 'destructive',
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
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <PanelLeft className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>

              <div className="ml-1 sm:ml-2">
                <h1 className="text-base font-bold text-foreground tracking-tight leading-none sm:text-lg">
                  {pageTitle}
                </h1>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
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
                  className={cn('w-4 h-4', isRefreshing && 'animate-spin text-primary')}
                />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-slate-50/50 dark:bg-slate-950/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;