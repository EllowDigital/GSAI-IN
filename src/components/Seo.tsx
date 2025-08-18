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

const defaultSiteUrl = 'https://ghatakgsai.netlify.app';
const defaultImage = `${defaultSiteUrl}/assets/img/social-preview.png`;
const defaultAuthor = 'Ghatak Sports Academy India';
const siteName = 'Ghatak Sports Academy India™';

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
  const fullImageUrl = image
    ? image.startsWith('http')
      ? image
      : `${defaultSiteUrl}${image}`
    : defaultImage;
  const fullCanonicalUrl = canonical ?? defaultSiteUrl;

  // Generate robots meta tag
  const robots = [];
  if (noIndex) robots.push('noindex');
  if (noFollow) robots.push('nofollow');
  const robotsContent = robots.length > 0 ? robots.join(', ') : 'index, follow';

  return (
    <Helmet prioritizeSeoTags>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robotsContent} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      {author && <meta name="author" content={author} />}
      {category && <meta name="category" content={category} />}

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:alt" content={imageAlt || title} />
      <meta property="og:image:width" content={imageWidth.toString()} />
      <meta property="og:image:height" content={imageHeight.toString()} />
      <meta property="og:image:type" content="image/png" />

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

      {/* Performance & Technical Meta Tags */}
      <meta name="theme-color" content="#eab308" />
      <meta name="msapplication-TileColor" content="#eab308" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />

      {/* DNS Prefetch for Performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//jddeuhrocglnisujixdt.supabase.co" />

      {/* Canonical and Language Tags */}
      <link rel="canonical" href={fullCanonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={fullCanonicalUrl} />
      <link rel="alternate" hrefLang="en" href={fullCanonicalUrl} />

      {alternateLanguages.map(({ hreflang, href }) => (
        <link key={hreflang} rel="alternate" hrefLang={hreflang} href={href} />
      ))}

      {/* Structured Data as JSON-LD */}
      {structuredData?.map((sd, i) => (
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
