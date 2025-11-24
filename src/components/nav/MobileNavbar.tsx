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
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-menu-title"
              onClick={() => setMobileOpen(false)}
            >
              <div
                className="absolute inset-x-0 bottom-0 h-[85vh] bg-[#0a0a0a] border-t border-white/10 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in slide-in-from-bottom-full duration-300 ease-out md:max-w-lg md:mx-auto md:rounded-[2rem] md:bottom-6 md:inset-x-6 md:h-auto md:max-h-[85vh] md:border md:border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Handle Bar */}
                <div className="w-full flex justify-center pt-4 pb-2" onClick={() => setMobileOpen(false)}>
                  <div className="w-12 h-1.5 bg-white/20 rounded-full hover:bg-white/40 transition-colors cursor-pointer" />
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-8 scrollbar-hide">
                  {/* Menu Header */}
                  <div className="flex items-center justify-between py-4 mb-4 border-b border-white/5">
                    <div>
                      <h2
                        id="mobile-menu-title"
                        className="text-2xl font-bold text-white tracking-tight"
                      >
                        Menu
                      </h2>
                      <p className="text-sm text-gray-400 font-medium">
                        Explore GSAI
                      </p>
                    </div>
                    <button
                      onClick={() => setMobileOpen(false)}
                      className="p-2 rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                      aria-label="Close menu"
                    >
                      <X size={20} />
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
                          className="group flex items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 active:scale-[0.98] transition-all duration-200"
                          style={{ animationDelay: `${idx * 50}ms` }}
                          tabIndex={0}
                          role="menuitem"
                        >
                          <div className="p-2 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/5 text-gray-400 group-hover:text-yellow-400 group-hover:border-yellow-500/30 transition-colors shadow-inner">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <span className="ml-4 text-base font-medium text-gray-200 group-hover:text-white">
                            {link.name}
                          </span>
                          <span className="ml-auto w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-500 group-hover:bg-yellow-500/20 group-hover:text-yellow-400 transition-all">
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </NavLinkItem>
                      );
                    })}

                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4" />

                    {/* Admin Panel Button */}
                    <Link
                      to="/admin/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-gradient-to-r from-yellow-500 to-red-600 text-white text-base font-bold shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-transform hover:shadow-orange-500/40"
                      role="menuitem"
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Admin Login</span>
                    </Link>

                    {/* Contact Info */}
                    <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-white/10">
                      <h4 className="font-bold text-white text-base mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 bg-yellow-500 rounded-full"></span>
                        Get in Touch
                      </h4>
                      <div className="space-y-3">
                        <a
                          href="tel:+916394135988"
                          className="flex items-center gap-3 text-gray-400 hover:text-yellow-400 transition-colors group"
                        >
                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-yellow-500 group-hover:bg-yellow-500/20 transition-colors">
                            <Phone className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">+91 63941 35988</span>
                        </a>
                        <a
                          href="mailto:ghatakgsai@gmail.com"
                          className="flex items-center gap-3 text-gray-400 hover:text-yellow-400 transition-colors group"
                        >
                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-yellow-500 group-hover:bg-yellow-500/20 transition-colors">
                            <Mail className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">ghatakgsai@gmail.com</span>
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
