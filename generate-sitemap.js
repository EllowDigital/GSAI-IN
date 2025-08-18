// Advanced Dynamic Sitemap Generator
import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import { createClient } from '@supabase/supabase-js';

const hostname = 'https://ghatakgsai.netlify.app';

// Supabase configuration
const supabaseUrl = 'https://jddeuhrocglnisujixdt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZGV1aHJvY2dsbmlzdWppeGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MzYyNjYsImV4cCI6MjA2NTUxMjI2Nn0.cPsO_rAxqhGEUEotfIFfbbxlujKdtgZ3MrFctOOcoE4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Static pages configuration
const staticPages = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/privacy', changefreq: 'monthly', priority: 0.3 },
  { url: '/terms', changefreq: 'monthly', priority: 0.3 },
  { url: '/pages/success.html', changefreq: 'yearly', priority: 0.2 },
];

async function generateAdvancedSitemap() {
  try {
    const sitemap = new SitemapStream({ hostname });

    // Add static pages
    staticPages.forEach(page => {
      sitemap.write({
        ...page,
        lastmod: new Date().toISOString().split('T')[0],
      });
    });

    // Fetch and add dynamic blog posts
    const { data: blogs } = await supabase
      .from('blogs')
      .select('id, published_at')
      .order('published_at', { ascending: false });

    if (blogs) {
      blogs.forEach(blog => {
        sitemap.write({
          url: `/blog/${blog.id}`,
          changefreq: 'monthly',
          priority: 0.8,
          lastmod: blog.published_at || new Date().toISOString().split('T')[0],
        });
      });
    }

    // Fetch and add dynamic news articles
    const { data: news } = await supabase
      .from('news')
      .select('id, date')
      .eq('status', 'Published')
      .order('date', { ascending: false });

    if (news) {
      news.forEach(article => {
        sitemap.write({
          url: `/news/${article.id}`,
          changefreq: 'monthly',
          priority: 0.7,
          lastmod: article.date || new Date().toISOString().split('T')[0],
        });
      });
    }

    // Fetch and add dynamic events
    const { data: events } = await supabase
      .from('events')
      .select('id, from_date')
      .order('from_date', { ascending: false });

    if (events) {
      events.forEach(event => {
        sitemap.write({
          url: `/event/${event.id}`,
          changefreq: 'weekly',
          priority: 0.9,
          lastmod: event.from_date || new Date().toISOString().split('T')[0],
        });
      });
    }

    sitemap.end();

    const sitemapXml = await streamToPromise(sitemap);
    createWriteStream('./public/sitemap.xml').write(sitemapXml);

    console.log('✅ Advanced sitemap generated successfully!');
    console.log(`📊 Generated sitemap with:`);
    console.log(`   • ${staticPages.length} static pages`);
    console.log(`   • ${blogs?.length || 0} blog posts`);
    console.log(`   • ${news?.length || 0} news articles`);
    console.log(`   • ${events?.length || 0} events`);
  } catch (error) {
    console.error('❌ Error generating advanced sitemap:', error);
    process.exit(1);
  }
}

generateAdvancedSitemap();
