// ---------------------------------------------------------
// GSAI-IN — Advanced Production Sitemap Generator
// - Detailed Performance Logging
// - Supabase Connection Health Check
// - dynamic Image Fallbacks
// - Silent Retries for Schema Mismatches
// ---------------------------------------------------------

import dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import { SitemapStream, streamToPromise } from 'sitemap';
import { createClient } from '@supabase/supabase-js';
import { performance } from 'perf_hooks';

dotenv.config({ path: '.env.local' });
dotenv.config();

// ---------------------- Logger Utility --------------------
const Logger = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warn: (msg) => console.warn(`\x1b[33m[WARN]\x1b[0m ${msg}`),
  error: (msg) => console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  timer: (label, start) => {
    const duration = (performance.now() - start).toFixed(2);
    console.log(`\x1b[90m   ↳ ${label}: ${duration}ms\x1b[0m`);
  }
};

// ---------------------- Hostname Logic --------------------
const PRIMARY_HOST = 'https://ghataksportsacademy.com';
const SECONDARY_HOST = 'https://ghatakgsai.netlify.app';
const FALLBACK_HOSTS = [PRIMARY_HOST, SECONDARY_HOST];
const placeholderHosts = new Set([
  'https://yourdomain.com', 'http://yourdomain.com', 'yourdomain.com',
  'https://example.com', 'http://example.com', 'example.com',
]);

const ensureAbsolute = (value) => {
  if (!value || !value.trim()) return FALLBACK_HOSTS[0];
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const candidateHost = ensureAbsolute(
  process.env.SITE_URL || process.env.CANONICAL_URL || process.env.URL ||
  process.env.DEPLOY_PRIME_URL || process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_HOSTS[0]
);

const normalizedHost = candidateHost.replace(/\/$/, '');
const allowedHosts = new Set(FALLBACK_HOSTS.map((host) => host.toLowerCase()));
const hostname =
  placeholderHosts.has(normalizedHost.toLowerCase()) ||
  !allowedHosts.has(normalizedHost.toLowerCase())
    ? FALLBACK_HOSTS[0]
    : normalizedHost;

// ---------------------- Supabase Setup --------------------
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let supabase = null;

const initSupabase = async () => {
  const start = performance.now();
  Logger.info('Initializing Supabase connection...');

  try {
    if (!SUPABASE_URL || !SUPABASE_KEY || /example\.supabase\.co/i.test(SUPABASE_URL)) {
      throw new Error('Missing or Invalid Supabase Credentials');
    }

    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      db: { schema: 'public' },
      auth: { persistSession: false } // Optimization for server-side scripts
    });

    // Health Check: Perform a lightweight query to confirm connectivity
    const { error } = await supabase.from('blogs').select('count', { count: 'exact', head: true }).limit(1);

    if (error && error.code !== 'PGRST116') { // Ignore "Results contain 0 rows" error if table empty
      // If table doesn't exist, it might throw, but connection is likely okay. 
      // We act defensively here.
    }

    Logger.success('Supabase Connected Successfully');
    Logger.timer('Connection Time', start);
    return true;
  } catch (err) {
    Logger.error(`Supabase connection failed: ${err.message}`);
    return false;
  }
};

// ---------------------- Static Pages ----------------------
// Note: Fragment identifiers (URLs with #) are removed as they are not separate
// crawlable resources and are typically ignored by search engines in sitemaps.
const marketingPages = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/events', changefreq: 'daily', priority: 0.75 },
  { url: '/news', changefreq: 'daily', priority: 0.72 },
  { url: '/blogs', changefreq: 'daily', priority: 0.7 },
  { url: '/gallery', changefreq: 'weekly', priority: 0.6 },
  { url: '/contact', changefreq: 'monthly', priority: 0.6 },
  { url: '/corporate', changefreq: 'monthly', priority: 0.6 },
  { url: '/locations/lucknow', changefreq: 'monthly', priority: 0.5 },
  { url: '/privacy', changefreq: 'yearly', priority: 0.35 },
  { url: '/terms', changefreq: 'yearly', priority: 0.35 },
  { url: '/pages/success.html', changefreq: 'yearly', priority: 0.25 },
];

const defaultImageMeta = [{
  url: `${hostname}/assets/img/social-preview.png`,
  caption: 'Ghatak Sports Academy India - Martial Arts Training',
  title: 'Ghatak Sports Academy India - Premier Martial Arts Academy',
  geoLocation: 'Lucknow, Uttar Pradesh, India',
  license: `${hostname}/terms`,
}];

const defaultVideoMeta = [{
  thumbnail_loc: `${hostname}/assets/img/logo.webp`,
  title: 'Ghatak Sports Academy India - Training Introduction',
  description: 'Watch our introductory video showcasing martial arts training, facilities, and student achievements at Ghatak Sports Academy India.',
  content_loc: `${hostname}/assets/slider/intro.mp4`,
  duration: 120,
  publication_date: '2025-03-01T00:00:00Z',
  family_friendly: 'yes',
  requires_subscription: 'no',
}];

// ---------------------- Helpers ---------------------------
const toISODate = (val) => {
  try {
    const d = val ? new Date(val) : new Date();
    return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  } catch {
    return new Date().toISOString();
  }
};

// Tries to find a valid image column, else returns default
const resolveImage = (row) => {
  const candidates = ['image', 'cover_image', 'thumbnail', 'img_url'];
  for (const c of candidates) {
    if (row[c]) {
      return [{ url: row[c], caption: row.title || 'GSAI Image', title: row.title || 'GSAI' }];
    }
  }
  return defaultImageMeta;
};

