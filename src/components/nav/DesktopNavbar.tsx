import React from 'react';
import { Link } from 'react-router-dom';
import { NavLinkItem } from './NavLinkItem';
import { navLinks } from '../../data/navLinks';

export function DesktopNavbar() {
  return (
    <>
      {/* Desktop Navigation - lg and above */}
      <div className="hidden lg:flex items-center justify-between px-6 py-3 gap-8 min-h-[72px]">
        {/* Logo Section */}
        <Link
          to="/"
          className="flex items-center space-x-4 group"
          aria-label="Go to homepage"
        >
          <img
            src="/assets/img/logo.webp"
            alt="Ghatak Sports Academy India"
            className="h-12 w-auto max-w-[160px] object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-primary transition-colors duration-300">
              GSAI
            </span>
            <span className="text-sm font-medium text-slate-500 leading-none">
              Ghatak Sports Academy India
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav
          className="flex items-center gap-1 rounded-full border border-black/5 bg-white px-2 py-1 shadow-sm"
          role="menubar"
          aria-label="Primary navigation"
        >
          {navLinks.map((link) => (
            <NavLinkItem
              key={link.name}
              href={link.href}
              name={link.name}
              className="group relative inline-flex items-center justify-center px-4 py-1.5 text-sm font-semibold text-slate-600 rounded-full transition-colors duration-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/30"
              role="menuitem"
              tabIndex={0}
            >
              <span className="relative z-10">{link.name}</span>
              <span className="absolute inset-0 rounded-full bg-orange-100/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
            </NavLinkItem>
          ))}
        </nav>

        {/* CTA Button */}
        <Link
          to="/admin/login"
          className="btn-primary gap-2.5"
          aria-label="Access admin panel"
        >
          <span className="text-sm font-semibold">Admin</span>
          <div className="relative h-9 w-9 rounded-full bg-white/25 flex items-center justify-center">
            <img
              src="/assets/img/logo.webp"
              alt="GSAI Admin"
              className="h-5 w-auto object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
        </Link>
      </div>
    </>
  );
}
