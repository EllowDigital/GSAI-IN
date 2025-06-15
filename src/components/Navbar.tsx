import React, { useState } from "react";
import { Menu, X, LogIn } from "lucide-react";
import PWAInstallButton from "./PWAInstallButton";
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
          <PWAInstallButton />
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
                <PWAInstallButton />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <DropdownMenu open={mobileOpen} onOpenChange={setMobileOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className={`p-2 rounded focus:outline-none text-gray-800 hover:bg-yellow-100 transition h-11 w-11 flex items-center justify-center
                  ${mobileOpen ? "ring-2 ring-yellow-300" : ""}`}
                aria-label="Open mobile menu"
              >
                {mobileOpen ? <X size={30} /> : <Menu size={30} />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="z-[99] w-[92vw] max-w-[350px] bg-white rounded-2xl border border-yellow-300 shadow-2xl mt-3 ml-[-8px] px-0 py-0 overflow-hidden animate-fade-in"
              sideOffset={10}
            >
              <div className="flex items-center gap-3 px-5 pt-6 pb-2 border-b border-yellow-100 bg-white">
                <img
                  src="/assets/img/logo.webp"
                  alt="GSAI Logo"
                  className="w-10 h-10 rounded-full border border-yellow-400"
                />
                <span className="font-extrabold text-lg text-black tracking-tight">GSAI</span>
                <span className="text-sm font-semibold text-yellow-700 ml-4 border-l border-yellow-200 pl-3">
                  Ghatak Sports Academy India
                </span>
              </div>
              <div className="flex flex-col py-4 px-6 gap-3 bg-white">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="flex items-center gap-3 text-gray-800 font-semibold py-3 px-3 rounded-xl transition-all duration-200 hover:bg-yellow-100 active:bg-yellow-200 text-base"
                    onClick={() => setMobileOpen(false)}
                  >
                    {/* Add circle bullet */}
                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-2" />
                    <span>{link.name}</span>
                  </a>
                ))}
                <a
                  href="/admin/login"
                  className="flex items-center gap-2 justify-center px-6 py-3 rounded-xl bg-yellow-400 text-black font-semibold shadow hover:bg-yellow-500 active:bg-yellow-600 transition-all mt-2 text-base"
                  onClick={() => setMobileOpen(false)}
                >
                  <LogIn className="w-5 h-5" /> Admin Panel
                </a>
                <PWAInstallButton />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
