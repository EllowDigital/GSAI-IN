import React from 'react';
import { useNavbar } from '../hooks/useNavbar';
import { DesktopNavbar } from './nav/DesktopNavbar';
import { MobileNavbar } from './nav/MobileNavbar';

export default function Navbar() {
  const { mobileOpen, setMobileOpen, scrolled } = useNavbar();

  return (
    <nav
      className={`w-full fixed top-0 left-0 z-50 bg-white/90 backdrop-blur-md transition-all duration-300
        ${scrolled ? 'shadow-md border-b border-#ffffff-200' : 'border-b border-#ffffff-100'}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-10 py-2 md:py-3">
        <DesktopNavbar />
        <MobileNavbar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      </div>
    </nav>
  );
}
