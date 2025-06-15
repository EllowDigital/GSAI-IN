import React from "react";
import { Outlet } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthProvider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/AppSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminBackToTopButton from "@/components/admin/AdminBackToTopButton";

/**
 * Admin Layout with fully responsive sidebar:
 * - Sidebar is sticky and flush left, with max height and scrollable if needed.
 * - Uses Flexbox for app shell.
 * - Sidebar overlays as a drawer on mobile.
 * - Main content adapts and has consistent padding.
 */
const AdminLayout: React.FC = () => {
  const { isAdmin, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-10 w-10 border-4 border-yellow-400 rounded-full border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <div className="rounded-2xl shadow-lg p-6 bg-white text-gray-700 max-w-xs w-full flex flex-col items-center">
          <span className="text-lg font-semibold">Access Denied</span>
          <span className="mb-4 text-sm text-muted-foreground">You are not authorized to view this page.</span>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="
        min-h-screen w-full flex flex-row bg-gradient-to-br from-yellow-50/70 via-white to-yellow-100 font-montserrat
        overflow-hidden
      ">
        {/* Sidebar: sticky, flush left, scrollable if needed */}
        <aside className="
          hidden md:flex sticky top-0 z-30 h-screen min-h-screen
        ">
          <AppSidebar />
        </aside>
        {/* Mobile sidebar/hamburger trigger: show only on mobile */}
        <div className="md:hidden fixed top-3 left-3 z-40">
          <SidebarTrigger />
        </div>
        {/* Main content area */}
        <main
          className="
            flex-1 min-w-0 max-w-full flex flex-col
            m-0 md:m-4 rounded-none md:rounded-2xl bg-white/90 shadow-2xl border border-yellow-100
            min-h-screen
            transition-all
            overflow-x-auto
          "
        >
          <AdminTopbar />
          <section
            className="
              flex-1 w-full max-w-full
              px-2 sm:px-3 md:px-5 xl:px-12 py-3 md:py-6 
              xl:mx-auto
              flex flex-col gap-4
              transition-all duration-300
            "
          >
            <Outlet />
          </section>
          <AdminBackToTopButton />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
