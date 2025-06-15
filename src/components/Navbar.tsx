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
    <nav className="w-full fixed z-50 top-0 left-0 bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-2 sm:px-4 py-2 md:py-3">
        {/* Logo/Brand name */}
        <a href="#" className="font-black text-lg xs:text-xl tracking-wider text-red-700 flex items-center gap-2">
          <img src="/assets/img/logo.webp" alt="GSAI Logo" className="w-8 h-8 rounded-full border border-yellow-400" />
          <span className="hidden xs:inline">GSAI</span>
        </a>
        {/* Desktop Links */}
        <div className="hidden md:flex gap-4 lg:gap-6 items-center">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-gray-800 font-semibold hover:text-red-700 hover:underline underline-offset-4 text-base lg:text-lg transition"
            >
              {link.name}
            </a>
          ))}
          <a
            href="/admin/login"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-black font-bold shadow hover:bg-yellow-500 transition ml-2"
          >
            <LogIn className="w-5 h-5" /> <span className="hidden sm:inline">Admin Panel</span>
          </a>
        </div>
        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded focus:outline-none text-gray-800"
          onClick={() => setMobileOpen((p) => !p)}
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      {/* Mobile Panel */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-fade-in">
          <div className="flex flex-col py-4 px-6 gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-800 font-semibold py-2 rounded hover:bg-yellow-100 transition text-lg"
                onClick={() => setMobileOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <a
              href="/admin/login"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-black font-bold shadow hover:bg-yellow-500 transition mt-2"
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
