import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Required Vite env vars. Missing values will surface as a non-blocking
 * banner instead of crashing the app.
 */
const REQUIRED_ENV_VARS: Array<{ key: string; label: string }> = [
  { key: 'VITE_SUPABASE_URL', label: 'Supabase URL' },
  { key: 'VITE_SUPABASE_PUBLISHABLE_KEY', label: 'Supabase publishable key' },
  { key: 'VITE_ACADEMY_CONTACT_EMAIL', label: 'Academy contact email' },
  { key: 'VITE_ADMIN_CC_EMAIL', label: 'Admin CC email' },
];

export function getMissingEnvVars(): Array<{ key: string; label: string }> {
  const env = (import.meta.env ?? {}) as Record<string, string | undefined>;
  return REQUIRED_ENV_VARS.filter(({ key }) => {
    const value = env[key];
    return !value || !String(value).trim();
  });
}

export default function EnvCheckBanner() {
  const missing = React.useMemo(() => getMissingEnvVars(), []);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    if (missing.length > 0) {
      console.warn(
        '[env-check] Missing environment variables:',
        missing.map((m) => m.key).join(', ')
      );
    }
  }, [missing]);

  if (dismissed || missing.length === 0) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 right-4 z-[60] max-w-sm rounded-xl border border-yellow-500/40 bg-black/90 backdrop-blur-md shadow-2xl text-white p-4"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
        <div className="flex-1 text-sm">
          <p className="font-semibold mb-1">Configuration warning</p>
          <p className="text-white/70 mb-2">
            The app is using fallback values for these settings:
          </p>
          <ul className="list-disc list-inside text-white/80 space-y-0.5">
            {missing.map((m) => (
              <li key={m.key}>
                {m.label} <span className="text-white/40">({m.key})</span>
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/60 hover:text-white"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
