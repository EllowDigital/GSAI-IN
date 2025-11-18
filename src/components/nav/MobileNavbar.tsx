import React from 'react';
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
  return (
    <div className="md:hidden">
      {/* Mobile Header with solid background */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
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
          className={`relative p-3 rounded-full transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            mobileOpen
              ? 'bg-red-500 text-white shadow-lg scale-110 focus:ring-red-500'
              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-yellow-400 hover:shadow-md focus:ring-yellow-400'
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
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[100] bg-white"
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
        >
          {/* Menu Header with solid background */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-red-50">
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
                  className="text-lg font-bold text-gray-900 tracking-tight"
                >
                  GSAI
                </h2>
                <p className="text-sm text-gray-600 font-medium">
                  Ghatak Sports Academy India
                </p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Menu with enhanced accessibility */}
          <nav
            className="flex flex-col px-6 py-6 space-y-2 overflow-y-auto max-h-[calc(100vh-120px)] bg-white"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link, index) => {
              const IconComponent = iconMap[link.name] || Home;
              return (
                <NavLinkItem
                  key={link.name}
                  name={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center space-x-4 w-full p-4 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-red-50 hover:shadow-md group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  tabIndex={0}
                  role="menuitem"
                >
                  <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-100 to-red-100 group-hover:from-yellow-200 group-hover:to-red-200 transition-colors duration-300">
                    <IconComponent className="w-5 h-5 text-gray-700 group-hover:text-red-600" />
                  </div>
                  <span className="text-gray-800 font-medium text-base group-hover:text-red-600 transition-colors duration-300">
                    {link.name}
                  </span>
                </NavLinkItem>
              );
            })}

            {/* Divider */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Admin Panel Button */}
            <Link
              to="/admin/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center space-x-3 w-full py-4 px-6 bg-gradient-to-r from-yellow-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2"
              role="menuitem"
            >
              <LogIn className="w-5 h-5" />
              <span>Admin Login</span>
            </Link>

            {/* Contact Info */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-2">Contact Us</h4>
              <div className="space-y-1">
                <a
                  href="tel:+916394135988"
                  className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors duration-300"
                  aria-label="Call us at +91 63941 35988"
                >
                  📞 +91 63941 35988
                </a>
                <a
                  href="mailto:ghatakgsai@gmail.com"
                  className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors duration-300"
                  aria-label="Email us at ghatakgsai@gmail.com"
                >
                  📧 ghatakgsai@gmail.com
                </a>
              </div>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
