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
import {
  ADMIN_SESSION_STORAGE_KEY,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from './constants';
/**
 * Use sessionStorage so ctrl/cmd+R keeps the session, while a full app close clears it.
 * Falls back to in-memory storage when the DOM is unavailable (e.g. during SSR).
 */
const resolveSessionStorage = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const testKey = '__supabase_session_test__';
    window.sessionStorage.setItem(testKey, '1');
    window.sessionStorage.removeItem(testKey);
    return window.sessionStorage;
  } catch (_error) {
    return undefined;
  }
};

const sessionStorageAdapter = resolveSessionStorage();

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
      storage: sessionStorageAdapter,
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
