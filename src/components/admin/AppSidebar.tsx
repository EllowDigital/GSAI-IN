
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
} from "@/components/ui/sidebar";
import {
  Home,
  BadgeDollarSign,
  BookOpen,
  Newspaper,
  Image,
  Users,
  LogOut,
} from "lucide-react";
import { useLocation, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/pages/admin/AdminAuthProvider";

export function AppSidebar() {
  const location = useLocation();
  const { signOut } = useAdminAuth();

  const items = [
    { title: "Dashboard", url: "/admin/dashboard", icon: Home },
    { title: "Fees", url: "/admin/dashboard/fees", icon: BadgeDollarSign },
    { title: "Blogs", url: "/admin/dashboard/blogs", icon: BookOpen },
    { title: "News", url: "/admin/dashboard/news", icon: Newspaper },
    { title: "Gallery", url: "/admin/dashboard/gallery", icon: Image },
    { title: "Students", url: "/admin/dashboard/students", icon: Users },
  ];

  return (
    <Sidebar variant="sidebar">
      <SidebarHeader className="mt-2 px-4">
        <span className="text-lg font-bold text-yellow-400 tracking-tight font-montserrat">
          GSAI Admin
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#f59e42] font-semibold">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <NavLink to={item.url} className="flex items-center gap-2">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mt-auto px-4 pb-6 flex flex-col items-stretch gap-3">
        <Button
          variant="destructive"
          size="sm"
          onClick={signOut}
          className="flex items-center gap-2 w-full rounded-full text-base font-semibold"
        >
          <LogOut size={18} /> Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
