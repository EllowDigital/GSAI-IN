import React from "react";
import { Outlet } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthProvider";
import { AppSidebar } from "@/components/admin/AppSidebar";

// Drawer overlay that closes sidebar when you click it
const DrawerOverlay = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) =>
  isOpen ? (
    <div
      className="fixed inset-0 z-40 bg-black/30 md:hidden transition-opacity animate-fade-in"
      onClick={onClick}
      aria-label="Close sidebar"
    />
  ) : null;

const SIDEBAR_WIDTH = "16rem"; // Equal to AppSidebar width

// Modern admin layout with responsive sidebar and content
const AdminLayout: React.FC = () => {
  const { isAdmin, isLoading } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  if (isLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <div className="animate-spin h-10 w-10 border-4 border-yellow-400 rounded-full border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-yellow-50 via-white to-yellow-100 min-h-screen min-w-full font-montserrat flex">
      {/* Sidebar */}
      <AppSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transiiton-opacity md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}
      {/* Main content */}
      <div className={`flex-1 flex flex-col h-full min-h-screen transition-all duration-300`}>
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-4 bg-white shadow-md border-b sticky top-0 z-30">
          <button
            className="md:hidden p-2 rounded-lg bg-yellow-100 border border-yellow-200 hover:bg-yellow-200 focus:outline-none transition"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <span className="block w-6 h-0.5 bg-yellow-500 rounded mb-1"></span>
            <span className="block w-6 h-0.5 bg-yellow-500 rounded mb-1"></span>
            <span className="block w-6 h-0.5 bg-yellow-500 rounded"></span>
          </button>
          <span className="font-extrabold text-yellow-600 text-lg md:text-2xl select-none">
            GSAI Admin Dashboard
          </span>
          <div className="w-8 h-8 md:w-11 md:h-11 rounded-full bg-yellow-200 flex items-center justify-center shadow-inner border border-yellow-300">
            <img src="/favicon.ico" alt="Avatar" className="w-6 h-6 md:w-10 md:h-10 object-cover rounded-full" />
          </div>
        </div>
        {/* Page content */}
        <main className="flex-1 px-2 xs:px-3 sm:px-6 py-2 md:py-6 bg-transparent min-h-[80vh] transition-all">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
