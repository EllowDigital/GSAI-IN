/**
 * SEO Utilities for React SPA
 * 
 * Production-ready helpers for managing SEO in a Single Page Application
 * Handles canonical URLs, meta tags, structured data, and sitemap generation
 * 
 * IMPORTANT FOR SPAs:
 * - Use react-helmet-async for dynamic meta tag management
 * - Canonical URLs prevent duplicate content issues
 * - Update document title and meta on every route change
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Get canonical URL for current page
 * Ensures consistent URL format (no trailing slashes, lowercase, etc.)
 * 
 * USAGE:
 * const canonicalUrl = getCanonicalUrl();
 */
export const getCanonicalUrl = (customPath?: string): string => {
  const baseUrl = 'https://ghataksportsacademy.com';
  const path = customPath || window.location.pathname;
  
  // Normalize path: remove trailing slash, lowercase
  const normalizedPath = path
    .toLowerCase()
    .replace(/\/$/, '') // Remove trailing slash
    .replace(/\/+/g, '/'); // Replace multiple slashes with single

  // Root path should not have trailing content
  return normalizedPath === '' || normalizedPath === '/'
    ? baseUrl
    : `${baseUrl}${normalizedPath}`;
};

/**
 * Hook to update canonical URL on route changes
 * Automatically adds/updates canonical link tag in document head
 * 
 * USAGE:
 * function MyPage() {
 *   useCanonicalUrl(); // Automatically manages canonical URL
 *   return <div>...</div>;
 * }
 */
export const useCanonicalUrl = (customPath?: string): void => {
  const location = useLocation();

  useEffect(() => {
    const canonicalUrl = getCanonicalUrl(customPath || location.pathname);

    // Find or create canonical link tag
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }

    canonicalLink.setAttribute('href', canonicalUrl);

    if (process.env.NODE_ENV === 'development') {
      console.log('🔗 Canonical URL updated:', canonicalUrl);
    }
  }, [location.pathname, customPath]);
};

/**
 * Generate structured data (JSON-LD) for SEO
 * Returns properly formatted JSON-LD script content
 * 
 * USAGE:
 * const breadcrumbData = generateStructuredData('BreadcrumbList', {
 *   itemListElement: [...]
 * });
 */
export const generateStructuredData = (
  type: string,
  data: Record<string, any>
): string => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return JSON.stringify(structuredData, null, 2);
};

/**
 * Get page title based on route
 * Centralized function for consistent page titles
 * 
 * USAGE:
 * const title = getPageTitle('/events');
 */
export const getPageTitle = (pathname: string): string => {
  const baseTitle = 'Ghatak Sports Academy India™';
  const separator = '|';

  const titleMap: Record<string, string> = {
    '/': `${baseTitle} ${separator} Top Martial Arts Training in India`,
    '/events': `Events ${separator} ${baseTitle}`,
    '/news': `Latest News ${separator} ${baseTitle}`,
    '/blogs': `Martial Arts Blog ${separator} ${baseTitle}`,
    '/gallery': `Photo Gallery ${separator} ${baseTitle}`,
    '/privacy': `Privacy Policy ${separator} ${baseTitle}`,
    '/terms': `Terms of Service ${separator} ${baseTitle}`,
    '/locations/lucknow': `Lucknow Location ${separator} ${baseTitle}`,
  };

  // Check for dynamic routes
  if (pathname.startsWith('/blog/')) {
    return `Blog Post ${separator} ${baseTitle}`;
  }
  if (pathname.startsWith('/event/')) {
    return `Event Details ${separator} ${baseTitle}`;
  }
  if (pathname.startsWith('/news/')) {
    return `News Article ${separator} ${baseTitle}`;
  }

  return titleMap[pathname] || baseTitle;
};

/**
 * Get meta description based on route
 * Centralized function for consistent meta descriptions
 * 
 * USAGE:
 * const description = getMetaDescription('/events');
 */
export const getMetaDescription = (pathname: string): string => {
  const defaultDescription = 
    'Join Ghatak Sports Academy India™ — the nation\'s top martial arts and self-defense institute. Train in karate, taekwondo, fitness, and more.';

  const descriptionMap: Record<string, string> = {
    '/': defaultDescription,
    '/events': 'Upcoming martial arts events, tournaments, and workshops at Ghatak Sports Academy India. Join us for world-class training events.',
    '/news': 'Latest news and updates from Ghatak Sports Academy India. Stay informed about achievements, announcements, and academy updates.',
    '/blogs': 'Expert insights on martial arts training, techniques, and fitness from Ghatak Sports Academy India. Learn from professional coaches.',
    '/gallery': 'Photo gallery showcasing training sessions, events, and student achievements at Ghatak Sports Academy India.',
    '/privacy': 'Privacy Policy for Ghatak Sports Academy India. Learn how we protect your personal information.',
    '/terms': 'Terms of Service for Ghatak Sports Academy India. Read our policies and guidelines.',
    '/locations/lucknow': 'Visit our Lucknow location in Indira Nagar. Get directions, contact information, and class schedules.',
  };

  return descriptionMap[pathname] || defaultDescription;
};

/**
 * Get Open Graph image based on route
 * Returns appropriate social sharing image URL
 * 
 * USAGE:
 * const ogImage = getOGImage('/events');
 */
