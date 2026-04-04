import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthProvider';
import { AppSidebar } from '@/components/admin/AppSidebar';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Menu, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { useRealtime } from '@/hooks/useRealtime';
import { supabase } from '@/services/supabase/client';

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

  const pageTitle = PAGE_TITLES[location.pathname] || 'Admin';

  useEffect(() => {
    if (window.innerWidth < 1024) {
      document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!isAdmin) return;

    const warmAdminData = async () => {
      await Promise.allSettled([
        queryClient.prefetchQuery({
          queryKey: ['students'],
          queryFn: async () => {
            const { data, error } = await supabase
              .from('students')
              .select(
                'id, name, aadhar_number, program, join_date, parent_name, parent_contact, profile_image_url, created_at, default_monthly_fee, discount_percent'
              )
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
              .order('due_date', { ascending: false });
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries();
      await queryClient.refetchQueries();
      toast({ title: 'Refreshed', description: 'All data updated.' });
    } catch {
      toast({
        title: 'Refresh Failed',
        description: 'Please try again.',
        variant: 'error' as any,
      });
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-dvh w-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin h-10 w-10 border-[3px] border-primary/20 border-t-primary rounded-full" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading admin portal…
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-shell h-dvh w-full flex overflow-hidden">
      <AppSidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden transition-opacity duration-200',
          sidebarOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-dvh min-w-0">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 flex-shrink-0">
          <div className="flex h-14 items-center justify-between px-4 lg:px-6">
            {/* Left: Mobile menu + Title */}
            <div className="flex items-center gap-2.5">
              <button
                className="-ml-2 rounded-lg p-2 transition-colors hover:bg-muted lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5 text-muted-foreground" />
              </button>

              <button
                className="hidden lg:inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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

              <div>
                <h1 className="text-sm font-semibold text-foreground leading-none sm:text-[15px]">
                  {pageTitle}
                </h1>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw
                  className={cn('w-4 h-4', isRefreshing && 'animate-spin')}
                />
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
