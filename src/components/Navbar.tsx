import React from 'react';
import { useNavbar } from '../hooks/useNavbar';
import { DesktopNavbar } from './nav/DesktopNavbar';
import { MobileNavbar } from './nav/MobileNavbar';

export default function Navbar() {
  const { mobileOpen, setMobileOpen, scrolled } = useNavbar();

  const containerClasses = scrolled
    ? 'bg-white shadow-[0_8px_20px_rgba(15,23,42,0.08)] border-black/5'
    : 'bg-white/95 shadow-[0_2px_16px_rgba(15,23,42,0.04)] border-transparent';

  return (
    <nav
      className="fixed inset-x-0 top-0 z-[70] px-3 sm:px-5 lg:px-8 pt-2 sm:pt-3 lg:pt-3 pb-2 pointer-events-none"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-6xl xl:max-w-7xl mx-auto">
        <div
          className={`pointer-events-auto rounded-2xl border transition-all duration-300 ease-out ${containerClasses}`}
        >
          <div className="flex flex-col rounded-2xl">
            <DesktopNavbar />
            <MobileNavbar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
          </div>
        </div>
      </div>
    </nav>
  );
}
