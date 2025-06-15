import React, { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthProvider";
import { LogOut, Home, BookOpen, Newspaper, Image, Users, ChevronUp, BadgeDollarSign, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";

// Route tabs
const navPages = [
  { path: "/admin/dashboard", label: "Dashboard", icon: <Home /> },
  { path: "/admin/dashboard/fees", label: "Fees", icon: <BadgeDollarSign /> },
  { path: "/admin/dashboard/FeeRLSTest", label: "Fee RLS Test", icon: <FlaskConical /> },
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
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= SIDEBAR_COLLAPSE_WIDTH);
  const location = useLocation();

  // Responsive sidebar
  React.useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= SIDEBAR_COLLAPSE_WIDTH);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    <div className="min-h-screen w-full bg-[#f8fafc] font-montserrat flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-56" : "w-0"
        } transition-all duration-200 bg-white shadow-lg rounded-2xl my-4 ml-4 flex flex-col overflow-hidden sticky top-0 h-fit`}
        style={{ minHeight: "90vh" }}
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="m-2 md:hidden self-end text-gray-600 bg-yellow-100 hover:bg-yellow-300 rounded-full p-2 shadow"
          aria-label="Toggle sidebar"
        >
          <span className="sr-only">Toggle Sidebar</span>☰
        </button>
        {sidebarOpen && (
          <nav className="flex flex-col py-4 gap-1">
            <h3 className="text-lg font-bold px-6 mb-6 mt-2 text-yellow-400">GSAI Admin</h3>
            {navPages.map((page) => (
              <NavLink
                to={page.path}
                key={page.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-6 py-2 rounded-md hover:bg-yellow-100 font-semibold ${
                    isActive || location.pathname === page.path ? "bg-yellow-300 text-black shadow" : "text-gray-700"
                  }`
                }
              >
                {page.icon}
                <span>{page.label}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white shadow-lg rounded-2xl mx-4 mt-4 px-4 py-2 flex items-center justify-between">
          <h2 className="font-bold text-xl text-yellow-400">Admin Dashboard</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={signOut}
            className="flex items-center gap-2 rounded-full"
          >
            <LogOut size={18} /> Logout
          </Button>
        </header>
        <section className="px-4 py-6 flex-1">
          <Outlet />
        </section>
        <BackToTopButton />
      </main>
    </div>
  );
};

export default AdminLayout;
