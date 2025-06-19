
import React from 'react';
import { Menu, X, LogIn, Home, Info, Trophy, Image, Newspaper, HelpCircle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NavLinkItem } from './NavLinkItem';
import { navLinks } from '../../data/navLinks';

interface MobileNavbarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  'Home': Home,
  'About': Info,
  'Programs': Trophy,
  'Gallery': Image,
  'Blog/News': Newspaper,
  'FAQ': HelpCircle,
  'Location': MapPin,
};

export function MobileNavbar({ mobileOpen, setMobileOpen }: MobileNavbarProps) {
  return (
    <div className="md:hidden">
      {/* Mobile Header */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <img
            src="/assets/img/logo.webp"
            alt="Ghatak Sports Academy India Logo"
            className="w-10 h-10 rounded-full border-2 border-yellow-400 object-contain shadow-md"
          />
          <div className="flex flex-col">
            <span className="text-base font-bold text-gray-900 tracking-tight">
              GSAI
            </span>
            <span className="text-xs font-medium text-gray-600 leading-none">
              Ghatak Sports Academy India
            </span>
          </div>
        </div>

        {/* Menu Toggle Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`relative p-3 rounded-full transition-all duration-300 transform ${
            mobileOpen 
              ? 'bg-red-500 text-white shadow-lg scale-110' 
              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-yellow-400 hover:shadow-md'
          }`}
          aria-label={mobileOpen ? 'Close mobile menu' : 'Open mobile menu'}
        >
          <div className={`transition-transform duration-300 ${mobileOpen ? 'rotate-180' : ''}`}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-white">
          {/* Menu Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-red-50">
            <div className="flex items-center space-x-3">
              <img
                src="/assets/img/logo.webp"
                alt="Logo"
                className="w-12 h-12 rounded-full border-2 border-yellow-400 object-contain shadow-lg"
              />
              <div>
                <span className="text-lg font-bold text-gray-900 tracking-tight">
                  GSAI
                </span>
                <p className="text-sm text-gray-600 font-medium">
                  Ghatak Sports Academy India
                </p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-300 shadow-sm"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col px-6 py-6 space-y-2 overflow-y-auto max-h-[calc(100vh-120px)]">
            {navLinks.map((link) => {
              const IconComponent = iconMap[link.name] || Home;
              return (
                <NavLinkItem
                  key={link.name}
                  name={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center space-x-4 w-full p-4 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-red-50 hover:shadow-md group"
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
              className="flex items-center justify-center space-x-3 w-full py-4 px-6 bg-gradient-to-r from-yellow-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <LogIn className="w-5 h-5" />
              <span>Admin Panel</span>
            </Link>

            {/* Contact Info */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-2">Contact Us</h4>
              <p className="text-sm text-gray-600 mb-1">📞 +91 63941 35988</p>
              <p className="text-sm text-gray-600">📧 ghatakgsai@gmail.com</p>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
