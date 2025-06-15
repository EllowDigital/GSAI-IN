
import React from "react";
import { Outlet } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthProvider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/AppSidebar";
import AdminBackToTopButton from "@/components/admin/AdminBackToTopButton";

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

const AdminLayout: React.FC = () => {
  const { isAdmin, isLoading } = useAdminAuth();

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Disable body scroll on mobile sidebar open
  React.useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

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

  // Custom handler for closing sidebar after nav click on mobile - passed down
  const handleSidebarNav = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  return (
    <SidebarProvider>
      <div
        className="
          min-h-screen w-full flex flex-row bg-gradient-to-br from-yellow-50/70 via-white to-yellow-100 font-montserrat
          overflow-hidden
        "
      >
        {/* Mobile: Hamburger */}
        <button
          className="
            md:hidden fixed top-4 left-4 z-50 bg-white/80 rounded-full shadow-lg
            p-2 border border-yellow-300 flex items-center justify-center hover:bg-yellow-100 transition
          "
          aria-label="Open sidebar"
          onClick={() => setSidebarOpen(true)}
        >
          {/* Hamburger icon */}
          <div className="flex flex-col w-6 h-6 justify-center items-center">
            <span className="block w-6 h-0.5 bg-yellow-500 rounded transition mb-1"></span>
            <span className="block w-6 h-0.5 bg-yellow-500 rounded transition mb-1"></span>
            <span className="block w-6 h-0.5 bg-yellow-500 rounded transition"></span>
          </div>
        </button>
        {/* Sidebar: HIDES on mobile, slides in, overlay */}
        {/* Desktop: Always visible fixed */}
        {/* Overlay on mobile */}
        <DrawerOverlay isOpen={sidebarOpen} onClick={() => setSidebarOpen(false)} />
        <aside
          className={`
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0
            transition-transform duration-300
            fixed top-0 left-0 z-50
            h-full
            bg-white md:bg-transparent
            w-[${SIDEBAR_WIDTH}]
          `}
          style={{
            width: SIDEBAR_WIDTH,
            boxShadow: '0 8px 40px 0 rgba(145,130,58,0.18)',
          }}
        >
          <AppSidebar onNavClick={handleSidebarNav} />
        </aside>
        {/* Main content: has left margin == sidebar width, so it never underlaps */}
        <main
          className="
            flex-1 min-w-0 max-w-full flex flex-col
            m-0 md:m-4 rounded-none md:rounded-2xl bg-white/90 shadow-2xl border border-yellow-100
            min-h-screen
            transition-all
            overflow-x-auto
          "
          style={{
            marginLeft: undefined,
            paddingLeft: undefined,
            ...(window.innerWidth >= 768 ? { marginLeft: SIDEBAR_WIDTH } : {}),
          }}
        >
          {/* AdminTopbar removed */}
          <section
            className="
              flex-1 w-full max-w-full
              px-2 sm:px-3 md:px-5 xl:px-12 py-3 md:py-6 
              xl:mx-auto
              flex flex-col gap-4
              transition-all duration-300
              overflow-y-auto
            "
            style={{
              minHeight: "calc(100vh - 56px)",
            }}
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
