import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to track page views for analytics and performance monitoring
 */
export function usePageViews() {
  const location = useLocation();
  const debugPageViews =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_PAGEVIEW_DEBUG === 'true';

  useEffect(() => {
    // Defer analytics work slightly to keep navigation transitions responsive.
    if (typeof window !== 'undefined') {
      if (debugPageViews) {
        console.log(`Page view: ${location.pathname}${location.search}`);
      }

      // Send to analytics service
      // gtag?.('config', 'GA_MEASUREMENT_ID', {
      //   page_path: location.pathname + location.search,
      // });
    }
  }, [debugPageViews, location.pathname, location.search]);

  useEffect(() => {
    // Avoid forcing layout if already at top.
    if (typeof window !== 'undefined' && window.scrollY > 2) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [location.pathname]);
}

export default usePageViews;
