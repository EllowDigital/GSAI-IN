import React from 'react';
import { useNavbar } from '../hooks/useNavbar';
import { DesktopNavbar } from './nav/DesktopNavbar';
import { MobileNavbar } from './nav/MobileNavbar';

export default function Navbar() {
  const { mobileOpen, setMobileOpen, scrolled } = useNavbar();

  const containerClasses = scrolled
    ? 'bg-black/80 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.5)] border-white/10'
    : 'bg-black/40 backdrop-blur-sm shadow-none border-white/5';

  const navSafePadding = {
    paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
    paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0px))',
  } as React.CSSProperties;

  return (
    <nav
      className="fixed inset-x-0 top-0 z-[70] pt-2 sm:pt-4 pb-2 pointer-events-none"
      role="navigation"
      aria-label="Main navigation"
      style={navSafePadding}
    >
      <div className="nav-shell w-full flex justify-center">
        <div
          className={`pointer-events-auto rounded-full border transition-all duration-500 ease-out ${containerClasses} w-[94%] md:w-auto md:min-w-[500px]`}
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
