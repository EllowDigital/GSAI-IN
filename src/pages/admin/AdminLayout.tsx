
import React from "react";
import { Outlet } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/AppSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminBackToTopButton from "@/components/admin/AdminBackToTopButton";

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

  // Improved layout: always flexbox, sidebar always flush-left and at the very top
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-row bg-gradient-to-br from-yellow-50/70 via-white to-yellow-100 font-montserrat">
        {/* Sidebar: fixed width on desktop, overlays on mobile */}
        <AppSidebar />
        {/* Main content: full height, no overlap or push-down, responsive max widths */}
        <main
          className="flex-1 min-w-0 max-w-full flex flex-col m-1 md:m-4 rounded-2xl bg-white/90 shadow-2xl border border-yellow-100"
          style={{ minHeight: "100svh" }}
        >
          <AdminTopbar />
          <section className="flex-1 w-full max-w-full lg:max-w-7xl xl:mx-auto px-1 sm:px-2 md:px-5 xl:px-12 py-3 md:py-6 transition-all duration-300">
            <Outlet />
          </section>
          <AdminBackToTopButton />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
