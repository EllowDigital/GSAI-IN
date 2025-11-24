import React from 'react';
import { useNavbar } from '../hooks/useNavbar';
import { DesktopNavbar } from './nav/DesktopNavbar';
import { MobileNavbar } from './nav/MobileNavbar';

export default function Navbar() {
  const { mobileOpen, setMobileOpen, scrolled } = useNavbar();
  const containerClasses = scrolled
    ? 'bg-black/35 border-white/15 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl'
    : 'bg-transparent border-transparent shadow-none backdrop-blur-0';
  const panelClasses = scrolled
    ? 'bg-gradient-to-r from-white/15 via-white/10 to-white/5'
    : 'bg-transparent';
  const outlineClasses = scrolled ? 'border-white/15' : 'border-transparent';

  return (
    <nav
      className="fixed inset-x-0 top-0 z-[70] px-3 sm:px-4 lg:px-6 pt-3 pb-2 pointer-events-none"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-6xl xl:max-w-7xl mx-auto relative">
        <div
          className={`pointer-events-auto rounded-3xl border transition-all duration-300 ${containerClasses}`}
        >
          <div className={`relative rounded-[26px] transition-all duration-300 ${panelClasses}`}>
            <div
              className={`absolute inset-0 rounded-[26px] border ${outlineClasses}`}
              aria-hidden="true"
            ></div>
            <div className="relative z-10">
              <DesktopNavbar />
              <MobileNavbar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
