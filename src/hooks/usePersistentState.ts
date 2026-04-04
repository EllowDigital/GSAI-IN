import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export function usePersistentState<T extends string>(
  key: string,
  defaultValue: T,
  allowedValues: readonly T[]
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;

    try {
      const stored = window.localStorage.getItem(key);
      if (stored && allowedValues.includes(stored as T)) {
        return stored as T;
      }
    } catch {
      // Ignore storage access issues and fallback to default.
    }

    return defaultValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore storage write issues and keep app functional.
    }
  }, [key, value]);

  return [value, setValue];
}
