import React from 'react';

/**
 * Seo component manages HTML titles, meta, structured data, canonical, and more.
 * Place <Seo .../> at the top of each page for best SEO.
 */
type SeoProps = {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  children?: React.ReactNode;
  structuredData?: object[];
};

const defaultSiteUrl = 'https://ghatakgsai.netlify.app';

export function Seo({
  title,
  description,
  canonical,
  image,
  children,
  structuredData,
}: SeoProps) {
  // Render common meta tags and any JSON-LD structured data.
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} key="desc" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      {/* Canonical tag */}
      <link rel="canonical" href={canonical ?? defaultSiteUrl} />
      {/* Hreflang (Assumed EN default) */}
      <link rel="alternate" hrefLang="en" href={canonical ?? defaultSiteUrl} />
      {/* Structured Data as JSON-LD */}
      {structuredData &&
        structuredData.map((sd, i) => (
          <script
            key={`jsonld-${i}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(sd) }}
          />
        ))}
      {/* Additional children can add custom meta, etc */}
      {children}
    </>
  );
}
export default Seo;
