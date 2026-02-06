// Supabase project constants are sourced from Vite env variables.
export const SUPABASE_PROJECT_ID =
  import.meta.env.VITE_SUPABASE_PROJECT_ID || '';
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
// Public anon key (safe to embed in client apps)
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const ADMIN_SESSION_STORAGE_KEY = 'gsai-admin-session';
export const POST_LOGIN_REDIRECT_KEY = 'gsai-admin-post-login-route';
