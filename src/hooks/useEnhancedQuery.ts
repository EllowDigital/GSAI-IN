import {
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  handleSupabaseError,
  retryOperation,
  logError,
} from '@/utils/errorHandling';

interface EnhancedQueryOptions {
  queryKey: string[];
  queryFn: () => Promise<any>;
  enableRealtime?: boolean;
  realtimeTable?: string;
  retryAttempts?: number;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  enabled?: boolean;
}

interface UseEnhancedQueryReturn<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  isSuccess: boolean;
  isFetching: boolean;
  isPending: boolean;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
  refetch: () => Promise<any>;
}

export function useEnhancedQuery<T = any>({
  queryKey,
  queryFn,
  enableRealtime = true,
  realtimeTable,
  retryAttempts = 3,
  staleTime = 1000 * 60 * 5, // 5 minutes
  cacheTime = 1000 * 60 * 30, // 30 minutes
  refetchOnWindowFocus = true,
  enabled = true,
}: EnhancedQueryOptions): UseEnhancedQueryReturn<T> {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Enhanced query with retry mechanism and error handling
  const query = useQuery<T>({
    queryKey,
    queryFn: async () => {
      try {
        return await retryOperation(queryFn, retryAttempts);
      } catch (error) {
        const appError = handleSupabaseError(error);
        logError(appError, `Query: ${queryKey.join('.')}`);
        throw appError;
      }
    },
    staleTime,
    gcTime: cacheTime, // Updated from cacheTime to gcTime for newer react-query versions
    refetchOnWindowFocus,
    enabled,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof Error && error.message.includes('session')) {
        return false;
      }
      return failureCount < retryAttempts;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Real-time subscription
  useEffect(() => {
    if (!enableRealtime || !realtimeTable) return;

    const channel = supabase
      .channel(`enhanced-${realtimeTable}-${queryKey.join('-')}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: realtimeTable,
        },
        (payload) => {
          console.log(`Real-time update for ${realtimeTable}:`, payload);

          // Invalidate and refetch queries
          queryClient.invalidateQueries({ queryKey });

          // Also invalidate dashboard stats if available
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
      )
      .subscribe((status, error) => {
        if (error) {
          logError(error, `Real-time subscription: ${realtimeTable}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, queryKey, enableRealtime, realtimeTable]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.refetchQueries({ queryKey });
    } catch (error) {
      logError(error, `Manual refresh: ${queryKey.join('.')}`);
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, queryKey]);

  // Auto-reconnect on network restore
  useEffect(() => {
    const handleOnline = () => {
      if (query.isError) {
        refresh();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [query.isError, refresh]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    isSuccess: query.isSuccess,
    isFetching: query.isFetching,
    isPending: query.isPending,
    refetch: query.refetch,
    refresh,
    isRefreshing,
  };
}

// Specialized hook for news data
export function useNewsQuery() {
  return useEnhancedQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enableRealtime: true,
    realtimeTable: 'news',
  });
}

// Specialized hook for gallery images
export function useGalleryQuery() {
  return useEnhancedQuery({
    queryKey: ['gallery-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    enableRealtime: true,
    realtimeTable: 'gallery_images',
  });
}

// Specialized hook for students
export function useStudentsQuery() {
  return useEnhancedQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enableRealtime: true,
    realtimeTable: 'students',
  });
}

// Specialized hook for events
export function useEventsQueryEnhanced() {
  return useEnhancedQuery({
    queryKey: ['events', 'public', 'cards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('from_date', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
    enableRealtime: true,
    realtimeTable: 'events',
  });
}
