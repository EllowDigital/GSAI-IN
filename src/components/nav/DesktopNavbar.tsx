import React from 'react';
import { Link } from 'react-router-dom';
import { NavLinkItem } from './NavLinkItem';
import { navLinks } from '../../data/navLinks';

export function DesktopNavbar() {
  return (
    <>
      {/* Desktop Navigation - xl and above */}
      <div className="hidden xl:flex items-center px-6 py-2 gap-8 2xl:gap-12 min-h-[60px]">
        {/* Logo Section */}
        <Link
          to="/"
          className="flex items-center space-x-3 group flex-shrink-0 pl-2"
          aria-label="Go to homepage"
        >
          <img
            src="/assets/img/logo.webp"
            alt="Ghatak Sports Academy India"
            className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div className="flex flex-col">
            <span className="text-base lg:text-lg font-bold text-slate-900 leading-none group-hover:text-primary transition-colors duration-300">
              GSAI
            </span>
            <span className="text-[10px] lg:text-xs font-medium text-slate-500 leading-none mt-0.5">
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
              className="text-sm lg:text-base font-semibold text-slate-600 hover:text-slate-900 transition-colors duration-200"
              role="menuitem"
              tabIndex={0}
            >
              {link.name}
            </NavLinkItem>
          ))}
        </nav>

        {/* CTA Button */}
        <Link
          to="/admin/login"
          className="btn-primary py-2 px-5 h-10 text-sm gap-2 flex-shrink-0"
          aria-label="Access admin panel"
        >
          <span className="font-semibold">Admin</span>
          <div className="relative h-6 w-6 rounded-full bg-white/25 flex items-center justify-center">
            <img
              src="/assets/img/logo.webp"
              alt="GSAI Admin"
              className="h-3.5 w-auto object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
        </Link>
      </div>
    </>
  );
}
