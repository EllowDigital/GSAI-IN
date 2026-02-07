/**
 * Google Tag Manager (GTM) Utilities
 *
 * Production-ready helper functions for tracking events via GTM in a React SPA.
 * All events are pushed to dataLayer, which GTM then processes and forwards to GA4.
 *
 * IMPORTANT:
 * - All tracking goes through GTM's dataLayer (never direct gtag calls)
 * - Event names should match triggers configured in your GTM container
 * - Keep event and parameter naming consistent across your app
 *
 * GTM CONTAINER SETUP REQUIRED:
 * 1. Variables: Create Data Layer Variables for event parameters
 * 2. Triggers: Create Custom Event triggers for each event name
 * 3. Tags: Link GA4 Event tags to triggers with appropriate parameters
 */

/**
 * Global TypeScript declarations for GTM dataLayer
 */
declare global {
  interface Window {
    dataLayer: any[];
  }
}

/**
 * Interface for GTM event data
 */
interface GTMEvent {
  event: string;
  [key: string]: any;
}

/**
 * Safely push events to GTM dataLayer
 * With error handling and development logging
 */
export const pushToDataLayer = (data: GTMEvent): void => {
  try {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push(data);

      // Log in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 GTM Event:', data);
      }
    } else {
      console.warn('⚠️ GTM dataLayer not available:', data);
    }
  } catch (error) {
    console.error('❌ Error pushing to dataLayer:', error, data);
  }
};

/**
 * Track pageview events for SPA navigation
 * Called automatically by PageTracker component
 * Can also be called manually if needed
 */
export const trackPageView = (pagePath: string, pageTitle?: string): void => {
  pushToDataLayer({
    event: 'pageview',
    page_path: pagePath,
    page_location: window.location.href,
    page_title: pageTitle || document.title,
  });
};

/**
 * Track scroll depth milestones
 * SEO-important metric for engagement tracking
 *
 * USAGE:
 * Call this when user scrolls past certain thresholds (25%, 50%, 75%, 100%)
 *
 * GTM SETUP:
 * - Trigger: Custom Event "scroll_depth"
 * - GA4 Event: scroll_depth with parameters: percent, page_path
 */
export const trackScrollDepth = (percent: number): void => {
  pushToDataLayer({
    event: 'scroll_depth',
    scroll_percent: percent,
    page_path: window.location.pathname,
  });
};

/**
 * Track CTA (Call-to-Action) button clicks
 * Critical for conversion tracking
 *
 * USAGE:
 * trackCTAClick('Sign Up', '/signup', 'hero_section');
 *
 * GTM SETUP:
 * - Trigger: Custom Event "cta_click"
 * - GA4 Event: cta_click with parameters: button_text, button_url, section
 */
export const trackCTAClick = (
  buttonText: string,
  buttonUrl: string,
  section?: string
): void => {
  pushToDataLayer({
    event: 'cta_click',
    button_text: buttonText,
    button_url: buttonUrl,
    section: section || 'unknown',
    page_path: window.location.pathname,
  });
};

/**
 * Track form submissions
 * Essential for lead generation tracking
 *
 * USAGE:
 * trackFormSubmit('contact_form', 'Contact', true);
 *
 * GTM SETUP:
 * - Trigger: Custom Event "form_submit"
 * - GA4 Event: form_submit with parameters: form_id, form_name, success
 */
export const trackFormSubmit = (
  formId: string,
  formName: string,
  success: boolean = true
): void => {
  pushToDataLayer({
    event: 'form_submit',
    form_id: formId,
    form_name: formName,
    form_success: success,
    page_path: window.location.pathname,
  });
};

/**
 * Track form validation errors
 * Helps identify UX issues with forms
 *
 * USAGE:
 * trackFormError('contact_form', 'email', 'Invalid email format');
 *
 * GTM SETUP:
 * - Trigger: Custom Event "form_error"
 * - GA4 Event: form_error with parameters: form_id, field_name, error_message
 */
export const trackFormError = (
  formId: string,
  fieldName: string,
  errorMessage: string
): void => {
  pushToDataLayer({
    event: 'form_error',
    form_id: formId,
    field_name: fieldName,
    error_message: errorMessage,
    page_path: window.location.pathname,
  });
};

/**
 * Track outbound link clicks
 * Important for understanding user behavior and referral traffic
 *
 * USAGE:
 * trackOutboundClick('https://example.com', 'Partner Site');
 *
 * GTM SETUP:
 * - Trigger: Custom Event "outbound_click"
 * - GA4 Event: click with parameters: link_url, link_domain, link_text
 */
export const trackOutboundClick = (url: string, linkText?: string): void => {
  try {
    const linkUrl = new URL(url);
    pushToDataLayer({
      event: 'outbound_click',
      link_url: url,
      link_domain: linkUrl.hostname,
      link_text: linkText || url,
      page_path: window.location.pathname,
    });
  } catch (error) {
    console.error('Invalid URL for outbound tracking:', url);
  }
};

/**
 * Track file downloads
 * Track PDF, images, videos, etc.
 *
 * USAGE:
 * trackFileDownload('/downloads/brochure.pdf', 'Brochure PDF');
 *
 * GTM SETUP:
 * - Trigger: Custom Event "file_download"
 * - GA4 Event: file_download with parameters: file_name, file_extension, file_url
 */
