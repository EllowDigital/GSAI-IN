import {
  ADMIN_SESSION_STORAGE_KEY,
  ADMIN_VERIFIED_USER_STORAGE_KEY,
  STUDENT_SESSION_STORAGE_KEY,
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

type SupabaseSessionScope = 'admin' | 'student' | 'all';

export const clearPersistedSupabaseSession = (
  scope: SupabaseSessionScope = 'all'
) => {
  if (typeof window === 'undefined') return;

  const storages = [window.localStorage, window.sessionStorage];
  const prefix = SUPABASE_PROJECT_ID ? `sb-${SUPABASE_PROJECT_ID}` : 'sb-';
  const removableKeys = new Set<string>();
  const removableLockKeys = new Set<string>();

  if (scope === 'all' || scope === 'admin') {
    removableKeys.add(ADMIN_SESSION_STORAGE_KEY);
    removableKeys.add(ADMIN_VERIFIED_USER_STORAGE_KEY);
    removableLockKeys.add(`lock:${ADMIN_SESSION_STORAGE_KEY}`);
  }

  if (scope === 'all' || scope === 'student') {
    removableKeys.add(STUDENT_SESSION_STORAGE_KEY);
    removableLockKeys.add(`lock:${STUDENT_SESSION_STORAGE_KEY}`);
  }

  storages.forEach((storage) => {
    try {
      removableKeys.forEach((key) => storage.removeItem(key));
      removableLockKeys.forEach((key) => storage.removeItem(key));

      Object.keys(storage).forEach((key) => {
        if (
          (scope === 'all' && key.startsWith(prefix)) ||
          (scope === 'all' && key.includes('supabase.auth')) ||
          removableKeys.has(key) ||
          removableLockKeys.has(key)
        ) {
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
