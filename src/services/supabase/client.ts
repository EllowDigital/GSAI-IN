/**
 * ⚠️ This file is auto-generated and should not be edited directly.
 *
 * Supabase client initialization.
 * Use this client to interact with your Supabase backend throughout the app.
 *
 * Usage:
 *   import { supabase } from '@/services/supabase/client';
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import {
  ADMIN_SESSION_STORAGE_KEY,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from './constants';
import { getSupabaseAuthStorage } from './session';

const authStorageAdapter = getSupabaseAuthStorage();

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
      detectSessionInUrl: true,
      storage: authStorageAdapter,
      storageKey: ADMIN_SESSION_STORAGE_KEY,
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
