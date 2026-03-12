/**
 * PageTracker Component
 *
 * This component handles SPA (Single Page Application) pageview tracking for Google Analytics 4 via GTM.
 *
 * WHY THIS IS NEEDED FOR SPAs:
 * - React SPAs don't trigger traditional page loads on navigation
 * - GTM only fires a pageview on initial page load by default
 * - Without this, only the first page visit gets tracked
 * - This component pushes pageview events to dataLayer on every route change
 *
 * REQUIREMENTS:
 * - GTM must be installed in index.html (BEFORE React loads)
 * - GA4 Configuration Tag in GTM must have "Page views" trigger disabled
 * - Create a Custom Event trigger in GTM for event name: "pageview"
 * - Link this trigger to your GA4 Configuration Tag
 *
 * HOW IT WORKS:
 * 1. Listens to React Router location changes using useLocation hook
 * 2. On route change, pushes a pageview event to dataLayer with full path
 * 3. GTM receives the event and forwards it to GA4
 * 4. Works on initial load, route changes, and browser back/forward
 *
 * PRODUCTION SETUP IN GTM:
 * 1. Create Variable: "Page Path" (type: Data Layer Variable, name: page_path)
 * 2. Create Trigger: "SPA Pageview" (type: Custom Event, event name: "pageview")
 * 3. Update GA4 Config Tag:
 *    - Disable built-in pageview (check "Send a pageview event when this configuration loads": NO)
 *    - Add trigger: "SPA Pageview"
 *    - Set page_path parameter to {{Page Path}} variable
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/utils/gtm';

export const PageTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Construct full page path including query parameters
    const pagePath = location.pathname + location.search;

    // Use centralized trackPageView utility for consistent tracking
    trackPageView(pagePath, document.title);
  }, [location]); // Re-run whenever route changes

  // This component doesn't render anything
  return null;
};

export default PageTracker;
