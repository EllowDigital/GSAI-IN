import React from 'react';
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
  GraduationCap,
  Megaphone,
  UserPlus,
  CalendarCheck,
} from 'lucide-react';
import { useAdminAuth } from '@/pages/admin/AdminAuthProvider';

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
    title: 'Attendance',
    url: '/admin/dashboard/attendance',
    icon: CalendarCheck,
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
}

function NavSection({
  label,
  items,
  setOpen,
}: {
  label: string;
  items: typeof navItems;
  setOpen?: (open: boolean) => void;
}) {
  return (
    <div>
      <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
        {label}
      </p>
      <ul className="space-y-0.5">
        {items.map(({ title, url, icon: Icon }) => (
          <li key={title}>
            <NavLink
              to={url}
              end
              onClick={() => {
                if (window.innerWidth < 1024 && setOpen) setOpen(false);
              }}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{title}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AppSidebar({ open = false, setOpen }: AppSidebarProps) {
  const { signOut } = useAdminAuth();
  const navigate = useNavigate();

  return (
    <nav
      className={`fixed left-0 top-0 z-50 h-full bg-card border-r border-border transform transition-transform duration-200 ease-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      } w-[240px] lg:translate-x-0 lg:static flex flex-col`}
      aria-label="Sidebar"
    >
      {setOpen && (
        <button
          className="lg:hidden absolute top-3 right-3 p-1.5 rounded-md hover:bg-muted transition-colors"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border flex-shrink-0">
        <img
          src="/assets/img/logo.webp"
          alt="Logo"
          className="w-8 h-8 object-contain"
        />
        <span className="text-sm font-bold text-foreground">GSAI Admin</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-2 overflow-y-auto space-y-4">
        <NavSection
          label="Overview"
          items={navItems.filter((i) => i.category === 'main')}
          setOpen={setOpen}
        />
        <NavSection
          label="Management"
          items={navItems.filter((i) => i.category === 'manage')}
          setOpen={setOpen}
        />
        <NavSection
          label="Content"
          items={navItems.filter((i) => i.category === 'content')}
          setOpen={setOpen}
        />
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-2">
        <button
          onClick={async () => {
            try {
              await signOut();
            } catch {
              navigate('/');
            }
          }}
          className="w-full flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          Go to Website
        </button>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20 px-3 py-2 rounded-lg transition-colors text-xs font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
        <div className="pt-2 border-t border-border/50 text-center">
          <p className="text-[10px] text-muted-foreground/60 font-medium">v1.0.0</p>
          <p className="text-[9px] text-muted-foreground/40 mt-0.5">
            Built by <span className="text-muted-foreground/60">Sarwan Yadav</span> · <span className="text-muted-foreground/60">EllowDigital</span>
          </p>
        </div>
      </div>
    </nav>
  );
}
