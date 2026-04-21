import React from 'react';
import { useNavbar } from '@/hooks/useNavbar';
import { DesktopNavbar } from '@/components/layout/navigation/DesktopNavbar';
import { MobileNavbar } from '@/components/layout/navigation/MobileNavbar';
import { navLinks } from '@/constants/navLinks';

export default function Navbar() {
  const { mobileOpen, setMobileOpen, scrolled } = useNavbar();
  const [activeHash, setActiveHash] = React.useState('#hero');

  const containerClasses = scrolled
    ? 'bg-black/65 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/14 supports-[backdrop-filter]:bg-black/45'
    : 'bg-black/45 backdrop-blur-2xl shadow-[0_14px_40px_rgba(0,0,0,0.45)] border border-white/10 supports-[backdrop-filter]:bg-black/35';

  React.useEffect(() => {
    if (typeof window === 'undefined' || window.location.pathname !== '/') {
      setActiveHash('');
      return;
    }

    const sectionHashes = navLinks.map((link) => link.href);
    let rafId = 0;

    const updateActiveHash = () => {
      const offset = 140;
      let current = '#hero';

      for (const hash of sectionHashes) {
        const section = document.querySelector(hash);
        if (!section) continue;

        const top = section.getBoundingClientRect().top + window.scrollY;
        if (window.scrollY + offset >= top) {
          current = hash;
        }
      }

      setActiveHash((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        updateActiveHash();
        rafId = 0;
      });
    };

    updateActiveHash();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

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
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(140%_120%_at_10%_0%,rgba(255,255,255,0.12),transparent_48%),radial-gradient(120%_100%_at_90%_100%,rgba(250,204,21,0.1),transparent_46%)]" />
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
          <div
            className={`pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent blur-xl transition-[transform,opacity] duration-[1300ms] ease-out ${
              scrolled
                ? 'translate-x-[320%] opacity-100'
                : 'translate-x-0 opacity-0'
            }`}
          />
          <div className="flex flex-col rounded-full">
            <DesktopNavbar activeHash={activeHash} />
            <MobileNavbar
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
              activeHash={activeHash}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
