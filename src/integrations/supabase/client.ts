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
import { ADMIN_SESSION_STORAGE_KEY } from './constants';

type SupabaseEnvKey = 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_PUBLISHABLE_KEY';

const resolveEnv = (key: SupabaseEnvKey): string | undefined => {
  const fromImportMeta =
    typeof import.meta !== 'undefined'
      ? (import.meta.env as Record<string, string | undefined>)[key]
      : undefined;
  const fromProcess =
    typeof process !== 'undefined' && process?.env
      ? process.env[key]
      : undefined;

  return fromImportMeta ?? fromProcess ?? undefined;
};

const requireSupabaseEnv = (key: SupabaseEnvKey): string => {
  const value = resolveEnv(key);
  if (!value) {
    throw new Error(
      `Missing Supabase environment variable: ${key}. ` +
        'Define it in your .env/.env.local (never commit real keys) or the hosting provider dashboard.'
    );
  }
  return value;
};

const SUPABASE_URL = requireSupabaseEnv('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = requireSupabaseEnv('VITE_SUPABASE_PUBLISHABLE_KEY');

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
