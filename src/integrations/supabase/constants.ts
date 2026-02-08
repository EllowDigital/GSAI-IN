// Supabase project constants are sourced from Vite env variables.
export const SUPABASE_PROJECT_ID =
  import.meta.env.VITE_SUPABASE_PROJECT_ID || 'jddeuhrocglnisujixdt';
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://jddeuhrocglnisujixdt.supabase.co';
// Public anon key (safe to embed in client apps)
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZGV1aHJvY2dsbmlzdWppeGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MzYyNjYsImV4cCI6MjA2NTUxMjI2Nn0.cPsO_rAxqhGEUEotfIFfbbxlujKdtgZ3MrFctOOcoE4';

export const ADMIN_SESSION_STORAGE_KEY = 'gsai-admin-session';
export const POST_LOGIN_REDIRECT_KEY = 'gsai-admin-post-login-route';

// Validation function (called explicitly from main.tsx)
export const validateSupabaseConfig = (): void => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const errorMsg = [
      '🚨 CRITICAL: Missing Supabase environment variables!',
      `SUPABASE_URL: ${SUPABASE_URL ? '✓ Set' : '✗ Missing'}`,
      `SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}`,
      '',
      'For local development: Check your .env.local file',
      'For Netlify deployment: Set these in Netlify Dashboard:',
      '  → Site settings > Environment variables',
      '  → Add: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_PROJECT_ID',
      '',
    ].join('\n');

    console.error(errorMsg);

    // Show user-friendly error in the UI
    if (typeof document !== 'undefined' && document.body) {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText =
        'position:fixed;top:0;left:0;right:0;background:#dc2626;color:white;padding:20px;z-index:99999;font-family:system-ui;';

      const title = document.createElement('h2');
      title.style.cssText = 'margin:0 0 10px 0;';
      title.textContent = '⚠️ Configuration Error';

      const message1 = document.createElement('p');
      message1.style.margin = '0';
      message1.textContent =
        'The application is missing required Supabase configuration.';

      const message2 = document.createElement('p');
      message2.style.cssText = 'margin:10px 0 0 0;font-size:14px;';
      message2.textContent = 'Please contact the site administrator.';

      errorDiv.appendChild(title);
      errorDiv.appendChild(message1);
      errorDiv.appendChild(message2);
      document.body.appendChild(errorDiv);
    }

    // Fail fast in production
    if (import.meta.env.PROD) {
      throw new Error('Missing required Supabase configuration');
    }
  }
};
