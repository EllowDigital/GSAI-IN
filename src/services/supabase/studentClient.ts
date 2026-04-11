import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import {
  STUDENT_SESSION_STORAGE_KEY,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from './constants';
import { getSupabaseAuthStorage } from './session';

const authStorageAdapter = getSupabaseAuthStorage();

export const studentSupabase = createClient<Database>(
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
      storageKey: STUDENT_SESSION_STORAGE_KEY,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web-student',
      },
    },
  }
);
