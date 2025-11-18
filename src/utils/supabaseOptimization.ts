/**
 * Supabase optimization utilities for better performance and connection management
 */

import { supabase } from '@/integrations/supabase/client';
import { performanceMonitor } from './performance';

// Connection pool management
class ConnectionPoolManager {
  private static instance: ConnectionPoolManager;
  private activeConnections = new Set<string>();
  private connectionQueue: Array<() => void> = [];
  private readonly maxConnections = 10;

  static getInstance(): ConnectionPoolManager {
    if (!ConnectionPoolManager.instance) {
      ConnectionPoolManager.instance = new ConnectionPoolManager();
    }
    return ConnectionPoolManager.instance;
  }

  async acquireConnection(operationId: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.activeConnections.size < this.maxConnections) {
        this.activeConnections.add(operationId);
        resolve();
      } else {
        this.connectionQueue.push(() => {
          this.activeConnections.add(operationId);
          resolve();
        });
      }
    });
  }

  releaseConnection(operationId: string): void {
    this.activeConnections.delete(operationId);
    if (this.connectionQueue.length > 0) {
      const nextOperation = this.connectionQueue.shift();
      nextOperation?.();
    }
  }
}

const connectionPool = ConnectionPoolManager.getInstance();

/**
 * Enhanced query wrapper with connection pooling and performance monitoring
 */
export async function optimizedQuery<T = any>(
  queryName: string,
  queryFn: () => Promise<T>,
  options: {
    cacheKey?: string;
    cacheDuration?: number;
    retries?: number;
  } = {}
): Promise<T> {
  const { cacheKey, cacheDuration = 300000, retries = 2 } = options; // 5 min cache
  const operationId = `${queryName}-${Date.now()}`;

  // Check cache first
  if (cacheKey && typeof window !== 'undefined') {
    const cached = localStorage.getItem(`supabase_cache_${cacheKey}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < cacheDuration) {
        return data;
      }
    }
  }

  // Acquire connection
  await connectionPool.acquireConnection(operationId);

  try {
    const result = await performanceMonitor.measureAsyncOperation(
      queryName,
      async () => {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= retries; attempt++) {
          try {
            return await queryFn();
          } catch (error) {
            lastError = error as Error;
            if (attempt < retries) {
              // Exponential backoff
              await new Promise((resolve) =>
                setTimeout(resolve, Math.pow(2, attempt) * 1000)
              );
            }
          }
        }

        throw lastError;
      }
    );

    // Cache successful result
    if (cacheKey && typeof window !== 'undefined') {
      localStorage.setItem(
        `supabase_cache_${cacheKey}`,
        JSON.stringify({
          data: result,
          timestamp: Date.now(),
        })
      );
    }

    return result;
  } finally {
    connectionPool.releaseConnection(operationId);
  }
}

/**
 * Optimized batch operations
 */
export async function batchQuery<T>(
  queries: Array<() => Promise<T>>,
  batchSize: number = 5
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < queries.length; i += batchSize) {
    const batch = queries.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((query) =>
        query().catch((error) => {
          console.warn('Batch query failed:', error);
          return null;
        })
      )
    );
    results.push(...(batchResults.filter(Boolean) as T[]));
  }

  return results;
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  if (typeof window === 'undefined') return;

  const keys = Object.keys(localStorage);
  const cacheKeys = keys.filter((key) => key.startsWith('supabase_cache_'));

  cacheKeys.forEach((key) => {
    try {
      const { timestamp } = JSON.parse(localStorage.getItem(key) || '{}');
      if (Date.now() - timestamp > 300000) {
        // 5 minutes
        localStorage.removeItem(key);
      }
    } catch {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Initialize optimization features
 */
export function initializeSupabaseOptimization(): void {
  // Clear expired cache on page load
  clearExpiredCache();

  // Set up periodic cache cleanup
  if (typeof window !== 'undefined') {
    setInterval(clearExpiredCache, 300000); // Every 5 minutes
  }

  // Monitor connection health
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      // Clear cache on sign out
      const keys = Object.keys(localStorage);
      keys
        .filter((key) => key.startsWith('supabase_cache_'))
        .forEach((key) => {
          localStorage.removeItem(key);
        });
    }
  });
}

/**
 * Optimized real-time subscription management
 */
export class RealtimeManager {
  private static instance: RealtimeManager;
  private subscriptions = new Map<string, any>();

  static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  subscribe(key: string, channel: any): void {
    // Unsubscribe existing if present
    if (this.subscriptions.has(key)) {
      this.unsubscribe(key);
    }

    this.subscriptions.set(key, channel);
  }

  unsubscribe(key: string): void {
    const channel = this.subscriptions.get(key);
    if (channel) {
      supabase.removeChannel(channel);
      this.subscriptions.delete(key);
    }
  }

  unsubscribeAll(): void {
    this.subscriptions.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.subscriptions.clear();
  }
}

export const realtimeManager = RealtimeManager.getInstance();
