import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminBackToTopButtonProps {
  /**
   * The ID of the scrollable container (e.g., "main-scroll-area").
   * If not provided, it safely defaults to the window.
   */
  targetId?: string;
}

export default function AdminBackToTopButton({
  targetId,
}: AdminBackToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Safely grab the target container or fallback to window
    const target = targetId ? document.getElementById(targetId) : window;
    if (!target) return;

    const handleScroll = () => {
      // Check scrollTop for elements, or scrollY for the window
      const scrollPosition = targetId
        ? (target as HTMLElement).scrollTop
        : window.scrollY;

      // Show button after 300px of scrolling
      setIsVisible(scrollPosition > 300);
    };

    // Passive listener improves scrolling performance
    target.addEventListener('scroll', handleScroll, { passive: true });

    // Initial check in case the page loads already scrolled
    handleScroll();

    return () => target.removeEventListener('scroll', handleScroll);
  }, [targetId]);

  const scrollToTop = () => {
    const target = targetId ? document.getElementById(targetId) : window;
    if (target) {
      target.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      className={cn(
        // Base positioning and sizing
        'fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full sm:bottom-8 sm:right-8',
        // Colors and shadows
        'bg-primary text-primary-foreground shadow-lg shadow-primary/30',
        // Transitions and hover states
        'transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/40',
        // Accessibility focus rings
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        // Visibility toggling via CSS for smooth animation
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-10 opacity-0'
      )}
    >
      <ChevronUp className="h-6 w-6 stroke-[2.5]" />
    </button>
  );
}
