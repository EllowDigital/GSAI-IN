
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthProvider';
import { AppSidebar } from '@/components/admin/AppSidebar';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Menu, Bell, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AdminLayout: React.FC = () => {
  const { isAdmin, isLoading } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Toggle body scroll lock when sidebar is open
  React.useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleRefresh = () => {
    toast({
      title: 'Refreshing data...',
      description: 'Fetching the latest information.',
    });
    queryClient.invalidateQueries();
  };

  if (isLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin h-12 w-12 border-4 border-yellow-400 border-t-transparent rounded-full" />
            <div className="absolute inset-0 h-12 w-12 border-4 border-yellow-200 rounded-full opacity-20" />
          </div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex font-inter bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Sidebar */}
      <AppSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300">
        {/* Modern Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                className="md:hidden p-2.5 rounded-xl bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200/50 hover:from-yellow-100 hover:to-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all duration-200 shadow-sm"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5 text-yellow-700" />
              </button>
              <div className="flex flex-col">
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent select-none">
                  GSAI Admin
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Dashboard Management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Bar - Hidden on mobile */}
              <div className="hidden lg:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Quick search..."
                    className="pl-10 pr-4 py-2 w-64 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/50 transition-all duration-200 hover:shadow-sm group"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4 text-slate-600 group-hover:text-slate-800" />
                </button>
                
                <button
                  onClick={handleRefresh}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200/50 transition-all duration-200 hover:shadow-sm group"
                  aria-label="Refresh data"
                >
                  <RefreshCw className="w-4 h-4 text-blue-700 group-hover:rotate-180 transition-transform duration-300" />
                </button>

                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow-sm border border-yellow-300/50 overflow-hidden">
                  <img
                    src="/assets/img/logo.webp"
                    alt="Admin avatar"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content with improved spacing */}
        <main className="flex-1 p-4 lg:p-6 space-y-6 min-h-0">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
