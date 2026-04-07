const rawVersion = (import.meta.env.VITE_APP_VERSION || '').trim();

export const APP_VERSION = rawVersion || 'dev';
export const APP_VERSION_LABEL = `v${APP_VERSION}`;
