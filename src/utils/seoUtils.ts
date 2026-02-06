/**
 * SEO utility functions for generating structured data and meta tags
 */

export const generateArticleStructuredData = (
  article: {
    id: string;
    title: string;
    description?: string | null;
    content: string;
    published_at?: string | null;
    image_url?: string | null;
    author?: string;
  },
  type: 'blog' | 'news'
) => {
  const baseUrl = 'https://ghataksportsacademy.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description || extractFirstSentence(article.content),
    image: article.image_url
      ? article.image_url.startsWith('http')
        ? article.image_url
        : `${baseUrl}${article.image_url}`
      : `${baseUrl}/assets/img/logo.webp`,
    datePublished: article.published_at || new Date().toISOString(),
    dateModified: article.published_at || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: article.author || 'Ghatak Sports Academy India',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ghatak Sports Academy India',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/assets/img/logo.webp`,
        width: 400,
        height: 400,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/${type}/${article.id}`,
    },
    articleSection: type === 'blog' ? 'Martial Arts Blog' : 'Academy News',
    wordCount: estimateWordCount(article.content),
    keywords: generateKeywordsFromContent(article.content, article.title),
  };
};

export const generateEventStructuredData = (event: {
  id: string;
  title: string;
  description?: string | null;
  from_date: string;
  to_date?: string | null;
  location?: string | null;
  image_url?: string | null;
}) => {
  const baseUrl = 'https://ghataksportsacademy.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: event.title,
    description:
      event.description ||
      'Join us for an exciting martial arts event at Ghatak Sports Academy.',
    startDate: event.from_date,
    endDate: event.to_date || event.from_date,
    location: {
      '@type': 'Place',
      name: event.location || 'Ghatak Sports Academy India',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IN',
      },
    },
    image: event.image_url
      ? event.image_url.startsWith('http')
        ? event.image_url
        : `${baseUrl}${event.image_url}`
      : `${baseUrl}/assets/img/logo.webp`,
    organizer: {
      '@type': 'Organization',
      name: 'Ghatak Sports Academy India',
      url: baseUrl,
    },
    url: `${baseUrl}/event/${event.id}`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  };
};

export const generateBreadcrumbStructuredData = (
  breadcrumbs: Array<{ name: string; url: string }>
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url,
    })),
  };
};

// Utility functions
function extractFirstSentence(content: string): string {
  if (!content) return '';

  // Remove HTML tags if any
  const cleanContent = content.replace(/<[^>]*>/g, '');

  // Find the first sentence (ended by . ! or ?)
  const match = cleanContent.match(/^[^.!?]*[.!?]/);
  if (match) {
    return match[0].trim();
  }

  // If no sentence ending found, return first 150 characters
  return (
    cleanContent.substring(0, 150).trim() +
    (cleanContent.length > 150 ? '...' : '')
  );
}

function estimateWordCount(content: string): number {
  if (!content) return 0;

  // Remove HTML tags and count words
  const cleanContent = content.replace(/<[^>]*>/g, ' ');
  const words = cleanContent
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  return words.length;
}

function generateKeywordsFromContent(content: string, title: string): string[] {
  const commonWords = [
    'the',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'is',
    'are',
    'was',
    'were',
    'a',
    'an',
    'as',
    'be',
    'been',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
  ];

  const martialArtsKeywords = [
    'martial arts',
    'karate',
    'mma',
    'boxing',
    'training',
    'academy',
    'sports',
    'fitness',
    'self defense',
  ];

  // Extract words from title and content
  const allText = `${title} ${content}`.toLowerCase();
  const words = allText
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !commonWords.includes(word))
    .slice(0, 10); // Take first 10 meaningful words

  // Combine with martial arts keywords
  return [...new Set([...martialArtsKeywords, ...words])].slice(0, 15);
}

export const getSEOTitle = (
  title: string,
  siteName = 'Ghatak Sports Academy India™'
) => {
  const maxLength = 60;
  const fullTitle = `${title} | ${siteName}`;

  if (fullTitle.length <= maxLength) {
    return fullTitle;
  }

  // Truncate title if too long
  const availableLength = maxLength - siteName.length - 3; // 3 for " | "
  const truncatedTitle =
    title.length > availableLength
      ? title.substring(0, availableLength - 3) + '...'
      : title;

  return `${truncatedTitle} | ${siteName}`;
};

export const getSEODescription = (description: string, maxLength = 160) => {
  if (description.length <= maxLength) {
    return description;
  }

  return description.substring(0, maxLength - 3) + '...';
};
