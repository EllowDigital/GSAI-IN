
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthProvider';
import { AppSidebar } from '@/components/admin/AppSidebar';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const AdminLayout: React.FC = () => {
  const { isAdmin, isLoading } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Lock scroll when sidebar is open on mobile
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
    <div className="min-h-screen w-full flex font-inter bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors">
      {/* Sidebar */}
      <AppSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Main Layout */}
      <div className="flex-1 flex flex-col min-h-screen w-full min-w-0">
        {/* Enhanced Responsive Header */}
        <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-30 shadow-lg">
          <div className="flex items-center justify-between px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 gap-2 sm:gap-4">
            {/* Left: Brand & Menu */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-shrink-0">
              <button
                className="lg:hidden p-1.5 sm:p-2 md:p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/40 dark:hover:to-indigo-800/40 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700 dark:text-blue-300" />
              </button>
              
              <div className="flex flex-col min-w-0">
                <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  GSAI Admin
                </h1>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                  Dashboard Management
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Enhanced Refresh Button */}
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 sm:p-2.5 md:p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-800/40 dark:hover:to-emerald-800/40 border border-green-200 dark:border-green-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label={isRefreshing ? 'Refreshing...' : 'Refresh dashboard'}
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-green-700 dark:text-green-300 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : 'hover:rotate-180'}`} />
              </Button>

              {/* Avatar */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-700 flex items-center justify-center shadow-sm border border-blue-200/50 dark:border-blue-600/50 overflow-hidden flex-shrink-0">
                <img
                  src="/assets/img/logo.webp"
                  alt="Admin avatar"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content with responsive spacing */}
        <main className="flex-1 w-full min-w-0 overflow-auto bg-gradient-to-br from-slate-50/50 via-white/50 to-blue-50/50">
          <div className="w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