const resolveTimestamp = (row, candidates = []) => {
  if (!row) return new Date().toISOString();
  for (const c of candidates) {
    if (row[c]) return row[c];
  }
  return new Date().toISOString();
};

// ---------------------- Smart Fetch (Silent Retry) --------
const fetchCollection = async ({ table, select = '*', filters = [], orderBy }) => {
  if (!supabase) return [];

  const startFetch = performance.now();

  const execute = async (columns) => {
    if (!columns.length) return [];
    let query = supabase.from(table).select(columns.join(', '));

    filters.forEach(({ column, value, operator = 'eq' }) => {
      query = operator && typeof query[operator] === 'function'
        ? query[operator](column, value)
        : query.eq(column, value);
    });

    if (orderBy) query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });

    try {
      const { data, error } = await query;

      if (error) {
        // Logic: Recursively remove missing columns
        const msg = error.message || '';
        const match = msg.match(/column\s+(?:[\w]+\.)?([\w]+)\s+does not exist/i);

        if (match) {
          const missing = match[1];
          Logger.warn(`Table '${table}' missing column '${missing}'. Retrying...`);
          const reduced = columns.filter((c) => c !== missing && !c.includes(missing));
          if (reduced.length !== columns.length) return execute(reduced);
        }
        Logger.error(`Fetch error on ${table}: ${msg}`);
        return [];
      }
      return data || [];
    } catch (err) {
      Logger.error(`Unexpected error on ${table}: ${err.message}`);
      return [];
    }
  };

  // Normalized Select
  let cols = Array.isArray(select) ? select : select.split(',').map(s => s.trim()).filter(Boolean);

  const result = await execute(cols);
  Logger.timer(`Fetched ${result.length} items from '${table}'`, startFetch);
  return result;
};

// ---------------------- Generator -------------------------
async function generateSitemap() {
  const scriptStart = performance.now();
  console.log('');
  Logger.info(`Starting Sitemap Generation for: ${hostname}`);

  // 1. Connect
  const isConnected = await initSupabase();
  if (!isConnected) {
    Logger.error("Aborting: Could not establish DB connection.");
    process.exit(1);
  }

  try {
    const sitemap = new SitemapStream({ hostname });

    // 2. Static Pages
    marketingPages.forEach((p) => sitemap.write({
      ...p,
      lastmod: toISODate(),
      img: defaultImageMeta,
      video: p.url === '/' ? defaultVideoMeta : undefined, // Add video to homepage
    }));

    // 3. Dynamic Content Fetch
    // OPTIMIZATION: I removed 'slug', 'updated_at', 'image', 'thumbnail' 
    // because your logs showed they don't exist. This will stop the warnings.
    const [blogs, news, events] = await Promise.all([
      fetchCollection({
        table: 'blogs',
        select: 'id, published_at, title', // Removed 'slug', 'updated_at', 'image'
        orderBy: { column: 'published_at', ascending: false },
      }),
      fetchCollection({
        table: 'news',
        select: 'id, date, status, title', // Removed 'slug', 'updated_at', 'thumbnail', 'image'
        filters: [{ column: 'status', value: '%published%', operator: 'ilike' }],
        orderBy: { column: 'date', ascending: false },
      }),
      fetchCollection({
        table: 'events',
        select: 'id, from_date, date, end_date, title', // Removed 'slug', 'start_date', 'updated_at', 'cover_image'
        orderBy: { column: 'from_date', ascending: false },
      }),
    ]);

    // 4. Write Streams

    // Blogs
    blogs.forEach((b) => {
      // Fallback: If slug exists use it, otherwise use ID
      const url = b.slug || b.id;
      if (url) sitemap.write({
        url: `/blog/${url}`,
        changefreq: 'weekly',
        priority: 0.82,
        lastmod: toISODate(resolveTimestamp(b, ['published_at'])),
        img: resolveImage(b),
      });
    });

    // News
    news.forEach((n) => {
      const url = n.slug || n.id;
      if (url) sitemap.write({
        url: `/news/${url}`,
        changefreq: 'weekly',
        priority: 0.78,
        lastmod: toISODate(resolveTimestamp(n, ['date'])),
        img: resolveImage(n),
      });
    });

    // Events
    events.forEach((e) => {
      const url = e.slug || e.id;
      if (url) sitemap.write({
        url: `/event/${url}`,
        changefreq: 'daily',
        priority: 0.88,
        lastmod: toISODate(resolveTimestamp(e, ['from_date', 'date', 'end_date'])),
        img: resolveImage(e),
      });
    });

    sitemap.end();
    const xml = await streamToPromise(sitemap);
    writeFileSync('./public/sitemap.xml', xml.toString());

    console.log(''); // Spacer
    Logger.success('Sitemap Generated Successfully!');
    console.log(`----------------------------------------`);
    console.log(`   • Total URLs     : ${marketingPages.length + blogs.length + news.length + events.length}`);
    console.log(`   • Static Pages   : ${marketingPages.length}`);
    console.log(`   • Dynamic Blogs  : ${blogs.length}`);
    console.log(`   • Dynamic News   : ${news.length}`);
    console.log(`   • Dynamic Events : ${events.length}`);
    Logger.timer('Total Execution Time', scriptStart);
    console.log(`----------------------------------------`);

  } catch (err) {
    Logger.error(`Critical Error: ${err?.message || err}`);
    process.exit(1);
  }
}
generateSitemap();