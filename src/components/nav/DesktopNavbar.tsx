
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
      {/* Large screen nav */}
      <div className="hidden lg:flex gap-5 xl:gap-8 items-center">
        {navLinks.map((link) => (
          <NavLinkItem
            key={link.name}
            href={link.href}
            name={link.name}
            className="text-gray-800 font-medium hover:text-red-700 hover:underline underline-offset-8 transition-all duration-150 text-sm md:text-base lg:text-lg px-1 tracking-wide"
          />
        ))}
        <Link
          to="/admin/login"
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-yellow-400 text-black font-semibold shadow hover:bg-yellow-500 transition ml-1 md:ml-2"
        >
          <LogIn className="w-5 h-5" /> <span className="hidden sm:inline">Admin Panel</span>
        </Link>
      </div>

      {/* Medium screen nav */}
      <div className="hidden md:flex lg:hidden gap-2 xs:gap-3 items-center">
        {navLinks.slice(0, 4).map((link) => (
          <NavLinkItem
            key={link.name}
            href={link.href}
            name={link.name}
            className="text-gray-800 font-medium hover:text-red-700 hover:underline underline-offset-8 transition-all duration-150 text-xs xs:text-sm md:text-base px-1 tracking-wide"
          />
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 rounded hover:bg-yellow-100 transition h-10 w-10 flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <Menu size={26} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-[60] mt-2 mr-2 w-56 bg-white rounded shadow-xl border border-yellow-100">
            <div className="flex flex-col py-2 px-2 gap-1">
              {navLinks.slice(4).map((link) => (
                <NavLinkItem
                  key={link.name}
                  href={link.href}
                  name={link.name}
                  className="block text-gray-800 font-medium py-2 rounded hover:bg-yellow-100 transition text-sm xs:text-base px-2 w-full"
                />
              ))}
              <Link
                to="/admin/login"
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-yellow-400 text-black font-semibold shadow hover:bg-yellow-500 transition mt-2"
              >
                <LogIn className="w-5 h-5" /> Admin Panel
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
