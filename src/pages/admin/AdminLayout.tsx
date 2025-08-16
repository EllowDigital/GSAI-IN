import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthProvider';
import { AppSidebar } from '@/components/admin/AppSidebar';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Menu, LogOut, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
      <div className="flex items-center justify-center h-screen w-screen bg-gradient-surface">
        <div className="glass-card p-8 sm:p-12 max-w-md mx-4 text-center space-y-6">
          <div className="relative">
            <div className="animate-spin h-12 w-12 sm:h-16 sm:w-16 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <div className="absolute inset-0 h-12 w-12 sm:h-16 sm:w-16 border-4 border-primary/20 rounded-full mx-auto" />
          </div>
          <div className="space-y-3">
            <h2 className="text-heading-lg text-foreground font-bold">
              Loading Admin Dashboard
            </h2>
            <p className="text-body-md text-muted-foreground">
              Preparing your workspace...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-gradient-surface transition-colors duration-300">
      {/* Enhanced Sidebar */}
      <AppSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Mobile overlay with blur */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Main layout */}
      <div className="flex-1 flex flex-col h-screen w-full min-w-0">
        {/* Enhanced Header */}
        <header className="sticky top-0 z-30 glass-header shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 gap-4">
            {/* Left: Brand & Toggle */}
            <div className="flex items-center gap-4 min-w-0 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden glass-surface hover:bg-primary/10 border border-primary/20"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5 text-primary" />
              </Button>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-lg">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                </div>
                <div className="space-y-0.5">
                  <h1 className="text-heading-md font-bold text-foreground">
                    GSAI Admin
                  </h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Management Dashboard
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Refresh Button - Only on Dashboard Home */}
              {isDashboardHome && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="glass-surface hover:bg-primary/10 border border-primary/20 interactive-button"
                  title="Refresh dashboard data"
                >
                  <RefreshCw
                    className={cn(
                      "h-4 w-4 transition-transform duration-300",
                      isRefreshing && "animate-spin"
                    )}
                  />
                </Button>
              )}

              {/* Mobile Sign Out */}
              <Button
                variant="ghost"  
                size="icon"
                onClick={signOut}
                className="lg:hidden glass-surface hover:bg-error/10 border border-error/20 text-error"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>

              {/* Profile */}
              <div className="hidden sm:flex items-center gap-3 glass-surface px-4 py-2 rounded-xl border border-border/50">
                <div className="h-8 w-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">
                    A
                  </span>
                </div>
                <div className="hidden lg:block space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">Admin</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Main Content */}
        <main className="flex-1 w-full min-w-0 overflow-y-auto bg-gradient-subtle">
          <div className="min-h-full py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
