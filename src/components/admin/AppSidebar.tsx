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
  Trophy,
  MessageSquare,
  X,
  Swords,
  Megaphone,
  UserPlus,
  Dumbbell,
  ChevronsLeft,
  ChevronsRight,
  Info,
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
  {
    title: 'About',
    url: '/admin/dashboard/about',
    icon: Info,
    category: 'about',
  },
];

interface AppSidebarProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}

function FooterAction({
  collapsed,
  onClick,
  icon: Icon,
  label,
  tone = 'default',
}: {
  collapsed: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone?: 'default' | 'danger';
}) {
  const baseTone =
    tone === 'danger'
      ? 'text-destructive/80 hover:text-destructive hover:bg-destructive/10'
      : 'text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent';

  const button = (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center rounded-lg text-[12px] font-medium transition-colors',
        baseTone,
        collapsed ? 'justify-center p-2.5' : 'gap-2 px-3 py-2'
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!collapsed && <span>{label}</span>}
    </button>
  );

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      {collapsed && (
        <TooltipContent side="right" className="text-xs">
          {label}
        </TooltipContent>
      )}
    </Tooltip>
  );
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
    <div className="mb-2">
      {!collapsed && (
        <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold text-sidebar-foreground/45 uppercase tracking-[0.14em]">
          {label}
        </p>
      )}
      {collapsed && (
        <div className="mx-auto my-2 w-5 border-t border-sidebar-border/35" />
      )}
      <ul className="space-y-1 px-2">
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
                  'group flex w-full items-center rounded-lg text-[13px] font-medium transition-all duration-150',
                  collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2.5',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )
              }
            >
              <span
                className={cn(
                  'inline-flex flex-shrink-0 items-center justify-center rounded-md',
                  collapsed
                    ? 'h-8 w-8 bg-sidebar-accent/70 group-hover:bg-sidebar-accent'
                    : 'h-5 w-5'
                )}
              >
                <Icon
                  className={cn(
                    'flex-shrink-0',
                    collapsed
                      ? 'h-[18px] w-[18px] text-sidebar-foreground'
                      : 'h-4 w-4'
                  )}
                />
              </span>
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
          collapsed ? 'w-[68px]' : 'w-[248px]'
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
            'flex h-14 flex-shrink-0 items-center border-b border-sidebar-border',
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
          <div className="space-y-1 py-3">
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
            <NavSection
              label="About"
              items={navItems.filter((i) => i.category === 'about')}
              setOpen={setOpen}
              collapsed={collapsed}
            />
          </div>
        </ScrollArea>

        {/* Footer */}
        <div
          className={cn(
            'border-t border-sidebar-border flex-shrink-0',
            collapsed ? 'space-y-1 p-2' : 'space-y-1.5 p-3'
          )}
        >
          {/* Collapse toggle - desktop only */}
          {setCollapsed && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className={cn(
                    'hidden lg:flex items-center rounded-lg text-[12px] font-medium text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors',
                    collapsed
                      ? 'h-10 w-full justify-center'
                      : 'w-full gap-2 px-3 py-2'
                  )}
                >
                  {collapsed ? (
                    <ChevronsRight className="h-4 w-4" />
                  ) : (
                    <>
                      <ChevronsLeft className="h-4 w-4" />
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

          <FooterAction
            collapsed={collapsed}
            onClick={() => window.open('/', '_blank')}
            icon={Globe}
            label="View Website"
          />

          <FooterAction
            collapsed={collapsed}
            onClick={() => signOut()}
            icon={LogOut}
            label="Sign Out"
            tone="danger"
          />

          {!collapsed && (
            <p className="text-[9px] text-sidebar-foreground/25 text-center pt-1">
              v2.4.0 · EllowDigital
            </p>
          )}
        </div>
      </nav>
    </TooltipProvider>
  );
}