export const getOGImage = (customImage?: string): string => {
  const defaultImage = 'https://ghataksportsacademy.com/assets/img/social-preview.png';
  return customImage || defaultImage;
};

/**
 * Check for duplicate routes/canonical issues
 * Helps prevent SEO problems during development
 * 
 * USAGE:
 * const hasDuplicates = checkForDuplicateRoutes(['/event', '/events']);
 */
export const checkForDuplicateRoutes = (routes: string[]): boolean => {
  const normalized = routes.map(route => 
    route.toLowerCase().replace(/\/$/, '')
  );
  
  const uniqueRoutes = new Set(normalized);
  const hasDuplicates = uniqueRoutes.size !== normalized.length;

  if (hasDuplicates && process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Duplicate routes detected:', routes);
  }

  return hasDuplicates;
};

/**
 * Generate sitemap entry for a URL
 * Helper for building sitemap.xml programmatically
 * 
 * USAGE:
 * const sitemapEntry = generateSitemapEntry('/events', 'daily', 0.8);
 */
export const generateSitemapEntry = (
  url: string,
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'weekly',
  priority: number = 0.5,
  lastmod?: string
): string => {
  const baseUrl = 'https://ghataksportsacademy.com';
  const fullUrl = `${baseUrl}${url}`;
  const lastModDate = lastmod || new Date().toISOString();

  return `
  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${lastModDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
};

/**
 * Validate URL structure for SEO
 * Checks for common SEO issues in URLs
 * 
 * USAGE:
 * const isValid = validateUrlStructure('/blog/my-post');
 */
export const validateUrlStructure = (url: string): {
  isValid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];

  // Check for uppercase characters
  if (url !== url.toLowerCase()) {
    issues.push('URL contains uppercase characters - should be lowercase');
  }

  // Check for trailing slash (should be consistent)
  if (url.length > 1 && url.endsWith('/')) {
    issues.push('URL has trailing slash - should be removed for consistency');
  }

  // Check for special characters (except dash and underscore)
  if (/[^a-z0-9\-_/]/.test(url)) {
    issues.push('URL contains special characters - use only lowercase, numbers, and dashes');
  }

  // Check for multiple consecutive slashes
  if (/\/{2,}/.test(url)) {
    issues.push('URL contains multiple consecutive slashes');
  }

  // Check URL length (Google recommends under 2048 characters, but shorter is better)
  if (url.length > 100) {
    issues.push('URL is very long - consider shortening for better SEO');
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};

/**
 * Generate robots meta tag content
 * Controls search engine crawling behavior
 * 
 * USAGE:
 * const robotsContent = getRobotsMetaContent(true, true);
 */
export const getRobotsMetaContent = (
  shouldIndex: boolean = true,
  shouldFollow: boolean = true
): string => {
  const index = shouldIndex ? 'index' : 'noindex';
  const follow = shouldFollow ? 'follow' : 'nofollow';
  return `${index}, ${follow}`;
};

/**
 * Check if page should be indexed
 * Some pages (admin, private) should not be indexed
 * 
 * USAGE:
 * const shouldIndex = shouldPageBeIndexed('/admin/dashboard');
 */
export const shouldPageBeIndexed = (pathname: string): boolean => {
  const noIndexPatterns = [
    /^\/admin/,
    /^\/login/,
    /^\/signup/,
    /^\/404/,
    /^\/(pages\/)?success/,
  ];

  return !noIndexPatterns.some(pattern => pattern.test(pathname));
};

/**
 * Get hreflang tags for multi-language support
 * Generates alternate language links
 * 
 * USAGE:
 * const hreflangTags = getHreflangTags('/events');
 */
export const getHreflangTags = (pathname: string): Array<{
  lang: string;
  url: string;
}> => {
  const baseUrl = 'https://ghataksportsacademy.com';
  
  return [
    { lang: 'x-default', url: `${baseUrl}${pathname}` },
    { lang: 'en', url: `${baseUrl}${pathname}` },
    { lang: 'en-IN', url: `${baseUrl}${pathname}` },
    { lang: 'hi-IN', url: `${baseUrl}${pathname}` },
  ];
};

/**
 * Track SEO issues in development
 * Logs potential SEO problems to console
 */
export const trackSEOIssues = (pathname: string): void => {
  if (process.env.NODE_ENV !== 'development') return;

  const { isValid, issues } = validateUrlStructure(pathname);
  
  if (!isValid) {
    console.warn('🔍 SEO Issues detected on:', pathname);
    issues.forEach(issue => console.warn('  -', issue));
  }

  if (!shouldPageBeIndexed(pathname)) {
    console.info('🤖 Page should not be indexed:', pathname);
  }
};

/**
 * Export all SEO utilities as a single object
 */
export const SEO = {
  getCanonicalUrl,
  useCanonicalUrl,
  generateStructuredData,
  getPageTitle,
  getMetaDescription,
  getOGImage,
  checkForDuplicateRoutes,
  generateSitemapEntry,
  validateUrlStructure,
  getRobotsMetaContent,
  shouldPageBeIndexed,
  getHreflangTags,
  trackSEOIssues,
};

export default SEO;
