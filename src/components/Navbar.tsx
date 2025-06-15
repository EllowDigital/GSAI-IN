import React from 'react';
import { useNavbar } from '../hooks/useNavbar';
import { DesktopNavbar } from './nav/DesktopNavbar';
import { MobileNavbar } from './nav/MobileNavbar';
import { NavLogo } from './nav/NavLogo';

export default function Navbar() {
  const { mobileOpen, setMobileOpen, scrolled } = useNavbar();

  return (
    <nav
      className={`w-full fixed z-50 top-0 left-0 bg-white/90 backdrop-blur border-b transition-all duration-300 ${scrolled ? 'shadow-lg border-yellow-200' : 'shadow-md border-yellow-100'}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-2 xs:px-3 sm:px-5 md:px-8 lg:px-10 py-2 md:py-3">
        <NavLogo />
        <DesktopNavbar />
        <MobileNavbar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      </div>
    </nav>
  );
}
