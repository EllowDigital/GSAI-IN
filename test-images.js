import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const OBJECT_PUBLIC_PREFIX = '/storage/v1/object/public/';
const RENDER_PUBLIC_PREFIX = '/storage/v1/render/image/public/';

function toTransformEndpoint(url) {
  if (url.pathname.startsWith(RENDER_PUBLIC_PREFIX)) return new URL(url.toString());
  if (url.pathname.startsWith(OBJECT_PUBLIC_PREFIX)) {
    const transformed = new URL(url.toString());
    transformed.pathname = transformed.pathname.replace(OBJECT_PUBLIC_PREFIX, RENDER_PUBLIC_PREFIX);
    return transformed;
  }
  return new URL(url.toString());
}

async function run() {
  try {
    const { data: images, error } = await supabase
      .from('gallery_images')
      .select('id, image_url, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching images:', error);
      return;
    }

    console.log('--- Image URL Analysis ---');
    for (const img of images) {
      let type = 'unknown';
      if (img.image_url.startsWith('http')) type = 'absolute';
      else if (img.image_url.startsWith('/storage')) type = 'storage path';
      else type = 'plain bucket path';
      
      console.log(\ID: \ | Type: \ | URL: \...\);
    }

    console.log('\n--- HTTP Status Tests (First 2) ---');
    for (let i = 0; i < Math.min(2, images.length); i++) {
        const rawUrlStr = images[i].image_url;
        let fullRawUrl = rawUrlStr;
        if (!rawUrlStr.startsWith('http')) {
            const cleanPath = rawUrlStr.startsWith('/storage/v1/object/public/') 
                ? rawUrlStr.replace('/storage/v1/object/public/', '')
                : rawUrlStr.startsWith('/') ? rawUrlStr.slice(1) : rawUrlStr;
            fullRawUrl = \\/storage/v1/object/public/\\;
        }

        const urlObj = new URL(fullRawUrl);
        const transformedUrl = toTransformEndpoint(urlObj);
        transformedUrl.searchParams.set('width', '100');

        const rawRes = await fetch(fullRawUrl, { method: 'HEAD' });
        const transRes = await fetch(transformedUrl.toString(), { method: 'HEAD' });
        console.log(\Image \ (ID: \):\);
        console.log(\  Raw Status: \\);
        console.log(\  Transformed Status: \\);
    }
  } catch (err) {
    console.error('Runtime error:', err);
  }
}

run();
