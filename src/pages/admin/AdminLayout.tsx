import React from "react";
import { Outlet } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/AppSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminBackToTopButton from "@/components/admin/AdminBackToTopButton";

/**
 * AdminLayout is responsible for rendering the sidebar and dashboard content.
 * Ensures the sidebar is always fixed to the left on desktop,
 * overlays on mobile, and main content fills remaining space.
 */
const AdminLayout: React.FC = () => {
  const { isAdmin, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-white to-yellow-200">
        <div className="animate-spin h-10 w-10 border-4 border-yellow-400 rounded-full border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-white to-yellow-200">
        <div className="rounded-2xl shadow-lg p-6 bg-white text-gray-700 max-w-xs w-full flex flex-col items-center">
          <span className="text-lg font-semibold">Access Denied</span>
          <span className="mb-4 text-sm text-muted-foreground">You are not authorized to view this page.</span>
        </div>
      </div>
    );
  }

  // Dashboard layout and decorations
  return (
    <SidebarProvider>
      <div className="relative min-h-screen w-full font-montserrat flex bg-gradient-to-tr from-yellow-50 via-white/60 to-yellow-100 transition-all duration-300 overflow-hidden">
        {/* Decorative background circles */}
        <div className="absolute -left-28 -top-28 md:left-0 md:top-0 w-72 h-72 md:w-64 md:h-64 bg-yellow-100 rounded-full blur-3xl opacity-60 -z-10 pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-[34rem] h-[34rem] bg-gradient-to-br from-yellow-200 via-yellow-100 to-white rounded-full blur-3xl opacity-40 -z-10 pointer-events-none" />

        {/* Sidebar: Always on the left, full height on desktop, overlays on mobile */}
        <AppSidebar />

        {/* Main Content Area */}
        <main
          className={`
            flex-1 flex flex-col min-w-0 max-w-full
            bg-white/90 rounded-none md:rounded-2xl
            m-0 md:m-4 
            shadow-2xl border border-yellow-100 backdrop-blur-lg
            z-10 relative
            transition-all duration-300
          `}
          style={{ minHeight: "100svh" }}
        >
          <AdminTopbar />
          <section className="px-2 sm:px-4 md:px-8 xl:px-16 py-4 md:py-7 flex-1 w-full max-w-full lg:max-w-7xl xl:mx-auto transition-all duration-300">
            <Outlet />
          </section>
          <AdminBackToTopButton />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
