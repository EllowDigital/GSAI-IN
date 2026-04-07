const rawVersion = (import.meta.env.VITE_APP_VERSION || '').trim();
const normalizedVersion = rawVersion.replace(/^v/i, '').trim();

export const APP_VERSION = normalizedVersion || 'dev';
export const APP_VERSION_LABEL = `v${APP_VERSION}`;
