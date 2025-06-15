import React, { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthProvider";
import { LogOut, Home, BookOpen, Newspaper, Image, Users, ChevronUp, BadgeDollarSign, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/AppSidebar";

// Route tabs
const navPages = [
  { path: "/admin/dashboard", label: "Dashboard", icon: <Home /> },
  { path: "/admin/dashboard/fees", label: "Fees", icon: <BadgeDollarSign /> },
  { path: "/admin/dashboard/blogs", label: "Blogs", icon: <BookOpen /> },
  { path: "/admin/dashboard/news", label: "News", icon: <Newspaper /> },
  { path: "/admin/dashboard/gallery", label: "Gallery", icon: <Image /> },
  { path: "/admin/dashboard/students", label: "Students", icon: <Users /> },
];

const SIDEBAR_COLLAPSE_WIDTH = 768; // md

function BackToTopButton() {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const listener = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", listener);
    return () => window.removeEventListener("scroll", listener);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 bg-yellow-300 hover:bg-yellow-400 rounded-full shadow-lg p-2 z-50"
      aria-label="Back to Top"
    >
      <ChevronUp className="text-black" />
    </button>
  );
}

const AdminLayout: React.FC = () => {
  const { isAdmin, signOut, isLoading } = useAdminAuth();
  const location = useLocation();

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
      <div className="min-h-screen flex w-full bg-[#f8fafc] font-montserrat">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <header className="sticky top-0 z-30 bg-white shadow-lg rounded-2xl mx-2 md:mx-4 mt-2 md:mt-4 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:hidden mr-2" />
              <h2 className="font-bold text-xl text-yellow-400">Admin Dashboard</h2>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={signOut}
              className="flex items-center gap-2 rounded-full hidden md:flex"
            >
              <LogOut size={18} /> Logout
            </Button>
          </header>
          <section className="px-2 md:px-4 py-4 md:py-6 flex-1 w-full max-w-full">
            <Outlet />
          </section>
          <BackToTopButton />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
