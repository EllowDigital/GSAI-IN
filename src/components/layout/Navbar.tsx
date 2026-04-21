import React from 'react';
import { useNavbar } from '@/hooks/useNavbar';
import { DesktopNavbar } from '@/components/layout/navigation/DesktopNavbar';
import { MobileNavbar } from '@/components/layout/navigation/MobileNavbar';

export default function Navbar() {
  const { mobileOpen, setMobileOpen, scrolled } = useNavbar();

  const containerClasses = scrolled
    ? 'bg-white/[0.12] backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] border border-white/30 supports-[backdrop-filter]:bg-white/[0.08]'
    : 'bg-white/[0.08] backdrop-blur-2xl shadow-[0_14px_40px_rgba(0,0,0,0.28)] border border-white/20 supports-[backdrop-filter]:bg-white/[0.06]';

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
          className={`pointer-events-auto relative overflow-hidden rounded-full border transition-all duration-500 ease-out ${containerClasses} w-[94%] md:w-auto md:min-w-[500px]`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(140%_120%_at_10%_0%,rgba(255,255,255,0.28),transparent_48%),radial-gradient(120%_100%_at_90%_100%,rgba(250,204,21,0.2),transparent_46%)]" />
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
          <div className="pointer-events-none absolute -left-10 -top-8 h-20 w-40 rotate-12 bg-white/25 blur-2xl" />
          <div className="flex flex-col rounded-full">
            <DesktopNavbar />
            <MobileNavbar
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
