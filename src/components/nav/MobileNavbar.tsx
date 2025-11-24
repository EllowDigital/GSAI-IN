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
    <div className="lg:hidden">
      {/* Mobile Header with glass background */}
      <div className="mobile-nav-shell">
        {/* Logo & Brand */}
        <Link
          to="/"
          className="flex items-center gap-2.5 min-w-0 group"
          aria-label="Go to homepage"
          onClick={() => setMobileOpen(false)}
        >
          <img
            src="/assets/img/logo.webp"
            alt="Ghatak Sports Academy India Logo"
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
            loading="lazy"
            decoding="async"
          />
          <div className="flex flex-col leading-tight text-slate-900">
            <span className="text-[0.95rem] sm:text-base font-bold tracking-tight group-hover:text-primary transition-colors duration-300">
              GSAI
            </span>
            <span className="text-[0.62rem] sm:text-xs font-medium text-slate-500 truncate">
              Ghatak Sports Academy India
            </span>
          </div>
        </Link>

        {/* Menu Toggle Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`mobile-nav-trigger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/30 ${
            mobileOpen
              ? 'bg-gradient-to-r from-orange-500 to-yellow-400 text-white shadow-[0_12px_26px_rgba(249,115,22,0.38)]'
              : 'text-slate-700'
          }`}
          aria-label={mobileOpen ? 'Close mobile menu' : 'Open mobile menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          <div
            className={`transition-transform duration-300 ${mobileOpen ? 'rotate-180' : ''}`}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay with solid background */}
      {portalTarget &&
        mobileOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-slate-950/70"
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
          >
            <div className="h-full overflow-y-auto px-4 py-6">
              <div className="mx-auto max-w-md rounded-3xl border border-black/5 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.2)]">
                {/* Menu Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <img
                      src="/assets/img/logo.webp"
                      alt="Ghatak Sports Academy India Logo"
                      className="h-12 w-auto max-w-[160px] object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                    <div>
                      <h2
                        id="mobile-menu-title"
                        className="text-lg font-bold text-slate-900 tracking-tight"
                      >
                        GSAI
                      </h2>
                      <p className="text-sm text-slate-500 font-medium">
                        Ghatak Sports Academy India
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-full border border-black/5 text-slate-500 hover:bg-slate-50 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    aria-label="Close menu"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Navigation Menu */}
                <nav
                  className="flex flex-col px-6 py-6 space-y-3"
                  role="navigation"
                  aria-label="Mobile navigation"
                >
                  {navLinks.map((link) => {
                    const IconComponent = iconMap[link.name] || Home;
                    return (
                      <NavLinkItem
                        key={link.name}
                        name={link.name}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                          className="flex items-center space-x-4 w-full rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-4 text-slate-700 transition-all duration-200 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        tabIndex={0}
                        role="menuitem"
                      >
                          <div className="p-2 rounded-xl bg-primary/10 text-primary">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-semibold">{link.name}</span>
                            <span className="text-xs text-slate-500">Tap to explore</span>
                        </div>
                          <span className="ml-auto h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-500 flex items-center justify-center text-xs">
                          ↗
                        </span>
                      </NavLinkItem>
                    );
                  })}

                  {/* Admin Panel Button */}
                  <Link
                    to="/admin/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary w-full justify-center gap-3"
                    role="menuitem"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Admin Login</span>
                  </Link>

                  {/* Contact Info */}
                  <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-slate-600">
                    <h4 className="font-semibold text-slate-900 mb-2">Contact Us</h4>
                    <div className="space-y-2 text-sm">
                      <a
                        href="tel:+916394135988"
                        className="flex items-center gap-2 hover:text-slate-900 transition-colors"
                        aria-label="Call us at +91 63941 35988"
                      >
                        📞 +91 63941 35988
                      </a>
                      <a
                        href="mailto:ghatakgsai@gmail.com"
                        className="flex items-center gap-2 hover:text-slate-900 transition-colors"
                        aria-label="Email us at ghatakgsai@gmail.com"
                      >
                        📧 ghatakgsai@gmail.com
                      </a>
                    </div>
                  </div>
                </nav>
              </div>
            </div>
          </div>,
          portalTarget
        )}
    </div>
  );
}
