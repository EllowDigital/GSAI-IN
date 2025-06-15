
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

export function AppSidebar() {
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

  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar
      variant="sidebar"
      className={`
        fixed md:static left-0 top-0 bottom-0
        h-full md:h-auto
        bg-gradient-to-b from-yellow-100/80 to-white
        border-r border-yellow-200 shadow-xl
        md:rounded-tr-3xl
        min-h-screen md:min-h-[calc(100vh-2rem)]
        w-72
        z-30
        flex-shrink-0
        transition-all duration-300
        flex flex-col
        pt-4
        px-0
        md:pt-4
        md:px-0
        overflow-y-auto
      `}
      style={{
        boxShadow: "0 6px 32px 0 rgba(245, 181, 66, 0.13)",
      }}
    >
      <SidebarHeader className="mb-4 px-6 flex flex-col items-center justify-center">
        <div className="rounded-full bg-yellow-50 shadow-lg p-2 mb-2">
          <img src="/favicon.ico" alt="Logo" className="w-12 h-12 drop-shadow-xl" />
        </div>
        <span className="text-2xl font-extrabold text-yellow-500 tracking-tight font-montserrat text-center select-none drop-shadow">
          GSAI Admin
        </span>
        <span className="text-[13px] mt-0.5 text-gray-500 font-semibold">Professional Dashboard</span>
      </SidebarHeader>
      <SidebarContent className="flex-1 px-0 md:px-2 pb-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-yellow-600/90 font-bold text-xs pl-6 pt-0 mb-2 uppercase tracking-wider">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className={`
                      rounded-xl font-semibold tracking-tight
                      text-gray-700 hover:bg-yellow-200/70 focus-visible:ring-yellow-400
                      data-[active=true]:bg-yellow-300/80 data-[active=true]:shadow-md
                      group px-4 py-2 w-full flex items-center gap-3
                      text-base
                      transition-all duration-200
                    `}
                    onClick={handleNavClick}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3 w-full">
                      <item.icon className="w-6 h-6 text-yellow-400 group-data-[active=true]:text-yellow-600 transition-colors drop-shadow" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mt-auto px-6 pb-8 flex flex-col items-stretch gap-3">
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
      {/* Decorative vertical bar accent */}
      <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-yellow-400 via-yellow-200 to-yellow-50 rounded-tr-3xl rounded-br-2xl opacity-90 pointer-events-none shadow" aria-hidden />
    </Sidebar>
  );
}
