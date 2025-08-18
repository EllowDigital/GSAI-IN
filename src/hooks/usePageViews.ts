import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to track page views for analytics and performance monitoring
 */
export function usePageViews() {
  const location = useLocation();

  useEffect(() => {
    // Track page view for analytics (if implemented)
    if (typeof window !== 'undefined') {
      // You can integrate with Google Analytics, Mixpanel, etc. here
      console.log(`Page view: ${location.pathname}${location.search}`);
      
      // Send to analytics service
      // gtag?.('config', 'GA_MEASUREMENT_ID', {
      //   page_path: location.pathname + location.search,
      // });
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    // Scroll to top on route change for better UX
    window.scrollTo(0, 0);
  }, [location.pathname]);
}

export default usePageViews;