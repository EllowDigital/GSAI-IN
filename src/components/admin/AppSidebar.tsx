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

// --- Static Data ---
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

// Pre-filter to avoid unnecessary recalculations on render
const NAV_GROUPS = {
  main: navItems.filter((i) => i.category === 'main'),
  manage: navItems.filter((i) => i.category === 'manage'),
  content: navItems.filter((i) => i.category === 'content'),
  about: navItems.filter((i) => i.category === 'about'),
};

// --- Types ---
interface AppSidebarProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}

interface FooterActionProps {
  collapsed: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone?: 'default' | 'danger';
  onClick?: () => void;
  href?: string;
}

// --- Subcomponents ---
function FooterAction({
  collapsed,
  onClick,
  href,
  icon: Icon,
  label,
  tone = 'default',
}: FooterActionProps) {
  const baseTone =
    tone === 'danger'
      ? 'text-destructive/80 hover:text-destructive hover:bg-destructive/10 focus-visible:ring-destructive/50'
      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent focus-visible:ring-sidebar-ring';

  const classes = cn(
    'flex w-full items-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
    baseTone,
    collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'
  );

  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </>
  );

  const trigger = href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={classes}
      aria-label={collapsed ? label : undefined}
    >
      {content}
    </a>
  ) : (
    <button
      onClick={onClick}
      className={classes}
      aria-label={collapsed ? label : undefined}
    >
      {content}
    </button>
  );

  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      {collapsed && (
        <TooltipContent side="right" className="text-xs font-medium">
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
  if (items.length === 0) return null;

  return (
    <div className="mb-4">
      {!collapsed ? (
        <p className="px-4 pb-2 pt-1 text-[11px] font-bold text-sidebar-foreground/50 uppercase tracking-wider">
          {label}
        </p>
      ) : (
        <div className="mx-auto mb-3 mt-1 w-6 border-t border-sidebar-border/50" />
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
                  'group flex w-full items-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                  collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'inline-flex shrink-0 items-center justify-center rounded-md transition-colors',
                      collapsed
                        ? 'h-8 w-8 bg-sidebar-accent/50 group-hover:bg-sidebar-accent'
                        : 'h-5 w-5'
                    )}
                  >
                    <Icon
                      className={cn(
                        'shrink-0 transition-colors',
                        collapsed
                          ? 'h-4 w-4 text-sidebar-foreground/70 group-hover:text-sidebar-foreground'
                          : 'h-4 w-4',
                        isActive &&
                          collapsed &&
                          'text-sidebar-primary-foreground'
                      )}
                    />
                  </span>
                  {!collapsed && <span className="truncate">{title}</span>}
                </>
              )}
            </NavLink>
          );

          if (collapsed) {
            return (
              <li key={title}>
                <Tooltip delayDuration={150}>
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

// --- Main Component ---
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
          'fixed left-0 top-0 z-50 flex h-dvh flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out',
          // Mobile behavior
          open ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
          // Desktop behavior
          'lg:static lg:translate-x-0 lg:shadow-none',
          // Width
          collapsed ? 'w-[72px]' : 'w-[260px]'
        )}
        aria-label="Main Navigation"
      >
        {/* Mobile close */}
        {setOpen && (
          <button
            className="absolute right-3 top-3 z-10 rounded-md p-1.5 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Logo Area */}
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b border-sidebar-border/60 transition-all',
            collapsed ? 'justify-center px-2' : 'gap-3 px-5'
          )}
        >
          <img
            src="/assets/images/logo.webp"
            alt="GSAI Logo"
            className="h-8 w-8 shrink-0 rounded-lg object-contain shadow-sm bg-white"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="truncate text-[15px] font-bold tracking-tight text-sidebar-foreground">
                GSAI Admin
              </span>
              <span className="truncate text-[10px] font-medium tracking-wider uppercase text-sidebar-foreground/50">
                Management Portal
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Navigation */}
        <ScrollArea className="flex-1 min-h-0 pt-4">
          <NavSection
            label="Overview"
            items={NAV_GROUPS.main}
            setOpen={setOpen}
            collapsed={collapsed}
          />
          <NavSection
            label="Management"
            items={NAV_GROUPS.manage}
            setOpen={setOpen}
            collapsed={collapsed}
          />
          <NavSection
            label="Content"
            items={NAV_GROUPS.content}
            setOpen={setOpen}
            collapsed={collapsed}
          />
          <NavSection
            label="System"
            items={NAV_GROUPS.about}
            setOpen={setOpen}
            collapsed={collapsed}
          />
        </ScrollArea>

        {/* Footer Area */}
        <div
          className={cn(
            'shrink-0 border-t border-sidebar-border/60 transition-all',
            collapsed ? 'p-2 space-y-1' : 'p-4 space-y-2'
          )}
        >
          {/* Desktop Collapse Toggle */}
          {setCollapsed && (
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className={cn(
                    'hidden lg:flex w-full items-center rounded-lg text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                    collapsed ? 'h-10 justify-center' : 'gap-2.5 px-3 py-2'
                  )}
                  aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {collapsed ? (
                    <ChevronsRight className="h-4 w-4 shrink-0" />
                  ) : (
                    <>
                      <ChevronsLeft className="h-4 w-4 shrink-0" />
                      <span>Collapse View</span>
                    </>
                  )}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="text-xs font-medium">
                  Expand sidebar
                </TooltipContent>
              )}
            </Tooltip>
          )}

          <FooterAction
            collapsed={collapsed}
            href="/" // Changed from onClick to href for better SEO/a11y
            icon={Globe}
            label="View Live Website"
          />

          <FooterAction
            collapsed={collapsed}
            onClick={() => signOut()}
            icon={LogOut}
            label="Secure Sign Out"
            tone="danger"
          />

          {!collapsed && (
            <div className="pt-2 text-center">
              <p className="text-[10px] font-medium tracking-wider text-sidebar-foreground/40 uppercase">
                v2.4.0 · EllowDigital
              </p>
            </div>
          )}
        </div>
      </nav>
    </TooltipProvider>
  );
}
