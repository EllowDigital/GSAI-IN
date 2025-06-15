import React, { useState } from "react";
import { Menu, X, LogIn } from "lucide-react";

// Only keep essential links for navigation clarity
const navLinks = [
  { name: "Home", href: "#" },
  { name: "About", href: "#about" },
  { name: "Programs", href: "#programs" },
  { name: "Gallery", href: "#gallery" },
  { name: "Blog/News", href: "#blog" },
  { name: "FAQ", href: "#faq" },
  { name: "Location", href: "#location" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="w-full fixed z-50 top-0 left-0 bg-white/90 backdrop-blur border-b border-yellow-100 shadow-md transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-2 xs:px-3 sm:px-5 md:px-8 lg:px-10 py-2 md:py-3">
        {/* Logo/Brand name and Title */}
        <a
          href="#"
          className="flex items-center gap-2 xs:gap-3 font-black text-base xs:text-lg md:text-xl tracking-wider text-red-700 select-none"
        >
          <img
            src="/assets/img/logo.webp"
            alt="GSAI Logo"
            className="w-9 h-9 xs:w-10 xs:h-10 rounded-full border-2 border-yellow-400 shadow-sm"
          />
          <span className="hidden xs:inline font-extrabold text-base xs:text-lg tracking-tighter">GSAI</span>
          <span className="hidden md:inline text-gray-900 font-bold text-sm md:text-base lg:text-xl ml-1 xs:ml-2 pl-2 md:pl-3 border-l border-yellow-300 tracking-tight">
            Ghatak Sports Academy India
          </span>
        </a>
        {/* Desktop & Large Tablet Links */}
        <div className="hidden lg:flex gap-5 xl:gap-8 items-center">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-gray-800 font-medium hover:text-red-700 hover:underline underline-offset-8 transition-all duration-150 text-sm md:text-base lg:text-lg px-1 tracking-wide"
            >
              {link.name}
            </a>
          ))}
          <a
            href="/admin/login"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-yellow-400 text-black font-semibold shadow hover:bg-yellow-500 transition ml-1 md:ml-2"
          >
            <LogIn className="w-5 h-5" /> <span className="hidden sm:inline">Admin Panel</span>
          </a>
        </div>
        {/* Tablet/Mid-Size Horizontal Nav */}
        <div className="hidden md:flex lg:hidden gap-2 xs:gap-3 items-center">
          {navLinks.slice(0, 4).map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-gray-800 font-medium hover:text-red-700 hover:underline underline-offset-8 transition-all duration-150 text-xs xs:text-sm md:text-base px-1 tracking-wide"
            >
              {link.name}
            </a>
          ))}
          {/* Hamburger menu for remaining + admin */}
          <button
            className="p-2 rounded hover:bg-yellow-100 transition h-10 w-10 flex items-center justify-center"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle mobile navigation"
          >
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded focus:outline-none text-gray-800 hover:bg-yellow-100 transition h-10 w-10 flex items-center justify-center"
          onClick={() => setMobileOpen((p) => !p)}
          aria-label="Open menu"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      {/* Mobile & Tablet Slide Panel */}
      {(mobileOpen && (
        <div className="md:hidden bg-white border-t border-yellow-200 animate-fade-in shadow-lg">
          <div className="flex flex-col py-5 px-4 xs:px-6 gap-2 xs:gap-4">
            <div className="flex items-center gap-2 xs:gap-3 mb-2">
              <img
                src="/assets/img/logo.webp"
                alt="GSAI Logo"
                className="w-8 h-8 xs:w-9 xs:h-9 rounded-full border border-yellow-400"
              />
              <span className="font-bold text-base text-black">GSAI</span>
              <span className="text-xs font-semibold text-yellow-700 ml-2 xs:ml-3 border-l border-yellow-200 pl-1 xs:pl-2">
                Ghatak Sports Academy India
              </span>
            </div>
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-800 font-medium py-2 rounded hover:bg-yellow-100 transition text-sm xs:text-base px-2 w-full"
                onClick={() => setMobileOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <a
              href="/admin/login"
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-yellow-400 text-black font-semibold shadow hover:bg-yellow-500 transition mt-2"
              onClick={() => setMobileOpen(false)}
            >
              <LogIn className="w-5 h-5" /> Admin Panel
            </a>
          </div>
        </div>
      )) ||
        // Expanded tablet dropdown for mid-size menu
        (mobileOpen && (
          <div className="hidden md:flex lg:hidden flex-col bg-white border-t border-yellow-200 animate-fade-in shadow-lg px-4 pt-2 pb-4">
            {/* Display remaining links and admin */}
            {navLinks.slice(4).map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-800 font-medium py-2 rounded hover:bg-yellow-100 transition text-sm xs:text-base px-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <a
              href="/admin/login"
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-yellow-400 text-black font-semibold shadow hover:bg-yellow-500 transition mt-2"
              onClick={() => setMobileOpen(false)}
            >
              <LogIn className="w-5 h-5" /> Admin Panel
            </a>
          </div>
        ))}
    </nav>
  );
}
