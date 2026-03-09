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

  const isDashboardHome = location.pathname === '/admin/dashboard';

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
      toast({ title: 'Refreshed', description: 'Dashboard data updated.' });
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
          <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh w-full flex bg-background overflow-hidden">
      <AppSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-200 ${
          sidebarOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-dvh min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 h-12">
            <div className="flex items-center gap-2">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5 text-foreground" />
              </button>
              <h1 className="text-sm sm:text-base font-semibold text-foreground">
                GSAI Admin
              </h1>
            </div>

            <div className="flex items-center gap-1">
              {isDashboardHome && (
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                  />
                </button>
              )}
              <button
                onClick={signOut}
                className="lg:hidden p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