export const trackFileDownload = (fileUrl: string, fileName?: string): void => {
  const url = new URL(fileUrl, window.location.href);
  const pathParts = url.pathname.split('/');
  const file = pathParts[pathParts.length - 1];
  const extension = file.split('.').pop() || 'unknown';

  pushToDataLayer({
    event: 'file_download',
    file_name: fileName || file,
    file_extension: extension,
    file_url: fileUrl,
    page_path: window.location.pathname,
  });
};

/**
 * Track video interactions
 * For embedded videos (YouTube, Vimeo, native HTML5)
 *
 * USAGE:
 * trackVideo('play', 'Introduction Video', 'https://youtube.com/watch?v=...');
 *
 * GTM SETUP:
 * - Trigger: Custom Event "video_interaction"
 * - GA4 Event: video_[action] with parameters: video_title, video_url, video_percent
 */
export const trackVideo = (
  action: 'play' | 'pause' | 'complete' | 'progress',
  videoTitle: string,
  videoUrl?: string,
  percentWatched?: number
): void => {
  pushToDataLayer({
    event: 'video_interaction',
    video_action: action,
    video_title: videoTitle,
    video_url: videoUrl || '',
    video_percent: percentWatched || 0,
    page_path: window.location.pathname,
  });
};

/**
 * Track search queries
 * If your site has search functionality
 *
 * USAGE:
 * trackSearch('martial arts classes', 5);
 *
 * GTM SETUP:
 * - Trigger: Custom Event "site_search"
 * - GA4 Event: search with parameters: search_term, search_results
 */
export const trackSearch = (searchTerm: string, resultCount?: number): void => {
  pushToDataLayer({
    event: 'site_search',
    search_term: searchTerm,
    search_results: resultCount || 0,
    page_path: window.location.pathname,
  });
};

/**
 * Track ecommerce/conversion events
 * For signup, purchase, registration, etc.
 *
 * USAGE:
 * trackConversion('membership_signup', 'Premium Plan', 99.99);
 *
 * GTM SETUP:
 * - Trigger: Custom Event "conversion"
 * - GA4 Event: conversion with parameters: conversion_type, conversion_label, value
 */
export const trackConversion = (
  conversionType: string,
  conversionLabel: string,
  value?: number,
  currency: string = 'INR'
): void => {
  pushToDataLayer({
    event: 'conversion',
    conversion_type: conversionType,
    conversion_label: conversionLabel,
    value: value || 0,
    currency: currency,
    page_path: window.location.pathname,
  });
};

/**
 * Track custom events
 * Generic function for any custom event not covered above
 *
 * USAGE:
 * trackCustomEvent('newsletter_signup', { source: 'footer', category: 'engagement' });
 *
 * GTM SETUP:
 * - Trigger: Custom Event with your event name
 * - GA4 Event: Custom with your parameters
 */
export const trackCustomEvent = (
  eventName: string,
  eventParams: Record<string, any> = {}
): void => {
  pushToDataLayer({
    event: eventName,
    ...eventParams,
    page_path: window.location.pathname,
  });
};

/**
 * Initialize GTM tracking (optional)
 * Can be used to set user properties or initial dataLayer state
 *
 * USAGE:
 * Call this in your App.tsx useEffect on mount
 */
export const initializeGTM = (userId?: string, userType?: string): void => {
  pushToDataLayer({
    event: 'gtm_initialized',
    user_id: userId || null,
    user_type: userType || 'anonymous',
    app_version: '1.0.0', // Your app version
    environment: process.env.NODE_ENV,
  });
};

/**
 * Track user timing/performance metrics
 * Useful for Core Web Vitals and custom performance tracking
 *
 * USAGE:
 * trackTiming('api_call', 'fetch_students', 1234);
 *
 * GTM SETUP:
 * - Trigger: Custom Event "timing"
 * - GA4 Event: timing_complete with parameters
 */
export const trackTiming = (
  timingCategory: string,
  timingLabel: string,
  timeMs: number
): void => {
  pushToDataLayer({
    event: 'timing',
    timing_category: timingCategory,
    timing_label: timingLabel,
    timing_value: timeMs,
    page_path: window.location.pathname,
  });
};

/**
 * Track exceptions/errors
 * Send JavaScript errors to GA4 for monitoring
 *
 * USAGE:
 * trackException('API Error', false);
 *
 * GTM SETUP:
 * - Trigger: Custom Event "exception"
 * - GA4 Event: exception with parameters
 */
export const trackException = (
  description: string,
  fatal: boolean = false
): void => {
  pushToDataLayer({
    event: 'exception',
    exception_description: description,
    exception_fatal: fatal,
    page_path: window.location.pathname,
  });
};

// Export all tracking functions as a single object for easier imports
export const GTM = {
  push: pushToDataLayer,
  pageView: trackPageView,
  scrollDepth: trackScrollDepth,
  ctaClick: trackCTAClick,
  formSubmit: trackFormSubmit,
  formError: trackFormError,
  outboundClick: trackOutboundClick,
  fileDownload: trackFileDownload,
  video: trackVideo,
  search: trackSearch,
  conversion: trackConversion,
  customEvent: trackCustomEvent,
  initialize: initializeGTM,
  timing: trackTiming,
  exception: trackException,
};

export default GTM;
