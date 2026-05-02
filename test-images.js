import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('id, image_url, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching images:', error);
      return;
    }

    console.log('--- Image URL Analysis ---');
    for (const img of data || []) {
      console.log(`ID: ${img.id} | URL: ${img.image_url}`);
    }
  } catch (err) {
    console.error('Runtime error:', err);
  }
}

run();
