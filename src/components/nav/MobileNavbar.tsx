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
      <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 w-full md:gap-12">
        {/* Logo & Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-3 min-w-0 group"
          aria-label="Go to homepage"
          onClick={() => setMobileOpen(false)}
        >
          <img
            src="/assets/img/logo.webp"
            alt="Ghatak Sports Academy India Logo"
            className="h-9 w-9 sm:h-10 sm:w-10 object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div className="flex flex-col leading-none justify-center">
            <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-primary transition-colors duration-300">
              GSAI
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5">
              Ghatak Sports Academy India
            </span>
          </div>
        </Link>

        {/* Menu Toggle Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/30 ${
            mobileOpen
              ? 'bg-gradient-to-r from-orange-500 to-yellow-400 text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          aria-label={mobileOpen ? 'Close mobile menu' : 'Open mobile menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          <div
            className={`transition-transform duration-300 ${mobileOpen ? 'rotate-180' : ''}`}
          >
            {mobileOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={22} className="sm:w-6 sm:h-6" />}
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay with solid background */}
      {portalTarget &&
        mobileOpen &&
        createPortal(
          <>
            {/* MOBILE LAYOUT (< md) - Modern Bottom Sheet */}
            <div
              className="md:hidden fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm"
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-menu-title"
            >
              <div className="absolute inset-x-0 bottom-0 h-[85vh] bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col animate-in slide-in-from-bottom-full duration-300 ease-out">
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
                        className="text-xl font-bold text-slate-900 tracking-tight"
                      >
                        Menu
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
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
                          className="group flex items-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 active:scale-[0.98] transition-all duration-200"
                          style={{ animationDelay: `${idx * 30}ms` }}
                          tabIndex={0}
                          role="menuitem"
                        >
                          <div className="p-2 rounded-xl bg-white shadow-sm text-slate-600 group-hover:text-orange-500 transition-colors">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="ml-3 text-sm font-semibold text-slate-700 group-hover:text-slate-900">
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
                      className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-900 text-white text-sm font-semibold shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-transform"
                      role="menuitem"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Admin Login</span>
                    </Link>

                    {/* Contact Info */}
                    <div className="mt-3 p-4 rounded-2xl bg-[#FFFBF0] border border-orange-100/50">
                      <h4 className="font-bold text-slate-900 text-sm mb-2">Get in Touch</h4>
                      <div className="space-y-2">
                        <a
                          href="tel:+916394135988"
                          className="flex items-center gap-3 text-slate-600 hover:text-orange-600 transition-colors"
                        >
                          <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-orange-500 shadow-sm">
                            <span className="text-xs">📞</span>
                          </div>
                          <span className="text-xs font-medium">+91 63941 35988</span>
                        </a>
                        <a
                          href="mailto:ghatakgsai@gmail.com"
                          className="flex items-center gap-3 text-slate-600 hover:text-orange-600 transition-colors"
                        >
                          <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-orange-500 shadow-sm">
                            <span className="text-xs">📧</span>
                          </div>
                          <span className="text-xs font-medium">ghatakgsai@gmail.com</span>
                        </a>
                      </div>
                    </div>
                  </nav>
                </div>
              </div>
            </div>

            {/* TABLET LAYOUT (>= md) - Modern Glass Popover */}
            <div
              className="hidden md:block fixed inset-0 z-[100]"
              onClick={() => setMobileOpen(false)}
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm animate-in fade-in duration-300" />

              {/* Modern Menu Card */}
              <div
                className="absolute top-[5.5rem] left-1/2 -translate-x-1/2 w-[380px] bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] border border-white/40 p-3 animate-in slide-in-from-top-4 fade-in duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <nav className="flex flex-col gap-1.5">
                  {navLinks.map((link) => {
                     const IconComponent = iconMap[link.name] || Home;
                     return (
                    <NavLinkItem
                      key={link.name}
                      name={link.name}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="group px-4 py-3 hover:bg-white rounded-2xl text-base font-semibold text-slate-600 hover:text-slate-900 transition-all duration-200 flex items-center gap-4 hover:shadow-sm border border-transparent hover:border-slate-100"
                    >
                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {link.name}
                      <span className="ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-slate-400 transition-all duration-300">
                        →
                      </span>
                    </NavLinkItem>
                  )})}
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-2" />
                  <Link
                    to="/admin/login"
                    onClick={() => setMobileOpen(false)}
                    className="mx-1 px-4 py-3 text-base font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5"
                  >
                    <LogIn className="w-5 h-5" />
                    Admin Login
                  </Link>
                </nav>
              </div>
            </div>
          </>,
          portalTarget
        )}
    </div>
  );
}
