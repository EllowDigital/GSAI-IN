
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  BadgeDollarSign,
  BookOpen,
  Newspaper,
  Image,
  Users,
  LogOut,
  Calendar,
} from "lucide-react";
import { useLocation, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/pages/admin/AdminAuthProvider";

// Accept an onNavClick prop to close sidebar on mobile nav
export function AppSidebar({ onNavClick }: { onNavClick?: () => void }) {
  const location = useLocation();
  const { signOut } = useAdminAuth();
  const { isMobile, setOpenMobile } = useSidebar();

  const items = [
    { title: "Dashboard", url: "/admin/dashboard", icon: Home },
    { title: "Fees", url: "/admin/dashboard/fees", icon: BadgeDollarSign },
    { title: "Blogs", url: "/admin/dashboard/blogs", icon: BookOpen },
    { title: "News", url: "/admin/dashboard/news", icon: Newspaper },
    { title: "Gallery", url: "/admin/dashboard/gallery", icon: Image },
    { title: "Students", url: "/admin/dashboard/students", icon: Users },
    { title: "Events", url: "/admin/dashboard/events", icon: Calendar },
  ];

  // On nav click: close mobile sidebar via both sidebar context and provided handler
  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
    if (typeof onNavClick === "function") onNavClick();
  };

  // Style to apply correct background and border in both desktop/mobile sidebar
  const sidebarBgClasses = "bg-gradient-to-b from-yellow-50 to-white border-r border-yellow-200 shadow-xl";

  return (
    <Sidebar
      variant="sidebar"
      // For mobile Sheet, SheetContent uses w-full so set width via style on SidebarContent below
      className={`md:rounded-tr-none rounded-tr-3xl w-64 md:min-w-[16rem] md:max-w-[16rem] h-full sticky top-0 left-0 flex flex-col overflow-y-auto ${sidebarBgClasses}`}
      style={{ minHeight: "100vh", maxHeight: "100vh" }}
    >
      <SidebarHeader className="mb-4 px-6 flex flex-col items-center justify-center">
        <img src="/favicon.ico" alt="Logo" className="w-11 h-11 mb-2 drop-shadow-lg" />
        <span className="text-xl font-extrabold text-yellow-500 tracking-tight font-montserrat text-center select-none">GSAI Admin</span>
        <span className="text-xs mt-0.5 text-gray-500 font-semibold">Professional Dashboard</span>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-0 w-full" style={{minWidth: "16rem", maxWidth: "16rem"}}>
        <SidebarGroup>
          <SidebarGroupLabel className="text-yellow-500 font-semibold pl-5 pt-2 mb-1">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className="transition-all rounded-lg font-semibold tracking-tight text-gray-700 hover:bg-yellow-100/80 data-[active=true]:bg-yellow-100 group"
                    onClick={handleNavClick}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3 px-2 py-2">
                      <item.icon className="w-6 h-6 text-yellow-400 group-data-[active=true]:text-yellow-600 transition-colors" />
                      <span className="text-base">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mt-auto px-6 pb-8 flex flex-col items-stretch gap-2">
        <Button
          variant="destructive"
          size="lg"
          onClick={signOut}
          className="flex items-center gap-2 w-full rounded-full text-base font-bold py-3 shadow-lg hover:bg-red-500 transition"
        >
          <LogOut size={20} /> Logout
        </Button>
        <span className="text-[11px] text-gray-400 mt-2 select-none text-center">© 2025 GSAI Dashboard</span>
      </SidebarFooter>
    </Sidebar>
  );
}

