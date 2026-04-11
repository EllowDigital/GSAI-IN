import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { optimizedQuery } from '@/utils/supabaseOptimization';
import { IS_SUPABASE_CONFIGURED } from '@/services/supabase/constants';

/**
 * Enhanced hook that wraps useQuery with Supabase optimizations
 */
export function useOptimizedQuery<TData = any, TError = Error>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> & {
    cacheKey?: string;
    cacheDuration?: number;
    retries?: number;
  }
): UseQueryResult<TData, TError> {
  const {
    cacheKey,
    cacheDuration,
    retries,
    enabled: userEnabled,
    ...queryOptions
  } = options || {};
  const shouldEnableSupabaseQuery =
    (userEnabled ?? true) && IS_SUPABASE_CONFIGURED;

  return useQuery({
    queryKey,
    queryFn: () =>
      optimizedQuery(queryKey.join('-'), queryFn, {
        cacheKey,
        cacheDuration,
        retries,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    ...queryOptions,
    enabled: shouldEnableSupabaseQuery,
  });
}

/**
 * Hook for optimized real-time queries
 */
export function useOptimizedRealtimeQuery<TData = any, TError = Error>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  realtimeConfig: {
    table: string;
    event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
    schema?: string;
  },
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData, TError> {
  const query = useOptimizedQuery(queryKey, queryFn, options);

  // Real-time subscription is handled in individual hooks
  // This is just the optimized query wrapper

  return query;
}
