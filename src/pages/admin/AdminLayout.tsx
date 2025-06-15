
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
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

  // Main responsive layout
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-gradient-to-br from-yellow-50/70 via-white to-yellow-100 font-montserrat">
        <AppSidebar />
        <main
          className="flex-1 flex flex-col min-w-0 max-w-full bg-white/90 rounded-2xl m-2 md:mx-4 md:my-4 shadow-2xl border border-yellow-100"
          style={{ minHeight: "100svh" }}
        >
          <AdminTopbar />
          <section className="px-1 sm:px-2 md:px-5 xl:px-12 py-3 md:py-6 flex-1 w-full max-w-full lg:max-w-7xl xl:mx-auto transition-all duration-300">
            <Outlet />
          </section>
          <AdminBackToTopButton />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
