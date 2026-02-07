/**
 * useScrollDepth Hook
 * 
 * React hook for tracking scroll depth milestones (25%, 50%, 75%, 100%)
 * Critical SEO metric that measures user engagement
 * 
 * USAGE:
 * ```tsx
 * import { useScrollDepth } from '@/hooks/useScrollDepth';
 * 
 * function MyComponent() {
 *   useScrollDepth(); // Automatically tracks scroll depth
 *   return <div>...</div>;
 * }
 * ```
 * 
 * HOW IT WORKS:
 * - Listens to scroll events (throttled for performance)
 * - Calculates percentage of page scrolled
 * - Fires GTM events at 25%, 50%, 75%, 100% thresholds
 * - Only fires once per threshold per page
 * - Resets on route change
 */

import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { trackScrollDepth } from '@/utils/gtm';

export const useScrollDepth = () => {
  const location = useLocation();
  const milestones = useRef<Set<number>>(new Set());
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Reset milestones on route change
  useEffect(() => {
    milestones.current.clear();
  }, [location.pathname]);

  const handleScroll = useCallback(() => {
    // Throttle scroll events for performance
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      // Calculate scroll percentage
      const scrollableDistance = documentHeight - windowHeight;
      const scrollPercent = Math.round(
        (scrollTop / scrollableDistance) * 100
      );

      // Define milestones to track
      const thresholds = [25, 50, 75, 100];

      // Check which thresholds have been reached
      for (const threshold of thresholds) {
        if (scrollPercent >= threshold && !milestones.current.has(threshold)) {
          milestones.current.add(threshold);
          trackScrollDepth(threshold);

          if (process.env.NODE_ENV === 'development') {
            console.log(`📊 Scroll Depth: ${threshold}%`);
          }
        }
      }
    }, 100); // Throttle to 100ms
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [handleScroll]);
};

export default useScrollDepth;
