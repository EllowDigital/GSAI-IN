import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthProvider';
import { AppSidebar } from '@/components/admin/AppSidebar';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Menu } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SIDEBAR_WIDTH = '16rem';

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
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <div className="animate-spin h-10 w-10 border-4 border-yellow-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex font-montserrat bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      {/* Sidebar */}
      <AppSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-4 bg-white shadow-md border-b sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden p-2 rounded-lg bg-yellow-100 border border-yellow-200 hover:bg-yellow-200 focus:outline-none transition"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6 text-yellow-600" />
            </button>
            <h1 className="text-lg md:text-2xl font-extrabold text-yellow-600 select-none">
              GSAI Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-full hover:bg-yellow-100 transition-colors"
              aria-label="Refresh data"
            >
              <RefreshCw className="w-5 h-5 text-yellow-600" />
            </button>
            <div className="w-8 h-8 md:w-11 md:h-11 rounded-full bg-yellow-200 flex items-center justify-center shadow-inner border border-yellow-300 overflow-hidden">
              <img
                src="/assets/img/logo.webp"
                alt="Admin avatar"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-3 sm:px-6 py-4 md:py-6 transition-all">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
