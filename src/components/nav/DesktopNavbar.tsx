import React from 'react';
import { Menu, LogIn, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu';
import { NavLinkItem } from './NavLinkItem';
import { navLinks } from '../../data/navLinks';

export function DesktopNavbar() {
  const primaryTabletLinks = navLinks.slice(0, 5);
  const overflowTabletLinks = navLinks.slice(5);
  const hasTabletOverflow = overflowTabletLinks.length > 0;

  return (
    <>
      {/* Desktop Navigation - lg and above */}
      <div className="hidden lg:flex items-center justify-between px-6 py-4">
        {/* Logo Section */}
        <Link
          to="/"
          className="flex items-center space-x-4 group"
          aria-label="Go to homepage"
        >
          <img
            src="/assets/img/logo.webp"
            alt="Ghatak Sports Academy India"
            className="h-12 w-auto max-w-[160px] object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.18)] transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 tracking-tight group-hover:text-red-600 transition-colors duration-300">
              GSAI
            </span>
            <span className="text-sm font-medium text-gray-600 leading-none">
              Ghatak Sports Academy India
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav
          className="flex items-center space-x-8"
          role="menubar"
          aria-label="Primary navigation"
        >
          {navLinks.map((link) => (
            <NavLinkItem
              key={link.name}
              href={link.href}
              name={link.name}
              className="relative text-gray-700 font-medium text-sm tracking-wide transition-all duration-300 hover:text-red-600 group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-md px-2 py-1"
              role="menuitem"
              tabIndex={0}
            >
              <span className="relative z-10">{link.name}</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-500 to-red-500 transition-all duration-300 group-hover:w-full"></div>
            </NavLinkItem>
          ))}
        </nav>

        {/* CTA Button */}
        <Link
          to="/admin/login"
          className="flex items-center justify-center h-12 w-12 bg-gradient-to-r from-yellow-500 to-red-500 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300/50"
          aria-label="Access admin panel"
        >
          <img
            src="/assets/img/logo.webp"
            alt="GSAI Admin"
            className="h-8 w-auto object-contain"
            loading="lazy"
            decoding="async"
          />
          <span className="sr-only">Admin Login</span>
        </Link>
      </div>

      {/* Tablet Navigation - md to lg */}
      <div className="hidden md:flex lg:hidden items-center gap-6 px-6 py-4 bg-white/95 border-y border-gray-100/80 backdrop-blur">
        {/* Logo Section */}
        <Link
          to="/"
          className="flex items-center space-x-3 group"
          aria-label="Go to homepage"
        >
          <img
            src="/assets/img/logo.webp"
            alt="Ghatak Sports Academy India"
            className="h-10 w-auto max-w-[140px] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div className="flex flex-col">
            <span className="text-base font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-300">
              GSAI
            </span>
            <span className="text-xs font-medium text-gray-600 leading-none">
              Ghatak Sports Academy India
            </span>
          </div>
        </Link>

        {/* Condensed Navigation */}
        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-100 bg-white px-3 py-2 shadow-sm">
            {primaryTabletLinks.map((link) => (
              <NavLinkItem
                key={link.name}
                href={link.href}
                name={link.name}
                className="px-3 py-2 text-sm font-semibold text-gray-700 rounded-xl bg-white hover:bg-gradient-to-r hover:from-yellow-50 hover:to-red-50 hover:text-red-600 transition-all duration-300 shadow-[0_1px_3px_rgba(15,23,42,0.08)]"
              />
            ))}
          </div>

          {hasTabletOverflow && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center space-x-1 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors duration-300 hover:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label="More navigation options"
                  aria-haspopup="true"
                >
                  <Menu className="w-4 h-4" />
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="z-[60] mt-2 w-60 rounded-2xl border border-gray-200 shadow-2xl bg-white/95 backdrop-blur"
                sideOffset={8}
                align="end"
              >
                {overflowTabletLinks.map((link) => (
                  <DropdownMenuItem key={link.name} asChild>
                    <NavLinkItem
                      href={link.href}
                      name={link.name}
                      className="w-full px-4 py-3 text-gray-700 font-medium hover:bg-gradient-to-r hover:from-yellow-50 hover:to-red-50 hover:text-red-600 transition-colors duration-300 rounded-xl cursor-pointer focus:outline-none"
                    />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Link
            to="/admin/login"
            className="flex items-center justify-center h-11 w-11 rounded-2xl bg-gradient-to-r from-yellow-500 to-red-500 shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            aria-label="Access admin panel"
          >
            <img
              src="/assets/img/logo.webp"
              alt="GSAI Admin"
              className="h-7 w-auto object-contain"
              loading="lazy"
              decoding="async"
            />
            <span className="sr-only">Admin Login</span>
          </Link>
        </div>
      </div>
    </>
  );
}
