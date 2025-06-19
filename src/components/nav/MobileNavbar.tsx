import React from 'react';
import { Menu, X, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NavLinkItem } from './NavLinkItem';
import { navLinks } from '../../data/navLinks';

interface MobileNavbarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function MobileNavbar({ mobileOpen, setMobileOpen }: MobileNavbarProps) {
  return (
    <div className="md:hidden flex items-center justify-between w-full px-4 py-2 bg-white shadow-sm">
      {/* Logo & Brand */}
      <div className="flex items-center gap-3">
        <img
          src="/assets/img/logo.webp"
          alt="Ghatak Sports Academy Logo"
          className="w-10 h-10 rounded-full border border-yellow-400 object-contain"
        />
        <div className="leading-tight">
          <span className="text-sm font-bold text-red-700">GSAI</span>
          <p className="text-xs font-semibold text-gray-800">
            Ghatak Sports Academy India
          </p>
        </div>
      </div>

      {/* Toggle Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className={`p-2 rounded-full bg-white border border-gray-300 shadow-md hover:shadow-lg transition-all duration-200 h-11 w-11 flex items-center justify-center ${
          mobileOpen ? 'ring-2 ring-yellow-400' : ''
        }`}
        aria-label={mobileOpen ? 'Close mobile menu' : 'Open mobile menu'}
      >
        {mobileOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      {/* Slide-out Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-white w-screen h-screen overflow-y-auto animate-fade-in">
          {/* Slideout Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-yellow-200 bg-white">
            <div className="flex items-center gap-3">
              <img
                src="/assets/img/logo.webp"
                alt="Ghatak Sports Academy Logo"
                className="w-11 h-11 rounded-full border border-yellow-400 object-contain"
              />
              <div>
                <span className="text-lg font-extrabold text-gray-900 tracking-tight">
                  GSAI
                </span>
                <p className="text-xs text-yellow-700 font-semibold">
                  Ghatak Sports Academy India
                </p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-full bg-gray-100 hover:bg-yellow-100 transition"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 px-6 py-6">
            {navLinks.map((link) => (
              <NavLinkItem
                key={link.name}
                name={link.name}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 text-gray-800 font-medium py-3 px-4 rounded-xl transition hover:bg-yellow-50 active:bg-yellow-100 text-base"
              >
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                <span>{link.name}</span>
              </NavLinkItem>
            ))}

            {/* Admin Panel */}
            <Link
              to="/admin/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 justify-center mt-6 px-6 py-3 rounded-xl bg-yellow-400 text-black font-semibold shadow hover:bg-yellow-500 active:bg-yellow-600 transition-all text-base"
            >
              <LogIn className="w-5 h-5" />
              Admin Panel
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
