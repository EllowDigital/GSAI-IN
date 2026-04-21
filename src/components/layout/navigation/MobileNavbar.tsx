import { ACADEMY_CONTACT_EMAIL } from '@/config/contact';
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
  GraduationCap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { NavLinkItem } from './NavLinkItem';
import { navLinks } from '@/constants/navLinks';

interface MobileNavbarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  activeHash: string;
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

export function MobileNavbar({
  mobileOpen,
  setMobileOpen,
  activeHash,
}: MobileNavbarProps) {
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
            src="/icons/android-chrome-192x192.png"
            alt="Ghatak Sports Academy India Logo"
            width={40}
            height={40}
            className="h-9 w-9 sm:h-10 sm:w-10 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]"
            loading="eager"
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
          className={`relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-500/50 ${
            mobileOpen
              ? 'border-yellow-300/40 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 text-white shadow-[0_10px_25px_rgba(251,146,60,0.45)] rotate-90'
              : 'border-white/20 bg-black/45 text-gray-100 backdrop-blur-sm hover:bg-black/60 hover:border-white/35 hover:text-white'
          }`}
          aria-label={mobileOpen ? 'Close mobile menu' : 'Open mobile menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? (
            <X size={20} className="sm:w-6 sm:h-6" />
          ) : (
            <Menu size={22} className="sm:w-6 sm:h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay with solid background */}
      {portalTarget &&
        mobileOpen &&
        createPortal(
          <>
            {/* MENU OVERLAY - Modern Bottom Sheet (Mobile & Tablet) */}
            <div
              className="fixed inset-0 z-[100] bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.15),transparent_35%),radial-gradient(circle_at_80%_90%,rgba(250,204,21,0.15),transparent_30%)] bg-black/60 backdrop-blur-sm"
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-menu-title"
              onClick={() => setMobileOpen(false)}
            >
              <div
                className="absolute inset-x-0 bottom-0 h-[85vh] border-t border-white/18 bg-black/70 backdrop-blur-3xl rounded-t-[2rem] shadow-[0_-12px_50px_rgba(0,0,0,0.65)] overflow-hidden flex flex-col animate-in slide-in-from-bottom-full duration-300 ease-out md:max-w-lg md:mx-auto md:rounded-[2rem] md:bottom-6 md:inset-x-6 md:h-auto md:max-h-[85vh] md:border md:border-white/16"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_0%_0%,rgba(255,255,255,0.14),transparent_45%),radial-gradient(100%_90%_at_100%_100%,rgba(250,204,21,0.12),transparent_45%)]" />
                <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
                {/* Handle Bar */}
                <div
                  className="relative w-full flex justify-center pt-4 pb-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="w-12 h-1.5 bg-white/35 rounded-full hover:bg-white/55 transition-colors cursor-pointer" />
                </div>

                <div className="relative flex-1 overflow-y-auto px-6 pb-8 scrollbar-hide">
                  {/* Menu Header */}
                  <div className="flex items-center justify-between py-4 mb-4 border-b border-white/15">
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
                      className="p-2 rounded-full border border-white/20 bg-black/45 text-gray-300 hover:bg-black/60 hover:text-white transition-colors"
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
                      const isActive = activeHash === link.href;

                      return (
                        <NavLinkItem
                          key={link.name}
                          name={link.name}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={`group flex items-center p-3 rounded-2xl border active:scale-[0.98] transition-all duration-200 ${
                            isActive
                              ? 'bg-white/16 border-yellow-300/55 shadow-[0_0_30px_rgba(250,204,21,0.35)]'
                              : 'bg-white/5 border-white/8 hover:bg-white/10 hover:border-white/15'
                          }`}
                          style={{ animationDelay: `${idx * 50}ms` }}
                          tabIndex={0}
                          role="menuitem"
                        >
                          <div
                            className={`relative p-2 rounded-xl bg-gradient-to-br from-gray-800 to-black border transition-colors shadow-inner ${
                              isActive
                                ? 'border-yellow-400/40 text-yellow-300'
                                : 'border-white/5 text-gray-400 group-hover:text-yellow-400 group-hover:border-yellow-500/30'
                            }`}
                          >
                            {isActive && (
                              <span className="pointer-events-none absolute inset-[-2px] rounded-xl border border-yellow-300/50 animate-[pulse_1.8s_ease-in-out_infinite]" />
                            )}
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <span
                            className={`ml-4 text-base font-medium transition-colors ${
                              isActive
                                ? 'text-white'
                                : 'text-gray-200 group-hover:text-white'
                            }`}
                          >
                            {link.name}
                          </span>
                          <span
                            className={`ml-auto w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                              isActive
                                ? 'bg-yellow-400/25 text-yellow-200 shadow-[0_0_18px_rgba(250,204,21,0.35)]'
                                : 'bg-black/45 text-gray-500 group-hover:bg-yellow-500/20 group-hover:text-yellow-400'
                            }`}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </NavLinkItem>
                      );
                    })}

                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4" />

                    {/* Enroll Now - Primary CTA */}
                    <Link
                      to="/enroll"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-gradient-to-r from-yellow-500 to-red-600 text-white text-base font-bold shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-transform hover:shadow-orange-500/40"
                      role="menuitem"
                    >
                      🥋 <span>Enroll at Ghatak Sports Academy</span>
                    </Link>

                    <Link
                      to="/student/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-white/15 text-gray-200 text-base font-semibold hover:bg-white/10 active:scale-[0.98] transition-all"
                      role="menuitem"
                    >
                      <GraduationCap className="w-5 h-5" />
                      <span>Student Portal</span>
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
                          <span className="text-sm font-medium">
                            +91 63941 35988
                          </span>
                        </a>
                        <a
                          href={`mailto:${ACADEMY_CONTACT_EMAIL}`}
                          className="flex items-center gap-3 text-gray-400 hover:text-yellow-400 transition-colors group"
                        >
                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-yellow-500 group-hover:bg-yellow-500/20 transition-colors">
                            <Mail className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">
                            {ACADEMY_CONTACT_EMAIL}
                          </span>
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
