import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthProvider';
import { AppSidebar } from '@/components/admin/AppSidebar';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Menu, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AdminLayout: React.FC = () => {
  const { isAdmin, isLoading } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Lock scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleRefresh = () => {
    toast({
      title: 'Refreshing',
      description: 'Fetching the latest dashboard data...',
    });
    queryClient.invalidateQueries();
  };

  if (isLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-slate-100 to-yellow-50 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin h-12 w-12 border-4 border-yellow-400 border-t-transparent rounded-full" />
            <div className="absolute inset-0 h-12 w-12 border-4 border-yellow-200 rounded-full opacity-20" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex font-inter bg-gradient-to-br from-slate-50 via-white to-yellow-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors">
      {/* Sidebar */}
      <AppSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Main Layout */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            {/* Left: Brand & Menu */}
            <div className="flex items-center gap-4">
              <button
                className="md:hidden p-2.5 rounded-xl bg-yellow-100 dark:bg-yellow-800 border border-yellow-300 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5 text-yellow-700 dark:text-yellow-100" />
              </button>
              <div className="flex flex-col">
                <h1 className="text-xl lg:text-2xl font-extrabold text-yellow-700 dark:text-yellow-400">
                  GSAI Admin
                </h1>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Dashboard Management
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden lg:flex items-center relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Quick search..."
                  className="pl-10 pr-4 py-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
              </div>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                className="p-2.5 rounded-xl bg-blue-50 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-slate-600 border border-blue-200 dark:border-slate-600 transition"
                aria-label="Refresh"
              >
                <RefreshCw className="w-4 h-4 text-blue-700 dark:text-blue-300 transition-transform hover:rotate-180" />
              </button>

              {/* Avatar (Mobile only: hidden on tablet and desktop) */}
              <div className="block sm:hidden w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-700 flex items-center justify-center shadow border border-yellow-300/50 dark:border-yellow-600 overflow-hidden">
                <img
                  src="/assets/img/logo.webp"
                  alt="Admin avatar"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 space-y-6">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
