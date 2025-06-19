import React from 'react';
import { Menu, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '../ui/dropdown-menu';
import { NavLinkItem } from './NavLinkItem';
import { navLinks } from '../../data/navLinks';

export function DesktopNavbar() {
  return (
    <>
      {/* ✅ Desktop: lg and above */}
      <div className="hidden lg:flex items-center justify-between w-full max-w-screen-xl mx-auto px-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <img
            src="/assets/img/logo.webp"
            alt="Logo"
            className="w-10 h-10 object-contain rounded-full border border-yellow-400"
          />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-red-700">GSAI</span>
            <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
              Ghatak Sports Academy India
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6 xl:gap-10">
          {navLinks.map((link) => (
            <NavLinkItem
              key={link.name}
              href={link.href}
              name={link.name}
              className="text-gray-800 font-semibold tracking-wide text-sm xl:text-base hover:text-red-700 hover:underline underline-offset-8 transition-all"
            />
          ))}
        </div>

        {/* Admin Button */}
        <Link
          to="/admin/login"
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-yellow-400 text-black font-semibold shadow hover:bg-yellow-500 active:bg-yellow-600 transition"
        >
          <LogIn className="w-5 h-5" />
          <span className="hidden sm:inline">Admin Panel</span>
        </Link>
      </div>

      {/* ✅ Tablet: md to <lg */}
      <div className="hidden md:flex lg:hidden items-center justify-between w-full max-w-screen-xl mx-auto px-4">
        <div className="flex items-center gap-3">
          <img
            src="/assets/img/logo.webp"
            alt="Logo"
            className="w-9 h-9 object-contain rounded-full border border-yellow-400"
          />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-red-700">GSAI</span>
            <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
              Ghatak Sports Academy India
            </span>
          </div>
        </div>

        {/* Menu links & dropdown */}
        <div className="flex items-center gap-3">
          {navLinks.slice(0, 4).map((link) => (
            <NavLinkItem
              key={link.name}
              href={link.href}
              name={link.name}
              className="text-gray-800 font-medium tracking-wide text-sm md:text-base hover:text-red-700 hover:underline underline-offset-8 transition"
            />
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 rounded-full border border-yellow-400 text-yellow-500 hover:bg-yellow-50 transition h-10 w-10 flex items-center justify-center"
                aria-label="Toggle more navigation"
              >
                <Menu size={22} />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="z-[60] mt-2 w-60 rounded-xl border border-yellow-200 shadow-xl bg-white animate-fade-in"
              sideOffset={8}
              align="end"
            >
              <div className="flex flex-col gap-1 py-2 px-3">
                {navLinks.slice(4).map((link) => (
                  <NavLinkItem
                    key={link.name}
                    href={link.href}
                    name={link.name}
                    className="text-gray-800 font-medium py-2 px-3 rounded-md hover:bg-yellow-50 transition text-sm"
                  />
                ))}

                <Link
                  to="/admin/login"
                  className="flex items-center gap-2 justify-center px-4 py-2 rounded-md bg-yellow-400 text-black font-semibold shadow hover:bg-yellow-500 transition mt-2"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Admin Panel</span>
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}
