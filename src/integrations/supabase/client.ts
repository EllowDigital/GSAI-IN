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
const SUPABASE_URL: string = 'https://REDACTED';
const SUPABASE_ANON_KEY: string =
  'REDACTED';

/**
 * Supabase client instance
 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
