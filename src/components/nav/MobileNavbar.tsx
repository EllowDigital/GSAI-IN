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
      <div className="flex items-center justify-between px-4 py-3 border border-white/30 bg-white/20 backdrop-blur-xl rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.18)]">
        {/* Logo & Brand */}
        <Link
          to="/"
          className="flex items-center space-x-3 group"
          aria-label="Go to homepage"
          onClick={() => setMobileOpen(false)}
        >
          <img
            src="/assets/img/logo.webp"
            alt="Ghatak Sports Academy India Logo"
            className="h-10 w-auto max-w-[140px] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div className="flex flex-col">
            <span className="text-base font-bold text-gray-900 tracking-tight group-hover:text-red-600 transition-colors duration-300">
              GSAI
            </span>
            <span className="text-xs font-medium text-gray-600 leading-none">
              Ghatak Sports Academy India
            </span>
          </div>
        </Link>

        {/* Menu Toggle Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`relative p-3 rounded-full border transition-all duration-300 transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
            mobileOpen
              ? 'bg-gradient-to-r from-yellow-400 to-red-500 text-white border-white/40 shadow-lg scale-105'
              : 'bg-white/30 text-foreground/80 border-white/40 hover:bg-white/50 hover:shadow-lg'
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
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-2xl"
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
          >
            <div className="h-full overflow-y-auto px-4 py-6">
              <div className="mx-auto max-w-md rounded-[32px] border border-white/25 bg-white/15 backdrop-blur-2xl shadow-[0_25px_80px_rgba(15,23,42,0.4)]">
                {/* Menu Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/20">
                  <div className="flex items-center space-x-3">
                    <img
                      src="/assets/img/logo.webp"
                      alt="Ghatak Sports Academy India Logo"
                      className="h-12 w-auto max-w-[160px] object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,0.18)]"
                      loading="lazy"
                      decoding="async"
                    />
                    <div>
                      <h2
                        id="mobile-menu-title"
                        className="text-lg font-bold text-white tracking-tight"
                      >
                        GSAI
                      </h2>
                      <p className="text-sm text-white/80 font-medium">
                        Ghatak Sports Academy India
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-full border border-white/30 text-white hover:bg-white/20 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
                        className="flex items-center space-x-4 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-white/90 transition-all duration-300 hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                        tabIndex={0}
                        role="menuitem"
                      >
                        <div className="p-2 rounded-xl bg-white/10 text-white">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-semibold">{link.name}</span>
                          <span className="text-xs text-white/70">Tap to explore</span>
                        </div>
                        <span className="ml-auto h-9 w-9 rounded-full border border-white/20 bg-white/10 text-white flex items-center justify-center text-xs">
                          ↗
                        </span>
                      </NavLinkItem>
                    );
                  })}

                  {/* Admin Panel Button */}
                  <Link
                    to="/admin/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-semibold shadow-[0_15px_40px_rgba(249,115,22,0.45)] transition-all duration-300 hover:shadow-[0_18px_50px_rgba(249,115,22,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    role="menuitem"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Admin Login</span>
                  </Link>

                  {/* Contact Info */}
                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 text-white/80">
                    <h4 className="font-semibold text-white mb-2">Contact Us</h4>
                    <div className="space-y-2 text-sm">
                      <a
                        href="tel:+916394135988"
                        className="flex items-center gap-2 hover:text-white transition-colors"
                        aria-label="Call us at +91 63941 35988"
                      >
                        📞 +91 63941 35988
                      </a>
                      <a
                        href="mailto:ghatakgsai@gmail.com"
                        className="flex items-center gap-2 hover:text-white transition-colors"
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
