// Advanced Dynamic Sitemap Generator
import 'dotenv/config';
import { SitemapStream, streamToPromise } from 'sitemap';
import { writeFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const hostname =
  process.env.SITE_URL ||
  process.env.URL ||
  process.env.DEPLOY_PRIME_URL ||
  'https://ghatakgsai.netlify.app';

// Supabase configuration (falls back to historic defaults for convenience)
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://jddeuhrocglnisujixdt.supabase.co';
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZGV1aHJvY2dsbmlzdWppeGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MzYyNjYsImV4cCI6MjA2NTUxMjI2Nn0.cPsO_rAxqhGEUEotfIFfbbxlujKdtgZ3MrFctOOcoE4';

const hasSupabaseCredentials = Boolean(supabaseUrl && supabaseAnonKey);
const supabase = hasSupabaseCredentials ? createClient(supabaseUrl, supabaseAnonKey) : null;
if (!hasSupabaseCredentials) {
  console.warn('⚠️ Supabase credentials were not found – the sitemap will include only static routes.');
}

// Static pages configuration
const marketingPages = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/events', changefreq: 'daily', priority: 0.75 },
  { url: '/news', changefreq: 'daily', priority: 0.72 },
  { url: '/blogs', changefreq: 'daily', priority: 0.7 },
  { url: '/gallery', changefreq: 'weekly', priority: 0.6 },
  { url: '/privacy', changefreq: 'monthly', priority: 0.3 },
  { url: '/terms', changefreq: 'monthly', priority: 0.3 },
  { url: '/pages/success.html', changefreq: 'yearly', priority: 0.2 },
];

const defaultImageMeta = [
  {
    url: `${hostname}/assets/img/social-preview.png`,
    caption: 'Ghatak Sports Academy India hero image',
    title: 'Ghatak Sports Academy India',
  },
];

const formatDate = (dateValue) => {
  if (!dateValue) {
    return new Date().toISOString().split('T')[0];
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().split('T')[0];
  }

  return parsed.toISOString().split('T')[0];
};

const writeStaticUrls = (sitemap) => {
  marketingPages.forEach((page) => {
    sitemap.write({
      ...page,
      lastmod: formatDate(),
      img: defaultImageMeta,
    });
  });
};

const normalizeSelectColumns = (select) => {
  if (!select) {
    return ['*'];
  }
  if (Array.isArray(select)) {
    return select;
  }

  return select
    .split(',')
    .map((col) => col.trim())
    .filter(Boolean);
};

const fetchCollection = async ({ table, select, filters = [], orderBy }) => {
  if (!supabase) {
    console.warn(`⚠️ Skipping dynamic ${table} entries because Supabase is not configured.`);
    return [];
  }

  const selectColumns = normalizeSelectColumns(select);

  const executeQuery = async (columns) => {
    if (!columns.length) {
      return [];
    }

    const selectClause = columns.join(', ');
    let query = supabase.from(table).select(selectClause === '*' ? '*' : selectClause);

    filters.forEach(({ column, value, operator = 'eq' }) => {
      query = query[operator](column, value);
    });

    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
    }

    const { data, error } = await query;
    if (error) {
      const missingColumnMatch = error.message.match(/column\s+(?:[\w]+\.)?([\w]+)\s+does not exist/i);
      if (missingColumnMatch) {
        const missingColumn = missingColumnMatch[1];
        const filteredColumns = columns.filter((col) => col !== missingColumn);

        if (filteredColumns.length !== columns.length) {
          console.info(
            `ℹ️ Column "${missingColumn}" missing on ${table}; retrying sitemap query without it.`
          );
          return executeQuery(filteredColumns);
        }
      }

      console.warn(`⚠️ Unable to fetch ${table} for sitemap:`, error.message);
      return [];
    }

    return data ?? [];
  };

  return executeQuery(selectColumns);
};

async function generateAdvancedSitemap() {
  try {
    const sitemap = new SitemapStream({ hostname });
    writeStaticUrls(sitemap);

    const [blogs, news, events] = await Promise.all([
      fetchCollection({
        table: 'blogs',
        select: 'id, published_at, updated_at',
        orderBy: { column: 'published_at', ascending: false },
      }),
      fetchCollection({
        table: 'news',
        select: 'id, date, updated_at, status',
        filters: [{ column: 'status', value: 'Published' }],
        orderBy: { column: 'date', ascending: false },
      }),
      fetchCollection({
        table: 'events',
        select: 'id, from_date, updated_at',
        orderBy: { column: 'from_date', ascending: false },
      }),
    ]);

    blogs.forEach((blog) => {
      sitemap.write({
        url: `/blog/${blog.id}`,
        changefreq: 'weekly',
        priority: 0.82,
        lastmod: formatDate(blog.updated_at || blog.published_at),
        img: defaultImageMeta,
      });
    });

    news.forEach((article) => {
      sitemap.write({
        url: `/news/${article.id}`,
        changefreq: 'weekly',
        priority: 0.78,
        lastmod: formatDate(article.updated_at || article.date),
        img: defaultImageMeta,
      });
    });

    events.forEach((event) => {
      sitemap.write({
        url: `/event/${event.id}`,
        changefreq: 'daily',
        priority: 0.88,
        lastmod: formatDate(event.updated_at || event.from_date),
        img: defaultImageMeta,
      });
    });

    sitemap.end();

    const sitemapXml = await streamToPromise(sitemap);
    writeFileSync('./public/sitemap.xml', sitemapXml.toString());

    console.log('✅ Advanced sitemap generated successfully!');
    console.log(`📊 Generated sitemap with:`);
    console.log(`   • ${marketingPages.length} marketing pages`);
    console.log(`   • ${blogs.length} blog posts`);
    console.log(`   • ${news.length} news articles`);
    console.log(`   • ${events.length} events`);
  } catch (error) {
    console.error('❌ Error generating advanced sitemap:', error);
    process.exit(1);
  }
}

generateAdvancedSitemap();
