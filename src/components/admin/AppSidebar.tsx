
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
  const APP_VERSION = '1.2.3'; // Version updated for responsive improvements

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
      <h3 className="px-3 sm:px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
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
                className="group flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl mx-2 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:shadow-sm text-slate-700 hover:text-blue-800"
                onClick={() => {
                  if (window.innerWidth < 1024 && setOpen) setOpen(false);
                }}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="p-1 sm:p-1.5 rounded-lg bg-slate-100 group-hover:bg-blue-200 transition-colors duration-200 flex-shrink-0">
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <span className="font-medium text-xs sm:text-sm truncate">{title}</span>
                </div>
                <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
              </a>
            ) : (
              <NavLink
                to={url}
                end
                onClick={() => {
                  if (window.innerWidth < 1024 && setOpen) setOpen(false);
                }}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl mx-2 transition-all duration-200 font-medium text-xs sm:text-sm ${
                    isActive
                      ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 shadow-sm border border-yellow-300/50'
                      : 'hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:shadow-sm text-slate-700 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div
                        className={`p-1 sm:p-1.5 rounded-lg transition-colors duration-200 flex-shrink-0 ${
                          isActive
                            ? 'bg-yellow-200'
                            : 'bg-slate-100 group-hover:bg-slate-200'
                        }`}
                      >
                        <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                      <span className="truncate">{title}</span>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-500 flex-shrink-0" />
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
    <>
      <nav
        className={`
          fixed left-0 top-0 z-50 h-screen
          bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
          shadow-xl border-r border-slate-200/60 dark:border-slate-700/60
          w-4/5 max-w-xs transform
          transition-all duration-300 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:w-64 xl:w-72 lg:max-w-none lg:translate-x-0 lg:static lg:block
          flex flex-col
          sm:w-80 sm:max-w-sm
        `}
        style={{ minWidth: window.innerWidth >= 1024 ? '16rem' : '75vw', maxWidth: window.innerWidth >= 1024 ? '20rem' : '85vw' }}
        aria-label="Sidebar"
      >
        {/* Mobile Close Button */}
        {setOpen && (
          <button
            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors z-10"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
        )}

        {/* Enhanced Header */}
        <div className="flex flex-col items-center pt-6 sm:pt-8 pb-4 sm:pb-6 gap-3 sm:gap-4 select-none border-b border-slate-100 dark:border-slate-700">
          <div className="relative">
            <img
              src="/favicon.ico"
              alt="Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl border-2 border-yellow-400 shadow-lg transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
          </div>
          <div className="text-center">
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
              GSAI Admin
            </span>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Nitesh Yadav
            </p>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <div className="flex-1 py-4 sm:py-6 px-1 sm:px-2 overflow-y-auto space-y-4 sm:space-y-6">
          <NavSection title="Overview" items={mainItems} />
          <NavSection title="Management" items={managementItems} />
          <NavSection title="Content" items={contentItems} />
          <NavSection title="External" items={externalItems} />
        </div>

        {/* Enhanced Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200 font-semibold text-xs sm:text-sm"
          >
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Sign Out</span>
          </button>

          <div className="mt-3 sm:mt-4 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <span>© 2025 GSAI</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <div
                className="flex items-center gap-1"
                title={`Version ${APP_VERSION}`}
              >
                <GitBranch className="w-2.5 h-2.5" />
                <span>v{APP_VERSION}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
