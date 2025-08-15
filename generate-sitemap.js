// generate-sitemap.js
import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';

const hostname = 'https://ghatakgsai.netlify.app'; // Your site URL

// List of site pages
const pages = [
  { url: '/', changefreq: 'monthly', priority: 1.0 },
  { url: '/pages/privacy.html', changefreq: 'yearly', priority: 0.5 },
  { url: '/pages/terms.html', changefreq: 'yearly', priority: 0.5 },
  { url: '/pages/', changefreq: 'yearly', priority: 0.5 },
  { url: '/pages/success.html', changefreq: 'yearly', priority: 0.5 },
];

const sitemap = new SitemapStream({ hostname });

// Add pages with today's date as lastmod
pages.forEach(page => {
  sitemap.write({
    ...page,
    lastmod: new Date().toISOString().split('T')[0], // YYYY-MM-DD
  });
});

sitemap.end();

streamToPromise(sitemap)
  .then(sm => createWriteStream('./public/sitemap.xml').write(sm))
  .then(() => console.log('✅ Sitemap generated successfully!'))
  .catch(err => console.error('❌ Error generating sitemap:', err));
