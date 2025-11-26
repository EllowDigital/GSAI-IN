import React from 'react';
import { Link } from 'react-router-dom';
import { NavLinkItem } from './NavLinkItem';
import { navLinks } from '../../data/navLinks';

export function DesktopNavbar() {
  return (
    <>
      {/* Desktop Navigation - xl and above */}
      <div className="hidden xl:flex items-center px-6 py-2.5 gap-8 2xl:gap-12 min-h-[64px]">
        {/* Logo Section */}
        <Link
          to="/"
          className="flex items-center space-x-3 group flex-shrink-0 pl-2"
          aria-label="Go to homepage"
        >
          <img
            src="/assets/img/logo.webp"
            alt="Ghatak Sports Academy India"
            width={40}
            height={40}
            className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]"
            loading="lazy"
            decoding="async"
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white leading-none group-hover:text-yellow-400 transition-colors duration-300 tracking-tight">
              GSAI
            </span>
            <span className="text-[10px] font-medium text-gray-400 leading-none mt-1 group-hover:text-gray-300 transition-colors">
              Ghatak Sports Academy India
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav
          className="flex items-center gap-6 xl:gap-8"
          role="menubar"
          aria-label="Primary navigation"
        >
          {navLinks.map((link) => (
            <NavLinkItem
              key={link.name}
              href={link.href}
              name={link.name}
              className="relative text-sm lg:text-base font-medium text-gray-300 hover:text-white transition-colors duration-300 py-2 group"
              role="menuitem"
              tabIndex={0}
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-red-500 transition-all duration-300 group-hover:w-full"></span>
            </NavLinkItem>
          ))}
        </nav>

        {/* CTA Button */}
        <Link
          to="/admin/login"
          className="relative overflow-hidden group py-2 px-6 h-10 rounded-full flex items-center gap-2 flex-shrink-0 bg-gradient-to-r from-yellow-500 to-red-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 hover:-translate-y-0.5"
          aria-label="Access admin panel"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
          <span className="font-bold text-sm tracking-wide">Admin</span>
          <div className="relative h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
            <img
              src="/assets/img/logo.webp"
              alt="GSAI Admin"
              width={12}
              height={12}
              className="h-3 w-auto object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
        </Link>
      </div>
    </>
  );
}
