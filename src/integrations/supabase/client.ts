/**
 * ⚠️ This file is auto-generated and should not be edited directly.
 *
 * Supabase client initialization.
 * Use this client to interact with your Supabase backend throughout the app.
 *
 * Usage:
 *   import { supabase } from '@/integrations/supabase/client';
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Supabase configuration
 * These should ideally come from environment variables.
 */
const SUPABASE_URL: string = 'https://jddeuhrocglnisujixdt.supabase.co';
const SUPABASE_ANON_KEY: string =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZGV1aHJvY2dsbmlzdWppeGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MzYyNjYsImV4cCI6MjA2NTUxMjI2Nn0.cPsO_rAxqhGEUEotfIFfbbxlujKdtgZ3MrFctOOcoE4';

/**
 * Optimized Supabase client instance with performance enhancements
 */
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    db: {
      schema: 'public',
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web',
      },
    },
  }
);
