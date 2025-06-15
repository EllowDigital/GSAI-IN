import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  BadgeDollarSign,
  BookOpen,
  Newspaper,
  Image as GalleryIcon,
  Users,
  Calendar,
  LogOut,
} from "lucide-react";
import { useAdminAuth } from "@/pages/admin/AdminAuthProvider";

// Modern sidebar nav items
const navItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: Home },
  { title: "Fees", url: "/admin/dashboard/fees", icon: BadgeDollarSign },
  { title: "Blogs", url: "/admin/dashboard/blogs", icon: BookOpen },
  { title: "News", url: "/admin/dashboard/news", icon: Newspaper },
  { title: "Gallery", url: "/admin/dashboard/gallery", icon: GalleryIcon },
  { title: "Students", url: "/admin/dashboard/students", icon: Users },
  { title: "Events", url: "/admin/dashboard/events", icon: Calendar },
];

interface AppSidebarProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export function AppSidebar({ open = false, setOpen }: AppSidebarProps) {
  const location = useLocation();
  const { signOut } = useAdminAuth();

  // Hide sidebar on mobile unless open
  return (
    <nav
      className={`
        fixed left-0 top-0 z-50 h-screen
        bg-gradient-to-b from-yellow-200/80 via-yellow-50 to-white
        shadow-lg border-r border-yellow-200
        w-4/5 max-w-xs transform
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:w-64 md:max-w-none md:translate-x-0 md:static md:block
        flex flex-col
      `}
      style={{ minWidth: "15rem", maxWidth: "18rem" }}
      aria-label="Sidebar"
    >
      {/* Header */}
      <div className="flex flex-col items-center pt-8 pb-2 gap-3 select-none">
        <img
          src="/favicon.ico"
          alt="Logo"
          className="w-12 h-12 rounded-full border-2 border-yellow-400 shadow-md"
        />
        <span className="text-[1.35rem] font-bold text-yellow-600">GSAI Admin</span>
        <span className="text-xs font-bold text-gray-400">Professional Panel</span>
      </div>
      {/* Nav */}
      <div className="flex-1 mt-2 px-2 overflow-y-auto custom-scroll">
        <ul className="space-y-1">
          {navItems.map(({ title, url, icon: Icon }) => (
            <li key={title}>
              <NavLink
                to={url}
                onClick={() => {
                  // Close sidebar on mobile after nav click
                  if (window.innerWidth < 768 && setOpen) setOpen(false);
                }}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg gap-3 transition-all font-medium
                   hover:bg-yellow-100/80 ${
                     isActive
                       ? "bg-yellow-100 text-yellow-800"
                       : "text-gray-700"
                   }`
                }
              >
                <Icon className="w-6 h-6 text-yellow-400" />
                <span className="truncate">{title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      {/* Footer */}
      <div className="py-5 px-4 flex flex-col gap-2 border-t border-yellow-100">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2 bg-red-500 font-bold text-white px-4 py-2 rounded-full shadow hover:bg-red-600 focus:outline-none transition-all"
        >
          <LogOut size={18} /> Logout
        </button>
        <span className="mt-1 text-[11px] text-gray-400 text-center select-none">© 2025 GSAI Dashboard</span>
      </div>
    </nav>
  );
}
