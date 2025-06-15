import React, { useState } from "react";
import { Menu, X, LogIn } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "../components/ui/dropdown-menu";

// Only keep essential links for navigation clarity
const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "#about" },
  { name: "Programs", href: "#programs" },
  { name: "Gallery", href: "#gallery" },
  { name: "Blog/News", href: "#blog" },
  { name: "FAQ", href: "#faq" },
  { name: "Location", href: "#location" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Trap scroll underneath menus (removed for dropdown)
  React.useEffect(() => {
    if (mobileOpen) {
      // No scroll trap for dropdown
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Accessible close on route change – not handled here, but could listen for hash changes.

  return (
    <nav className="w-full fixed z-50 top-0 left-0 bg-white/90 backdrop-blur border-b border-yellow-100 shadow-md transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-2 xs:px-3 sm:px-5 md:px-8 lg:px-10 py-2 md:py-3">
        {/* SEO: logo img uses descriptive alt */}
        <a
          href="/"
          className="flex items-center gap-2 xs:gap-3 font-black text-base xs:text-lg md:text-xl tracking-wider text-red-700 select-none"
        >
          <img
            src="/assets/img/logo.webp"
            alt="Ghatak Sports Academy India™ official logo"
            loading="eager"
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
          {/* Hamburger dropdown for remaining + admin (tablet) */}
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
                  <a
                    key={link.name}
                    href={link.href}
                    className="block text-gray-800 font-medium py-2 rounded hover:bg-yellow-100 transition text-sm xs:text-base px-2 w-full"
                  >
                    {link.name}
                  </a>
                ))}
                <a
                  href="/admin/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-yellow-400 text-black font-semibold shadow hover:bg-yellow-500 transition mt-2"
                >
                  <LogIn className="w-5 h-5" /> Admin Panel
                </a>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <DropdownMenu open={mobileOpen} onOpenChange={setMobileOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 rounded focus:outline-none text-gray-800 hover:bg-yellow-100 transition h-10 w-10 flex items-center justify-center"
                aria-label="Open mobile menu"
              >
                {mobileOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="z-[99] w-[88vw] max-w-xs bg-white border border-yellow-200 rounded-xl shadow-2xl mt-2 ml-[-8px] p-0 overflow-hidden animate-fade-in"
              sideOffset={8}
            >
              <div className="flex items-center gap-2 xs:gap-3 px-4 pt-5 pb-2 border-b border-yellow-100 bg-white">
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
              <div className="flex flex-col py-2 px-4 xs:px-6 gap-2 xs:gap-4 bg-white">
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
