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
} from 'lucide-react';
import { useAdminAuth } from '@/pages/admin/AdminAuthProvider';

// Modern sidebar nav items with improved categorization
const navItems = [
  {
    title: 'Homepage',
    url: 'https://ghatakgsai.netlify.app/',
    icon: Globe,
    category: 'external',
  },
  {
    title: 'Dashboard',
    url: '/admin/dashboard',
    icon: Home,
    category: 'main',
  },
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
  const APP_VERSION = '1.2.2'; // Always Change If any change in complete admin dashboard

  const mainItems = navItems.filter((item) => item.category === 'main');
  const managementItems = navItems.filter(
    (item) => item.category === 'management'
  );
  const contentItems = navItems.filter((item) => item.category === 'content');
  const externalItems = navItems.filter((item) => item.category === 'external');

  const NavSection = ({
    title,
    items,
  }: {
    title: string;
    items: typeof navItems;
  }) => (
    <div className="space-y-1">
      <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        {title}
      </h3>
      <ul className="space-y-1">
        {items.map(({ title, url, icon: Icon }) => (
          <li key={title}>
            {url.startsWith('http') ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between px-4 py-3 rounded-xl mx-2 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:shadow-sm text-slate-700 hover:text-blue-800"
                onClick={() => {
                  if (window.innerWidth < 768 && setOpen) setOpen(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-blue-200 transition-colors duration-200">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm">{title}</span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </a>
            ) : (
              <NavLink
                to={url}
                end
                onClick={() => {
                  if (window.innerWidth < 768 && setOpen) setOpen(false);
                }}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-4 py-3 rounded-xl mx-2 transition-all duration-200 font-medium text-sm ${
                    isActive
                      ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 shadow-sm border border-yellow-300/50'
                      : 'hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:shadow-sm text-slate-700 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-lg transition-colors duration-200 ${
                          isActive
                            ? 'bg-yellow-200'
                            : 'bg-slate-100 group-hover:bg-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{title}</span>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
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
      className={`
        fixed left-0 top-0 z-50 h-screen
        bg-white/95 backdrop-blur-xl
        shadow-xl border-r border-slate-200/60
        w-4/5 max-w-xs transform
        transition-all duration-300 ease-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:w-72 md:max-w-none md:translate-x-0 md:static md:block
        flex flex-col
      `}
      style={{ minWidth: '16rem', maxWidth: '20rem' }}
      aria-label="Sidebar"
    >
      {/* Enhanced Header */}
      <div className="flex flex-col items-center pt-8 pb-6 gap-4 select-none border-b border-slate-100">
        <div className="relative">
          <img
            src="/favicon.ico"
            alt="Logo"
            className="w-14 h-14 rounded-2xl border-2 border-yellow-400 shadow-lg transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
        </div>
        <div className="text-center">
          <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
            GSAI Admin
          </span>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Nitesh Yadav
          </p>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <div className="flex-1 py-6 px-2 overflow-y-auto space-y-6">
        <NavSection title="Overview" items={mainItems} />
        <NavSection title="Management" items={managementItems} />
        <NavSection title="Content" items={contentItems} />
        <NavSection title="External" items={externalItems} />
      </div>

      {/* Enhanced Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200 font-semibold text-sm"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>

        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>© 2025 GSAI</span>
            <span className="text-slate-300">•</span>
            <div
              className="flex items-center gap-1"
              title={`Version ${APP_VERSION}`}
            >
              <GitBranch size={10} />
              <span>v{APP_VERSION}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
