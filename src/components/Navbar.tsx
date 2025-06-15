
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
      <div className="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-5 py-2 md:py-3">
        {/* Logo/Brand name and Title */}
        <a href="#" className="flex items-center gap-3 font-black text-lg xs:text-xl tracking-wider text-red-700 select-none">
          <img
            src="/assets/img/logo.webp"
            alt="GSAI Logo"
            className="w-10 h-10 rounded-full border-2 border-yellow-400 shadow-sm"
          />
          <span className="hidden xs:inline font-extrabold text-lg tracking-tighter">GSAI</span>
          <span className="hidden md:inline text-gray-900 font-bold text-base md:text-xl ml-2 pl-3 border-l border-yellow-300 tracking-tight">
            Ghatak Sports Academy India
          </span>
        </a>
        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 lg:gap-9 items-center">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-gray-800 font-medium hover:text-red-700 hover:underline underline-offset-8 transition-all duration-150 text-base lg:text-lg px-1 tracking-wide"
            >
              {link.name}
            </a>
          ))}
          <a
            href="/admin/login"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-yellow-400 text-black font-semibold shadow hover:bg-yellow-500 transition ml-2"
          >
            <LogIn className="w-5 h-5" /> <span className="hidden sm:inline">Admin Panel</span>
          </a>
        </div>
        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded focus:outline-none text-gray-800 hover:bg-yellow-100 transition"
          onClick={() => setMobileOpen((p) => !p)}
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      {/* Mobile Panel */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-yellow-200 animate-fade-in shadow-lg">
          <div className="flex flex-col py-5 px-6 gap-4">
            <div className="flex items-center gap-3 mb-2">
              <img
                src="/assets/img/logo.webp"
                alt="GSAI Logo"
                className="w-9 h-9 rounded-full border border-yellow-400"
              />
              <span className="font-bold text-base text-black">GSAI</span>
              <span className="text-xs font-semibold text-yellow-700 ml-3 border-l border-yellow-200 pl-2">
                Ghatak Sports Academy India
              </span>
            </div>
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-800 font-medium py-2 rounded hover:bg-yellow-100 transition text-base px-2"
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
      )}
    </nav>
  );
}

