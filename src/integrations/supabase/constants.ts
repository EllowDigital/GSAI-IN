// Supabase project constants are sourced from Vite env variables.
export const SUPABASE_PROJECT_ID =
  import.meta.env.VITE_SUPABASE_PROJECT_ID || '';
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
// Public anon key (safe to embed in client apps)
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const ADMIN_SESSION_STORAGE_KEY = 'gsai-admin-session';
export const POST_LOGIN_REDIRECT_KEY = 'gsai-admin-post-login-route';

// Validate required environment variables
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
  if (typeof document !== 'undefined') {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText =
      'position:fixed;top:0;left:0;right:0;background:#dc2626;color:white;padding:20px;z-index:99999;font-family:system-ui;';
    errorDiv.innerHTML = `
      <h2 style="margin:0 0 10px 0;">⚠️ Configuration Error</h2>
      <p style="margin:0;">The application is missing required Supabase configuration.</p>
      <p style="margin:10px 0 0 0;font-size:14px;">Please contact the site administrator.</p>
    `;
    document.body?.appendChild(errorDiv);
  }
}
