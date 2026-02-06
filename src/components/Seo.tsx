import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Advanced SEO component with comprehensive meta tags, structured data, and performance optimizations
 */
type SeoProps = {
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

const primarySiteUrl = 'https://ghataksportsacademy.com';
const siteDomains = [primarySiteUrl];
const imageBaseUrl = primarySiteUrl;
const defaultImage = `${imageBaseUrl}/assets/img/social-preview.png`;
const defaultAuthor = 'Ghatak Sports Academy India';
const siteName = 'Ghatak Sports Academy India™';
const siteLogo = `${imageBaseUrl}/assets/img/logo.webp`;
const twitterHandle = '@ghataksportsacademy';
const socialProfiles = [
  'https://www.facebook.com/ghataksportsacademy',
  'https://www.instagram.com/ghataksportsacademy',
  'https://x.com/ghataksportsacademy',
  'https://www.linkedin.com/company/ghataksportsacademy',
];

function normalizeOrigin(value: string): string {
  return value.replace(/\/$/, '');
}

function resolveUrl(value: string | undefined, baseUrl: string): string {
  if (!value) return baseUrl;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('//')) return `https:${value}`;
  if (value.startsWith('/')) return `${baseUrl}${value}`;
  return `${baseUrl}/${value}`;
}

function getCanonicalBase(): string {
  return primarySiteUrl;
}

function buildCanonicalPath(url: string, fallbackBase: string): string {
  try {
    const parsed = new URL(url);
    const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    return path || '/';
  } catch {
    if (url.startsWith(fallbackBase)) {
      return url.slice(fallbackBase.length) || '/';
    }
    return '/';
  }
}

export function Seo({
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
  author = defaultAuthor,
  keywords = [],
  category,
  locale = 'en_US',
  alternateLanguages = [],
  children,
  structuredData,
  noIndex = false,
  noFollow = false,
}: SeoProps) {
  const canonicalBase = normalizeOrigin(getCanonicalBase());
  const fullImageUrl = image
    ? image.startsWith('http')
      ? image
      : `${imageBaseUrl}${image}`
    : defaultImage;
  const fullCanonicalUrl = resolveUrl(canonical, canonicalBase);
  const canonicalLower = fullCanonicalUrl.toLowerCase();
  const canonicalIsHome =
    canonicalLower === primarySiteUrl ||
    canonicalLower === `${primarySiteUrl}/`;
  const normalizedStructuredData = structuredData ?? [];

  const defaultStructuredDataEntries: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      url: primarySiteUrl,
      logo: {
        '@type': 'ImageObject',
        url: siteLogo,
        width: 512,
        height: 512,
      },
      sameAs: socialProfiles,
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          telephone: '+91-63941-35988',
          email: 'ghatakgsai@gmail.com',
          areaServed: 'IN',
          availableLanguage: ['en', 'hi'],
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: primarySiteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${primarySiteUrl}/?s={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  if (!canonicalIsHome) {
    const pathSegments = canonicalPath
      .split('/')
      .filter((seg) => seg.length > 0);
    const breadcrumbItems = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: primarySiteUrl,
      },
    ];

    let currentPath = primarySiteUrl;
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: index + 2,
        name: segment
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        item: currentPath,
      });
    });

    defaultStructuredDataEntries.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems,
    });
  }

  const structuredDataPayload = [
    ...defaultStructuredDataEntries,
    ...normalizedStructuredData,
  ];

  // Generate robots meta tag
  const robots = [];
  if (noIndex) robots.push('noindex');
  if (noFollow) robots.push('nofollow');
  const robotsContent = robots.length > 0 ? robots.join(', ') : 'index, follow';

  const canonicalPath = buildCanonicalPath(fullCanonicalUrl, canonicalBase);
  const alternateUrls = siteDomains.map(
    (domain) => `${domain}${canonicalPath}`
  );

  return (
    <Helmet prioritizeSeoTags>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={fullCanonicalUrl} />
      {alternateUrls
        .filter((href) => href !== fullCanonicalUrl)
        .map((href) => (
          <link key={`alternate-${href}`} rel="alternate" href={href} />
        ))}
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      {author && <meta name="author" content={author} />}
      {category && <meta name="category" content={category} />}
      <meta name="application-name" content={siteName} />
      <meta name="apple-mobile-web-app-title" content={siteName} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      {alternateLanguages.map(({ hreflang }) => (
        <meta
          key={`og-locale-${hreflang}`}
          property="og:locale:alternate"
          content={hreflang}
        />
      ))}
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:secure_url" content={fullImageUrl} />
      <meta property="og:image:alt" content={imageAlt || title} />
      <meta property="og:image:width" content={imageWidth.toString()} />
      <meta property="og:image:height" content={imageHeight.toString()} />
      <meta property="og:image:type" content="image/png" />
      {(modifiedDate || publishDate) && (
        <meta
          property="og:updated_time"
          content={(modifiedDate || publishDate) as string}
        />
      )}
      {socialProfiles.map((profileUrl) => (
        <meta key={profileUrl} property="og:see_also" content={profileUrl} />
      ))}

      {/* Article specific meta tags */}
      {type === 'article' && (
        <>
          {publishDate && (
            <meta property="article:published_time" content={publishDate} />
          )}
          {modifiedDate && (
            <meta property="article:modified_time" content={modifiedDate} />
          )}
          {author && <meta property="article:author" content={author} />}
          {category && <meta property="article:section" content={category} />}
          {keywords.map((keyword) => (
            <meta key={keyword} property="article:tag" content={keyword} />
          ))}
        </>
      )}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={imageAlt || title} />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />

      {/* Performance & Technical Meta Tags */}
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />
      <meta httpEquiv="x-dns-prefetch-control" content="on" />

      {/* Performance hints: preconnects and dns-prefetch are handled in `index.html` to avoid duplicates. */}

      {/* Canonical and Language Tags */}
      <link rel="canonical" href={fullCanonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={fullCanonicalUrl} />
      <link rel="alternate" hrefLang="en" href={fullCanonicalUrl} />
      <link rel="alternate" hrefLang="en-IN" href={fullCanonicalUrl} />
      <link rel="alternate" hrefLang="hi-IN" href={fullCanonicalUrl} />

      {alternateLanguages.map(({ hreflang, href }) => (
        <link key={hreflang} rel="alternate" hrefLang={hreflang} href={href} />
      ))}

      {/* Structured Data as JSON-LD */}
      {structuredDataPayload.map((sd, i) => (
        <script
          key={`jsonld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sd) }}
        />
      ))}

      {/* Additional children for custom meta tags */}
      {children}
    </Helmet>
  );
}
export default Seo;
