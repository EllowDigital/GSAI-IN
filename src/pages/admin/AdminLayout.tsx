import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthProvider';
import { AppSidebar } from '@/components/admin/AppSidebar';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Menu, Search, Bell } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { useRealtime } from '@/hooks/useRealtime';

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
};

const AdminLayout: React.FC = () => {
  const { isAdmin, isLoading, signOut } = useAdminAuth();
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

  if (isLoading || !isAdmin) {
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

  return (
    <div className="h-dvh w-full flex bg-muted/30 overflow-hidden">
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
        <header className="sticky top-0 z-30 bg-background border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between h-14 px-4 lg:px-6">
            {/* Left: Mobile menu + Page title */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5 text-muted-foreground" />
              </button>
              <div>
                <h1 className="text-sm font-semibold text-foreground leading-none">
                  {pageTitle}
                </h1>
                <p className="text-[11px] text-muted-foreground mt-0.5 hidden sm:block">
                  GSAI Management Portal
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
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
