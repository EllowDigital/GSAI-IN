import React from 'react';
import { useNavbar } from '../hooks/useNavbar';
import { DesktopNavbar } from './nav/DesktopNavbar';
import { MobileNavbar } from './nav/MobileNavbar';

export default function Navbar() {
  const { mobileOpen, setMobileOpen, scrolled } = useNavbar();

  return (
    <nav
      className="fixed inset-x-0 top-0 z-[70] px-3 sm:px-4 lg:px-6 pt-3 pb-2 pointer-events-none bg-black"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-6xl xl:max-w-7xl mx-auto">
        <div
          className={`pointer-events-auto rounded-3xl border transition-all duration-300 backdrop-blur-xl ${
            scrolled
              ? 'bg-white/85 border-white/30 shadow-[0_20px_60px_rgba(15,23,42,0.18)]'
              : 'bg-white/40 border-white/25 shadow-[0_25px_80px_rgba(15,23,42,0.28)]'
          }`}
        >
          <div className="relative rounded-[28px] bg-gradient-to-r from-white/40 via-white/25 to-white/40">
            <div className="absolute inset-0 rounded-[28px] border border-white/20" aria-hidden="true"></div>
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
