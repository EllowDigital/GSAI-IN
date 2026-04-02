import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  BadgeDollarSign,
  BookOpen,
  Newspaper,
  Image as GalleryIcon,
  Users,
  Calendar,
  LogOut,
  Globe,
  Trophy,
  MessageSquare,
  X,
  Swords,
  Megaphone,
  UserPlus,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Search,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { useAdminAuth } from '@/pages/admin/AdminAuthProvider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { title: 'Dashboard', url: '/admin/dashboard', icon: Home, category: 'main' },
  {
    title: 'Enrollments',
    url: '/admin/dashboard/enrollments',
    icon: UserPlus,
    category: 'manage',
  },
  {
    title: 'Students',
    url: '/admin/dashboard/students',
    icon: Users,
    category: 'manage',
  },
  {
    title: 'Fees',
    url: '/admin/dashboard/fees',
    icon: BadgeDollarSign,
    category: 'manage',
  },
  {
    title: 'Progression',
    url: '/admin/dashboard/progression',
    icon: Trophy,
    category: 'manage',
  },
  {
    title: 'Disciplines',
    url: '/admin/dashboard/disciplines',
    icon: Dumbbell,
    category: 'manage',
  },
  {
    title: 'Events',
    url: '/admin/dashboard/events',
    icon: Calendar,
    category: 'content',
  },
  {
    title: 'Competitions',
    url: '/admin/dashboard/competitions',
    icon: Swords,
    category: 'content',
  },
  {
    title: 'Blogs',
    url: '/admin/dashboard/blogs',
    icon: BookOpen,
    category: 'content',
  },
  {
    title: 'News',
    url: '/admin/dashboard/news',
    icon: Newspaper,
    category: 'content',
  },
  {
    title: 'Gallery',
    url: '/admin/dashboard/gallery',
    icon: GalleryIcon,
    category: 'content',
  },
  {
    title: 'Testimonials',
    url: '/admin/dashboard/testimonials',
    icon: MessageSquare,
    category: 'content',
  },
  {
    title: 'Announcements',
    url: '/admin/dashboard/announcements',
    icon: Megaphone,
    category: 'content',
  },
];

interface AppSidebarProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}

function NavSection({
  label,
  items,
  setOpen,
  collapsed,
}: {
  label: string;
  items: typeof navItems;
  setOpen?: (open: boolean) => void;
  collapsed?: boolean;
}) {
  return (
    <div className="mb-1">
      {!collapsed && (
        <p className="px-3 py-1.5 text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-[0.12em]">
          {label}
        </p>
      )}
      {collapsed && (
        <div className="mx-auto my-1.5 w-6 border-t border-sidebar-border/30" />
      )}
      <ul className="space-y-0.5 px-2">
        {items.map(({ title, url, icon: Icon }) => {
          const link = (
            <NavLink
              to={url}
              end
              onClick={() => {
                if (window.innerWidth < 1024 && setOpen) setOpen(false);
              }}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-2.5 rounded-lg text-[13px] font-medium transition-all duration-150',
                  collapsed ? 'justify-center p-2.5' : 'px-3 py-2',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )
              }
            >
              <Icon
                className={cn(
                  'flex-shrink-0',
                  collapsed ? 'w-[18px] h-[18px]' : 'w-4 h-4'
                )}
              />
              {!collapsed && <span className="truncate">{title}</span>}
            </NavLink>
          );

          if (collapsed) {
            return (
              <li key={title}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" className="text-xs font-medium">
                    {title}
                  </TooltipContent>
                </Tooltip>
              </li>
            );
          }
          return <li key={title}>{link}</li>;
        })}
      </ul>
    </div>
  );
}

export function AppSidebar({
  open = false,
  setOpen,
  collapsed = false,
  setCollapsed,
}: AppSidebarProps) {
  const { signOut } = useAdminAuth();

  return (
    <TooltipProvider>
      <nav
        className={cn(
          'fixed left-0 top-0 z-50 h-dvh bg-sidebar border-r border-sidebar-border transform transition-all duration-200 ease-out flex flex-col',
          // Mobile behavior
          open ? 'translate-x-0' : '-translate-x-full',
          // Desktop behavior
          'lg:translate-x-0 lg:static',
          // Width
          collapsed ? 'w-[60px]' : 'w-[240px]'
        )}
        aria-label="Sidebar"
      >
        {/* Mobile close */}
        {setOpen && (
          <button
            className="lg:hidden absolute top-3 right-3 p-1.5 rounded-md hover:bg-sidebar-accent transition-colors z-10"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4 text-sidebar-foreground/60" />
          </button>
        )}

        {/* Logo */}
        <div
          className={cn(
            'flex items-center border-b border-sidebar-border flex-shrink-0 h-14',
            collapsed ? 'justify-center px-2' : 'gap-3 px-4'
          )}
        >
          <img
            src="/assets/images/logo.webp"
            alt="Logo"
            className="w-8 h-8 object-contain rounded-lg"
          />
          {!collapsed && (
            <div className="min-w-0">
              <span className="text-sm font-bold text-sidebar-foreground tracking-tight">
                GSAI Admin
              </span>
              <p className="text-[10px] text-sidebar-foreground/40 leading-none">
                Management Portal
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="py-3 space-y-1">
            <NavSection
              label="Overview"
              items={navItems.filter((i) => i.category === 'main')}
              setOpen={setOpen}
              collapsed={collapsed}
            />
            <NavSection
              label="Management"
              items={navItems.filter((i) => i.category === 'manage')}
              setOpen={setOpen}
              collapsed={collapsed}
            />
            <NavSection
              label="Content"
              items={navItems.filter((i) => i.category === 'content')}
              setOpen={setOpen}
              collapsed={collapsed}
            />
          </div>
        </ScrollArea>

        {/* Footer */}
        <div
          className={cn(
            'border-t border-sidebar-border flex-shrink-0',
            collapsed ? 'p-1.5 space-y-1' : 'p-3 space-y-1.5'
          )}
        >
          {/* Collapse toggle - desktop only */}
          {setCollapsed && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className={cn(
                    'hidden lg:flex items-center gap-2 text-[12px] font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors',
                    collapsed
                      ? 'justify-center p-2.5 w-full'
                      : 'px-3 py-2 w-full'
                  )}
                >
                  {collapsed ? (
                    <PanelLeft className="w-4 h-4" />
                  ) : (
                    <>
                      <PanelLeftClose className="w-4 h-4" />
                      <span>Collapse</span>
                    </>
                  )}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="text-xs">
                  Expand sidebar
                </TooltipContent>
              )}
            </Tooltip>
          )}

          {/* Website link */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => window.open('/', '_blank')}
                className={cn(
                  'flex items-center gap-2 text-[12px] font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors',
                  collapsed ? 'justify-center p-2.5 w-full' : 'px-3 py-2 w-full'
                )}
              >
                <Globe className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>View Website</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="text-xs">
                View Website
              </TooltipContent>
            )}
          </Tooltip>

          {/* Sign out */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => signOut()}
                className={cn(
                  'flex items-center gap-2 text-[12px] font-medium text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors',
                  collapsed ? 'justify-center p-2.5 w-full' : 'px-3 py-2 w-full'
                )}
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>Sign Out</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="text-xs">
                Sign Out
              </TooltipContent>
            )}
          </Tooltip>

          {!collapsed && (
            <p className="text-[9px] text-sidebar-foreground/25 text-center pt-1">
              v1.0.0 · EllowDigital
            </p>
          )}
        </div>
      </nav>
    </TooltipProvider>
  );
}
