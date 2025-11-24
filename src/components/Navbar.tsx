import React from 'react';
import { useNavbar } from '../hooks/useNavbar';
import { DesktopNavbar } from './nav/DesktopNavbar';
import { MobileNavbar } from './nav/MobileNavbar';

export default function Navbar() {
  const { mobileOpen, setMobileOpen, scrolled } = useNavbar();

  const containerClasses = scrolled
    ? 'bg-white shadow-[0_8px_20px_rgba(15,23,42,0.08)] border-black/5'
    : 'bg-white/95 shadow-[0_2px_16px_rgba(15,23,42,0.04)] border-transparent';

  const navSafePadding = {
    paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
    paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0px))',
  } as React.CSSProperties;

  return (
    <nav
      className="fixed inset-x-0 top-0 z-[70] pt-2 sm:pt-3 pb-2 pointer-events-none"
      role="navigation"
      aria-label="Main navigation"
      style={navSafePadding}
    >
      <div className="nav-shell w-full flex justify-center">
        <div
          className={`pointer-events-auto rounded-full border transition-all duration-300 ease-out ${containerClasses} w-[94%] md:w-auto md:min-w-[450px]`}
        >
          <div className="flex flex-col rounded-full">
            <DesktopNavbar />
            <MobileNavbar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
          </div>
        </div>
      </div>
    </nav>
  );
}
