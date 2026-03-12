import {
  ADMIN_SESSION_STORAGE_KEY,
  ADMIN_VERIFIED_USER_STORAGE_KEY,
  SUPABASE_PROJECT_ID,
} from './constants';

const getStorage = (storageType: 'localStorage' | 'sessionStorage') => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const storage = window[storageType];
    const testKey = `__${storageType}_test__`;
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return storage;
  } catch {
    return undefined;
  }
};

export const getSupabaseAuthStorage = () => getStorage('localStorage');

export const clearPersistedSupabaseSession = () => {
  if (typeof window === 'undefined') return;

  const storages = [window.localStorage, window.sessionStorage];
  const prefix = SUPABASE_PROJECT_ID ? `sb-${SUPABASE_PROJECT_ID}` : 'sb-';

  storages.forEach((storage) => {
    try {
      storage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      storage.removeItem(ADMIN_VERIFIED_USER_STORAGE_KEY);

      Object.keys(storage).forEach((key) => {
        if (key.startsWith(prefix) || key.includes('supabase.auth')) {
          storage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Unable to clear persisted Supabase session cache', error);
    }
  });
};

export const rememberVerifiedAdminUser = (userId: string | null) => {
  const storage = getSupabaseAuthStorage();

  if (!storage) return;

  if (!userId) {
    storage.removeItem(ADMIN_VERIFIED_USER_STORAGE_KEY);
    return;
  }

  storage.setItem(ADMIN_VERIFIED_USER_STORAGE_KEY, userId);
};

export const getRememberedAdminUser = () => {
  const storage = getSupabaseAuthStorage();
  return storage?.getItem(ADMIN_VERIFIED_USER_STORAGE_KEY) ?? null;
};
