import React from 'react';
import { NavLink } from 'react-router-dom';
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
  GitBranch,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAdminAuth } from '@/pages/admin/AdminAuthProvider';
import { cn } from '@/lib/utils';

const navItems = [
  {
    title: 'Homepage',
    url: '/',
    icon: Globe,
    category: 'external',
    signOutFirst: true,
  },
  { title: 'Dashboard', url: '/admin/dashboard', icon: Home, category: 'main' },
  {
    title: 'Fees',
    url: '/admin/dashboard/fees',
    icon: BadgeDollarSign,
    category: 'management',
  },
  {
    title: 'Students',
    url: '/admin/dashboard/students',
    icon: Users,
    category: 'management',
  },
  {
    title: 'Events',
    url: '/admin/dashboard/events',
    icon: Calendar,
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
];

interface AppSidebarProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export function AppSidebar({ open = false, setOpen }: AppSidebarProps) {
  const { signOut } = useAdminAuth();
  const APP_VERSION = '1.6.4'; // Increment this version whenever the entire project code is updated

  const NavSection = ({
    title,
    items,
  }: {
    title: string;
    items: typeof navItems;
  }) => (
    <div className="space-y-3">
      <h3 className="px-2 text-xs font-bold text-sidebar-foreground/60 uppercase tracking-wider">
        {title}
      </h3>
      <ul className="space-y-1">
        {items.map(({ title, url, icon: Icon, signOutFirst }) => (
          <li key={title}>
            {title === 'Homepage' ? (
              <button
                onClick={() => {
                  signOut();
                  window.location.href = '/';
                }}
                className="group flex w-full items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 hover:bg-sidebar-accent/80 hover:shadow-md text-left text-sidebar-foreground/80 hover:text-sidebar-foreground focus-visible-ring"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-sidebar-accent group-hover:bg-primary/20 transition-colors duration-200 flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm truncate">
                    {title}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
              </button>
            ) : (
              <NavLink
                to={url}
                end
                onClick={() => {
                  if (window.innerWidth < 1024 && setOpen) setOpen(false);
                }}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm focus-visible-ring',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg border border-sidebar-primary/20'
                      : 'hover:bg-sidebar-accent/80 hover:shadow-md text-sidebar-foreground/80 hover:text-sidebar-foreground'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          'p-2 rounded-lg transition-colors duration-200 flex-shrink-0',
                          isActive
                            ? 'bg-sidebar-primary-foreground/20'
                            : 'bg-sidebar-accent group-hover:bg-primary/20'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="truncate">
                        {title}
                      </span>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-sidebar-primary-foreground/60 flex-shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <nav
      className={cn(
        'fixed left-0 top-0 z-50 h-full bg-sidebar-background shadow-2xl border-r border-sidebar-border transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:shadow-none flex flex-col min-h-screen',
        open ? 'translate-x-0' : '-translate-x-full',
        'w-[280px] sm:w-[300px] lg:w-72 max-w-[85vw] sm:max-w-[80vw] lg:max-w-none'
      )}
      aria-label="Sidebar"
    >
      {/* Mobile Close Button */}
      {setOpen && (
        <button
          className="lg:hidden absolute top-4 right-4 p-2 rounded-xl bg-sidebar-accent hover:bg-sidebar-accent/80 transition-colors z-10 shadow-sm focus-visible-ring"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4 text-sidebar-foreground" />
        </button>
      )}

      {/* Enhanced Header */}
      <div className="glass-header border-b border-sidebar-border p-6 space-y-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <img
              src="/assets/img/logo.webp"
              alt="GSAI Logo"
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-xl shadow-lg"
              loading="lazy"
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-sidebar-background shadow-sm animate-pulse" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-sidebar-foreground">
              GSAI Admin
            </h2>
            <p className="text-sm text-sidebar-foreground/70">
              Management Portal
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <div className="flex-1 py-6 px-4 overflow-y-auto space-y-6">
        <NavSection
          title="Overview"
          items={navItems.filter((i) => i.category === 'main')}
        />
        <NavSection
          title="Management"
          items={navItems.filter((i) => i.category === 'management')}
        />
        <NavSection
          title="Content"
          items={navItems.filter((i) => i.category === 'content')}
        />
        <NavSection
          title="External"
          items={navItems.filter((i) => i.category === 'external')}
        />
      </div>

      {/* Enhanced Footer */}
      <div className="p-4 border-t border-sidebar-border glass-header space-y-4">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-error to-error/90 hover:from-error/90 hover:to-error text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl focus-visible-ring transition-all duration-200 font-semibold text-sm interactive-button"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
        
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-sidebar-foreground/50">
            <span>© 2025 GSAI</span>
            <span className="text-sidebar-foreground/30">•</span>
            <div
              className="flex items-center gap-1 hover:text-sidebar-foreground/70 transition-colors duration-200 cursor-pointer"
              title={`Version ${APP_VERSION}`}
            >
              <GitBranch className="w-3 h-3" />
              <span>v{APP_VERSION}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
