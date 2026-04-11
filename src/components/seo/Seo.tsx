import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { ACADEMY_CONTACT_EMAIL } from '@/config/contact';

// --- Configuration ---
const SITE_CONFIG = {
  name: 'Ghatak Sports Academy India™',
  url: 'https://ghataksportsacademy.com',
  handle: '@ghataksportsacademy',
  author: 'Ghatak Sports Academy India',
  logo: 'https://ghataksportsacademy.com/assets/images/logo.webp',
  defaultImage:
    'https://ghataksportsacademy.com/assets/images/social-preview.png',
  contact: {
    phone: '+91-63941-35988',
    email: ACADEMY_CONTACT_EMAIL,
  },
  socials: [
    'https://www.facebook.com/ghataksportsacademy',
    'https://www.instagram.com/ghataksportsacademy',
    'https://x.com/ghataksportsacademy',
    'https://www.linkedin.com/company/ghataksportsacademy',
  ],
};

// --- Types ---
export type SeoProps = {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  type?: 'website' | 'article' | 'product' | 'profile';
  publishDate?: string;
  modifiedDate?: string;
  author?: string;
  keywords?: string[];
  category?: string;
  locale?: string;
  alternateLanguages?: { hreflang: string; href: string }[];
  children?: React.ReactNode;
  structuredData?: object[];
  noIndex?: boolean;
  noFollow?: boolean;
};

// --- Utilities ---
const resolveUrl = (path: string | undefined): string => {
  if (!path) return SITE_CONFIG.url;
  if (path.startsWith('http')) return path;
  return `${SITE_CONFIG.url.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

const resolveDefaultCanonical = (): string => {
  if (typeof window === 'undefined') return SITE_CONFIG.url;
  const pathname = window.location.pathname || '/';
  return resolveUrl(pathname);
};

const buildBreadcrumbs = (url: string) => {
  const urlObj = new URL(url);
  const segments = urlObj.pathname.split('/').filter(Boolean);

  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE_CONFIG.url,
    },
  ];

  let currentPath = SITE_CONFIG.url;
  segments.forEach((seg, i) => {
    currentPath += `/${seg}`;
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name: seg.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      item: currentPath,
    });
  });

  return items;
};

// --- Component ---
export const Seo = memo(
  ({
    title,
    description,
    canonical,
    image,
    imageAlt,
    imageWidth = 1200,
    imageHeight = 630,
    type = 'website',
    publishDate,
    modifiedDate,
    author = SITE_CONFIG.author,
    keywords = [],
    category,
    locale = 'en_US',
    alternateLanguages = [],
    children,
    structuredData = [],
    noIndex = false,
    noFollow = false,
  }: SeoProps) => {
    const fullCanonicalUrl = canonical
      ? resolveUrl(canonical)
      : resolveDefaultCanonical();
    const fullImageUrl = image ? resolveUrl(image) : SITE_CONFIG.defaultImage;
    const robotsContent = `${noIndex ? 'noindex' : 'index'}, ${noFollow ? 'nofollow' : 'follow'}`;

    // Structured Data logic
    const jsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        logo: SITE_CONFIG.logo,
        sameAs: SITE_CONFIG.socials,
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          telephone: SITE_CONFIG.contact.phone,
          email: SITE_CONFIG.contact.email,
          areaServed: 'IN',
          availableLanguage: ['en', 'hi'],
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_CONFIG.url}/?s={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ];

    // Add Breadcrumbs if not home
    if (new URL(fullCanonicalUrl).pathname !== '/') {
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: buildBreadcrumbs(fullCanonicalUrl),
      } as any);
    }

    // Merge custom structured data
    const finalJsonLd = [...jsonLd, ...structuredData];

    return (
      <Helmet prioritizeSeoTags>
        {/* Basic */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content={robotsContent} />
        <link rel="canonical" href={fullCanonicalUrl} />
        {keywords.length > 0 && (
          <meta name="keywords" content={keywords.join(', ')} />
        )}
        <meta name="author" content={author} />

        {/* Open Graph */}
        <meta property="og:site_name" content={SITE_CONFIG.name} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={fullCanonicalUrl} />
        <meta property="og:type" content={type} />
        <meta property="og:image" content={fullImageUrl} />
        <meta property="og:image:alt" content={imageAlt || title} />
        <meta property="og:image:width" content={imageWidth.toString()} />
        <meta property="og:image:height" content={imageHeight.toString()} />
        <meta property="og:locale" content={locale} />

        {/* Article Metadata */}
        {type === 'article' && (
          <>
            {publishDate && (
              <meta property="article:published_time" content={publishDate} />
            )}
            {modifiedDate && (
              <meta property="article:modified_time" content={modifiedDate} />
            )}
            {category && <meta property="article:section" content={category} />}
          </>
        )}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={SITE_CONFIG.handle} />
        <meta name="twitter:creator" content={SITE_CONFIG.handle} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={fullImageUrl} />

        {/* App & Tech */}
        <meta name="theme-color" content="#000000" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="alternate" hrefLang="x-default" href={fullCanonicalUrl} />
        {alternateLanguages.map((lang) => (
          <link
            key={lang.hreflang}
            rel="alternate"
            hrefLang={lang.hreflang}
            href={lang.href}
          />
        ))}

        {/* JSON-LD */}
        {finalJsonLd.map((data, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(data)}
          </script>
        ))}

        {children}
      </Helmet>
    );
  }
);

Seo.displayName = 'Seo';

export default Seo;
