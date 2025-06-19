
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
  return (
    <>
      {/* Desktop Navigation - lg and above */}
      <div className="hidden lg:flex items-center justify-between px-6 py-4">
        {/* Logo Section */}
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <img
              src="/assets/img/logo.webp"
              alt="Ghatak Sports Academy India"
              className="w-12 h-12 object-contain rounded-full border-2 border-gradient-to-r from-yellow-400 to-red-500 shadow-lg transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 tracking-tight">
              GSAI
            </span>
            <span className="text-sm font-medium text-gray-600 leading-none">
              Ghatak Sports Academy India
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8">
          {navLinks.map((link) => (
            <NavLinkItem
              key={link.name}
              href={link.href}
              name={link.name}
              className="relative text-gray-700 font-medium text-sm tracking-wide transition-all duration-300 hover:text-red-600 group"
            >
              <span className="relative z-10">{link.name}</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-500 to-red-500 transition-all duration-300 group-hover:w-full"></div>
            </NavLinkItem>
          ))}
        </div>

        {/* CTA Button */}
        <Link
          to="/admin/login"
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-red-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300/50"
        >
          <LogIn className="w-5 h-5" />
          <span>Admin Panel</span>
        </Link>
      </div>

      {/* Tablet Navigation - md to lg */}
      <div className="hidden md:flex lg:hidden items-center justify-between px-6 py-3">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <img
            src="/assets/img/logo.webp"
            alt="Logo"
            className="w-10 h-10 object-contain rounded-full border-2 border-yellow-400 shadow-md"
          />
          <div className="flex flex-col">
            <span className="text-base font-bold text-gray-900">GSAI</span>
            <span className="text-xs font-medium text-gray-600 leading-none">
              Ghatak Sports Academy India
            </span>
          </div>
        </div>

        {/* Condensed Navigation */}
        <div className="flex items-center space-x-6">
          {navLinks.slice(0, 4).map((link) => (
            <NavLinkItem
              key={link.name}
              href={link.href}
              name={link.name}
              className="text-gray-700 font-medium text-sm hover:text-red-600 transition-colors duration-300"
            />
          ))}

          {/* More Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center space-x-1 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-300 shadow-sm"
                aria-label="More navigation options"
              >
                <Menu className="w-4 h-4 text-gray-600" />
                <ChevronDown className="w-3 h-3 text-gray-600" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent 
              className="z-[60] mt-2 w-56 rounded-xl border border-gray-200 shadow-xl bg-white/95 backdrop-blur-md"
              sideOffset={8}
              align="end"
            >
              {navLinks.slice(4).map((link) => (
                <DropdownMenuItem key={link.name} asChild>
                  <NavLinkItem
                    href={link.href}
                    name={link.name}
                    className="w-full px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 hover:text-red-600 transition-colors duration-300 rounded-lg cursor-pointer"
                  />
                </DropdownMenuItem>
              ))}
              
              <div className="border-t border-gray-100 my-2"></div>
              
              <DropdownMenuItem asChild>
                <Link
                  to="/admin/login"
                  className="flex items-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-red-500 text-white font-semibold rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}
