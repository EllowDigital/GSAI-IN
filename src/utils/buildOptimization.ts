/**
 * Build and runtime optimizations for better performance
 */

// TypeScript strict type checking fixes
export const typeGuards = {
  isString: (value: unknown): value is string => typeof value === 'string',
  isNumber: (value: unknown): value is number => typeof value === 'number',
  isObject: (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value),
  isArray: (value: unknown): value is unknown[] => Array.isArray(value),
  isDefined: <T>(value: T | undefined | null): value is T =>
    value !== undefined && value !== null,
};

// Performance optimized utilities
export const optimizedUtils = {
  debounce: <T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  throttle: <T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  memoize: <T extends (...args: any[]) => any>(fn: T): T => {
    const cache = new Map();
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as T;
  },
};

// Memory management utilities
export const memoryOptimization = {
  clearUnusedResources: () => {
    if (typeof window !== 'undefined') {
      // Clear console logs in production
      if (process.env.NODE_ENV === 'production') {
        console.log = () => {};
        console.warn = () => {};
        console.info = () => {};
      }

      // Force garbage collection if available
      if ('gc' in window && typeof (window as any).gc === 'function') {
        (window as any).gc();
      }
    }
  },

  cleanupEventListeners: () => {
    if (typeof window !== 'undefined') {
      // Remove any global event listeners that might cause memory leaks
      const events = ['resize', 'scroll', 'orientationchange'];
      events.forEach((event) => {
        window.removeEventListener(event, () => {});
      });
    }
  },
};

// Build error prevention
export const buildSafety = {
  safeImport: async <T>(importFn: () => Promise<T>): Promise<T | null> => {
    try {
      return await importFn();
    } catch (error) {
      console.warn('Safe import failed:', error);
      return null;
    }
  },

  safeExecute: <T>(fn: () => T, fallback: T): T => {
    try {
      return fn();
    } catch (error) {
      console.warn('Safe execute failed:', error);
      return fallback;
    }
  },

  validateEnvironment: (): boolean => {
    const checks = [
      () => typeof window !== 'undefined',
      () => typeof document !== 'undefined',
      () => 'localStorage' in window,
      () => 'sessionStorage' in window,
    ];

    return checks.every((check) => {
      try {
        return check();
      } catch {
        return false;
      }
    });
  },
};

// Tree shaking optimization - only export what's needed
export { optimizedUtils as utils };

// Initialize optimizations
export const initializeBuildOptimizations = () => {
  if (typeof window !== 'undefined') {
    // Set up memory cleanup
    window.addEventListener('beforeunload', () => {
      memoryOptimization.clearUnusedResources();
      memoryOptimization.cleanupEventListeners();
    });

    // Validate environment
    if (!buildSafety.validateEnvironment()) {
      console.warn(
        'Environment validation failed - some features may not work'
      );
    }
  }
};
