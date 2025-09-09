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
  const APP_VERSION = '2.8.0'; // Increment this version whenever the entire project code is updated

  const NavSection = ({
    title,
    items,
  }: {
    title: string;
    items: typeof navItems;
  }) => (
    <div className="space-y-1">
      <h3 className="px-3 sm:px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
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
                className="group flex w-full items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl mx-2 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 hover:shadow-sm text-left text-slate-700 dark:text-slate-300 hover:text-blue-800 dark:hover:text-blue-200"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="p-1 sm:p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors duration-200 flex-shrink-0">
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <span className="font-medium text-xs sm:text-sm truncate text-slate-800 dark:text-slate-200">
                    {title}
                  </span>
                </div>
                <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
              </button>
            ) : (
              <NavLink
                to={url}
                end
                onClick={() => {
                  if (window.innerWidth < 1024 && setOpen) setOpen(false);
                }}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl mx-2 transition-all duration-200 font-medium text-xs sm:text-sm ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-800 dark:text-blue-200 shadow-sm border border-blue-300/50 dark:border-blue-600/50'
                      : 'hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-800/50 dark:hover:to-slate-700/50 hover:shadow-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div
                        className={`p-1 sm:p-1.5 rounded-lg transition-colors duration-200 flex-shrink-0 ${
                          isActive
                            ? 'bg-blue-200 dark:bg-blue-800'
                            : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-600'
                        }`}
                      >
                        <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                      <span className="truncate text-slate-800 dark:text-slate-200">
                        {title}
                      </span>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 flex-shrink-0" />
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
      className={`fixed left-0 top-0 z-50 h-full bg-white dark:bg-slate-900 shadow-2xl border-r border-slate-200/60 dark:border-slate-700/60 transform transition-all duration-300 ease-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      } w-[280px] xs:w-[300px] sm:w-[320px] md:w-[280px] lg:w-64 xl:w-72 lg:translate-x-0 lg:max-w-none lg:static lg:block flex flex-col max-w-[85vw] xs:max-w-[80vw] sm:max-w-[75vw] lg:max-w-none min-h-screen`}
      aria-label="Sidebar"
    >
      {setOpen && (
        <button
          className="lg:hidden absolute top-3 sm:top-4 right-3 sm:right-4 p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors z-10 shadow-sm"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </button>
      )}

      {/* Header */}
      <div className="flex flex-col items-center pt-4 sm:pt-6 pb-3 sm:pb-4 gap-2 sm:gap-3 select-none border-b border-slate-100 dark:border-slate-700">
        <div className="relative">
          <img
            src="/assets/img/logo.webp"
            alt="Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain"
          />
          <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse" />
        </div>
        <div className="text-center">
          <span className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
            GSAI Admin
          </span>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Nitesh Yadav
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-3 sm:py-4 px-1 sm:px-2 overflow-y-auto space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
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

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-400 transition-all duration-200 font-semibold text-xs sm:text-sm"
        >
          <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Sign Out</span>
        </button>
        <div className="mt-2 sm:mt-3 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <span>© 2025 GSAI</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <div
              className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-400 transition-colors duration-200 cursor-pointer"
              title={`Version ${APP_VERSION}`}
            >
              <GitBranch className="w-2.5 h-2.5" />
              <span>v{APP_VERSION}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
