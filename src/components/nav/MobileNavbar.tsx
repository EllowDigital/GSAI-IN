import React from 'react';
import { createPortal } from 'react-dom';
import {
  Menu,
  X,
  LogIn,
  Home,
  Info,
  Trophy,
  Image,
  Newspaper,
  HelpCircle,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { NavLinkItem } from './NavLinkItem';
import { navLinks } from '../../data/navLinks';

interface MobileNavbarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Home: Home,
  About: Info,
  Programs: Trophy,
  Gallery: Image,
  'Blog/News': Newspaper,
  FAQ: HelpCircle,
  Location: MapPin,
};

export function MobileNavbar({ mobileOpen, setMobileOpen }: MobileNavbarProps) {
  const portalTarget = typeof document !== 'undefined' ? document.body : null;

  return (
    <div className="xl:hidden w-full">
      {/* Mobile Header - Scaled down version of desktop */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 w-full md:gap-12">
        {/* Logo & Brand */}
        <Link
          to="/"
          className="flex items-center gap-3 min-w-0 group"
          aria-label="Go to homepage"
          onClick={() => setMobileOpen(false)}
        >
          <img
            src="/assets/img/logo.webp"
            alt="Ghatak Sports Academy India Logo"
            className="h-9 w-9 sm:h-10 sm:w-10 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]"
            loading="lazy"
            decoding="async"
          />
          <div className="flex flex-col leading-none justify-center">
            <span className="text-sm sm:text-base font-bold text-white group-hover:text-yellow-400 transition-colors duration-300 tracking-tight">
              GSAI
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-gray-400 mt-0.5 group-hover:text-gray-300">
              Ghatak Sports Academy India
            </span>
          </div>
        </Link>

        {/* Menu Toggle Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-500/50 ${
            mobileOpen
              ? 'bg-gradient-to-r from-yellow-500 to-red-600 text-white shadow-lg shadow-orange-500/30 rotate-90'
              : 'text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
          aria-label={mobileOpen ? 'Close mobile menu' : 'Open mobile menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={22} className="sm:w-6 sm:h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay with solid background */}
      {portalTarget &&
        mobileOpen &&
        createPortal(
          <>
            {/* MENU OVERLAY - Modern Bottom Sheet (Mobile & Tablet) */}
            <div
              className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm"
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-menu-title"
            >
              <div className="absolute inset-x-0 bottom-0 h-[85vh] bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col animate-in slide-in-from-bottom-full duration-300 ease-out md:max-w-lg md:mx-auto md:rounded-[2rem] md:bottom-6 md:inset-x-6 md:h-auto md:max-h-[85vh]">
                {/* Handle Bar */}
                <div className="w-full flex justify-center pt-3 pb-1" onClick={() => setMobileOpen(false)}>
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </div>

                <div className="flex-1 overflow-y-auto px-5 pb-8 scrollbar-hide">
                  {/* Menu Header */}
                  <div className="flex items-center justify-between py-3 mb-2">
                    <div>
                      <h2
                        id="mobile-menu-title"
                        className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight"
                      >
                        Menu
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        Explore GSAI
                      </p>
                    </div>
                    <button
                      onClick={() => setMobileOpen(false)}
                      className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      aria-label="Close menu"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Navigation Menu */}
                  <nav
                    className="flex flex-col space-y-2"
                    role="navigation"
                    aria-label="Mobile navigation"
                  >
                    {navLinks.map((link, idx) => {
                      const IconComponent = iconMap[link.name] || Home;
                      return (
                        <NavLinkItem
                          key={link.name}
                          name={link.name}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="group flex items-center p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-100 active:scale-[0.98] transition-all duration-200"
                          style={{ animationDelay: `${idx * 30}ms` }}
                          tabIndex={0}
                          role="menuitem"
                        >
                          <div className="p-2 rounded-xl bg-white shadow-sm text-slate-600 group-hover:text-orange-500 transition-colors">
                            <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <span className="ml-3 text-sm sm:text-base font-semibold text-slate-700 group-hover:text-slate-900">
                            {link.name}
                          </span>
                          <span className="ml-auto w-7 h-7 flex items-center justify-center rounded-full bg-white text-slate-400 shadow-sm group-hover:text-orange-500 transition-all">
                            <span className="text-xs">→</span>
                          </span>
                        </NavLinkItem>
                      );
                    })}

                    <div className="h-px bg-slate-100 my-2" />

                    {/* Admin Panel Button */}
                    <Link
                      to="/admin/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-900 text-white text-sm sm:text-base font-semibold shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-transform"
                      role="menuitem"
                    >
                      <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Admin Login</span>
                    </Link>

                    {/* Contact Info */}
                    <div className="mt-3 p-4 rounded-2xl bg-[#FFFBF0] border border-orange-100/50">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-2">Get in Touch</h4>
                      <div className="space-y-2">
                        <a
                          href="tel:+916394135988"
                          className="flex items-center gap-3 text-slate-600 hover:text-orange-600 transition-colors"
                        >
                          <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-orange-500 shadow-sm">
                            <span className="text-xs">📞</span>
                          </div>
                          <span className="text-xs sm:text-sm font-medium">+91 63941 35988</span>
                        </a>
                        <a
                          href="mailto:ghatakgsai@gmail.com"
                          className="flex items-center gap-3 text-slate-600 hover:text-orange-600 transition-colors"
                        >
                          <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-orange-500 shadow-sm">
                            <span className="text-xs">📧</span>
                          </div>
                          <span className="text-xs sm:text-sm font-medium">ghatakgsai@gmail.com</span>
                        </a>
                      </div>
                    </div>
                  </nav>
                </div>
              </div>
            </div>
          </>,
          portalTarget
        )}
    </div>
  );
}
