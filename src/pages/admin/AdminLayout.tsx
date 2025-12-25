import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthProvider';
import { AppSidebar } from '@/components/admin/AppSidebar';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Menu, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminLayout: React.FC = () => {
  const { isAdmin, isLoading, signOut } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const location = useLocation();

  // Only show refresh button on dashboard home
  const isDashboardHome = location.pathname === '/admin/dashboard';

  // Lock scroll on mobile when sidebar is open
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
      toast({
        title: 'Refreshing Dashboard',
        description: 'Fetching the latest data...',
      });

      await queryClient.invalidateQueries();
      await queryClient.refetchQueries();

      toast({
        title: 'Success',
        description: 'Dashboard refreshed successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Refresh Failed',
        description: 'Unable to refresh dashboard data. Please try again.',
        variant: 'error',
      });
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  if (isLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center space-y-4 sm:space-y-6 p-4 sm:p-8">
          <div className="relative">
            <div className="animate-spin h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16 border-4 border-blue-500 border-t-transparent rounded-full" />
            <div className="absolute inset-0 h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16 border-4 border-blue-200 rounded-full opacity-20" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm sm:text-lg md:text-xl font-semibold text-slate-700 dark:text-slate-300">
              Loading Admin Dashboard
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Please wait while we prepare your workspace
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex font-inter bg-gradient-to-br from-background via-background to-muted/30 transition-colors duration-300">
      {/* Sidebar */}
      <AppSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Mobile overlay with animation */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-label="Close sidebar"
      />

      {/* Main layout */}
      <div className="flex-1 flex flex-col h-screen w-full min-w-0">
        {/* Modern Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 gap-2 sm:gap-4">
            {/* Left: Brand & Toggle */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
              <button
                className="lg:hidden p-2 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/30 transition-all duration-200 active:scale-95"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5 text-primary" />
              </button>

              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
                  <span className="text-sm sm:text-base font-bold text-primary-foreground">G</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <h1 className="text-base sm:text-lg lg:text-xl font-bold text-foreground truncate">
                    GSAI Admin
                  </h1>
                  <span className="text-xs text-muted-foreground hidden sm:block truncate">
                    Management Dashboard
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Refresh Button - Only on Dashboard Home */}
              {isDashboardHome && (
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border hover:border-border/80 transition-all duration-200 active:scale-95 disabled:opacity-50"
                  title="Refresh dashboard data"
                >
                  <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              )}

              {/* Sign Out - Mobile */}
              <button
                onClick={signOut}
                className="lg:hidden p-2 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 hover:border-destructive/30 transition-all duration-200 active:scale-95"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Profile Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border/50">
                <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary-foreground">A</span>
                </div>
                <span className="text-sm font-medium text-foreground hidden md:block">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 w-full min-w-0 overflow-y-auto bg-gradient-to-b from-transparent to-muted/20 h-0 overscroll-contain">
          <div className="h-full w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
