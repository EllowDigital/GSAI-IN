/**
 * PageTracker Component
 * * Manages Google Analytics 4 (GA4) Virtual Pageviews via Google Tag Manager (GTM).
 *
 * SPA COMPATIBILITY:
 * - Solves the "Single Page Load" issue where GTM only fires once on entry.
 * - Manually triggers a 'pageview' event on every React Router location change.
 * * GTM REQUIREMENTS:
 * 1. Data Layer Variable: 'page_path' (maps to dlv page_path)
 * 2. Data Layer Variable: 'page_title' (maps to dlv page_title)
 * 3. Custom Event Trigger: Event name 'page_view_custom'
 * 4. GA4 Configuration Tag: Disable 'Send a page view event when this configuration loads'
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/utils/gtm';

export const PageTracker: React.FC = () => {
  const location = useLocation();
  const lastTrackedPath = useRef<string>('');

  useEffect(() => {
    // 1. Construct full path including query strings (e.g., /dashboard?user=123)
    const currentPath = location.pathname + location.search;

    // 2. Prevent duplicate tracking of the same path (Safeguard for React Strict Mode)
    if (lastTrackedPath.current === currentPath) return;

    /**
     * 3. Sync Delay
     * We wrap this in a small timeout/requestAnimationFrame because 
     * document.title often updates slightly AFTER the route change completes.
     * This ensures GA4 doesn't log the title of the previous page.
     */
    const trackingTimeout = setTimeout(() => {
      const pageTitle = document.title || 'GSAI Portal';
      
      // Execute the GTM Push
      trackPageView(currentPath, pageTitle);
      
      // Update the reference
      lastTrackedPath.current = currentPath;
    }, 100);

    return () => clearTimeout(trackingTimeout);
  }, [location]);

  // Non-rendering component
  return null;
};

export default PageTracker;