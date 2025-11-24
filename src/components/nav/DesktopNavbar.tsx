import React from 'react';
import { Link } from 'react-router-dom';
import { NavLinkItem } from './NavLinkItem';
import { navLinks } from '../../data/navLinks';

export function DesktopNavbar() {
  return (
    <>
      {/* Desktop Navigation - lg and above */}
      <div className="hidden lg:flex items-center justify-between px-8 py-5 gap-8">
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
            <span className="text-lg font-bold text-gray-900 tracking-tight group-hover:text-primary transition-colors duration-300">
              GSAI
            </span>
            <span className="text-sm font-medium text-gray-600 leading-none">
              Ghatak Sports Academy India
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav
          className="flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-2 py-1 shadow-inner shadow-white/30 backdrop-blur"
          role="menubar"
          aria-label="Primary navigation"
        >
          {navLinks.map((link) => (
            <NavLinkItem
              key={link.name}
              href={link.href}
              name={link.name}
              className="relative inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-foreground/80 rounded-full transition-all duration-300 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              role="menuitem"
              tabIndex={0}
            >
              <span className="relative z-10">{link.name}</span>
              <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
            </NavLinkItem>
          ))}
        </nav>

        {/* CTA Button */}
        <Link
          to="/admin/login"
          className="group relative flex items-center gap-3 rounded-full border border-white/50 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 px-6 py-3 text-white font-semibold shadow-[0_15px_35px_rgba(249,115,22,0.45)] transition-all duration-300 hover:shadow-[0_20px_45px_rgba(249,115,22,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          aria-label="Access admin panel"
        >
          <span className="text-sm">Admin</span>
          <div className="relative h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <img
              src="/assets/img/logo.webp"
              alt="GSAI Admin"
              className="h-6 w-auto object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
        </Link>
      </div>
    </>
  );
}
