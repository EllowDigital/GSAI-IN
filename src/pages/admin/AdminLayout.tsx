
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthProvider';
import { AppSidebar } from '@/components/admin/AppSidebar';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Menu, Search, Bell, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const AdminLayout: React.FC = () => {
  const { isAdmin, isLoading } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Lock scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
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
      
      // Invalidate all queries to refresh data
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
        variant: 'destructive',
      });
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  if (isLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center space-y-6 p-8">
          <div className="relative">
            <div className="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full" />
            <div className="absolute inset-0 h-16 w-16 border-4 border-blue-200 rounded-full opacity-20" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">
              Loading Admin Dashboard
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
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
        {/* Enhanced Header */}
        <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-30 shadow-lg">
          <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            {/* Left: Brand & Menu */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <button
                className="lg:hidden p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/40 dark:hover:to-indigo-800/40 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5 text-blue-700 dark:text-blue-300" />
              </button>
              
              <div className="flex flex-col min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  GSAI Admin
                </h1>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                  Dashboard Management
                </span>
              </div>
            </div>

            {/* Center: Search (hidden on mobile) */}
            <div className="hidden md:flex items-center relative mx-4 lg:mx-8 flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Quick search..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
              />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Search Button */}
              <button className="md:hidden p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 transition-all duration-200">
                <Search className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>

              {/* Notifications */}
              <button className="hidden sm:block p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-800/40 dark:hover:to-red-800/40 border border-orange-200 dark:border-orange-700 transition-all duration-200 shadow-sm hover:shadow-md">
                <Bell className="w-4 h-4 text-orange-700 dark:text-orange-300" />
              </button>

              {/* Enhanced Refresh Button */}
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-800/40 dark:hover:to-emerald-800/40 border border-green-200 dark:border-green-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label={isRefreshing ? 'Refreshing...' : 'Refresh dashboard'}
              >
                <RefreshCw className={`w-4 h-4 text-green-700 dark:text-green-300 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : 'hover:rotate-180'}`} />
              </Button>

              {/* Settings */}
              <button className="hidden sm:block p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 transition-all duration-200 shadow-sm hover:shadow-md">
                <Settings className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>

              {/* Avatar */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-700 flex items-center justify-center shadow-sm border border-blue-200/50 dark:border-blue-600/50 overflow-hidden">
                <img
                  src="/assets/img/logo.webp"
                  alt="Admin avatar"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content with better spacing */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 w-full min-w-0 overflow-hidden">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
