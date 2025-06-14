
import React, { useState } from "react";
import { Menu, X, LogIn } from "lucide-react";

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
    <nav className="w-full fixed z-20 top-0 left-0 bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-2">
        {/* Logo/Brand name */}
        <a href="#" className="font-black text-xl tracking-wider text-red-700 flex items-center gap-2">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Emblem_of_India.svg/64px-Emblem_of_India.svg.png" alt="GSAI Logo" className="w-8 h-8 rounded-full border border-yellow-400" />
          GSAI
        </a>
        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 items-center">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-gray-800 font-semibold hover:text-red-700 hover:underline underline-offset-4 transition"
            >
              {link.name}
            </a>
          ))}
          <a
            href="/admin/login"
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-yellow-400 text-black font-bold shadow hover:bg-yellow-500 transition ml-2"
          >
            <LogIn className="w-5 h-5" /> Admin Panel
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
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="flex flex-col py-3 px-4 gap-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-800 font-semibold py-2 rounded hover:bg-yellow-50 transition"
                onClick={() => setMobileOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <a
              href="/admin/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400 text-black font-bold shadow hover:bg-yellow-500 transition"
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

