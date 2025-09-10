import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useOptimizedQuery } from './useOptimizedQuery';
import { realtimeManager } from '@/utils/supabaseOptimization';

export type EventRow = Tables<'events'>;

async function fetchEvents(): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('from_date', { ascending: false })
    .limit(6);

  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Custom hook to retrieve events with retry, caching, and realtime updates
 */
export function useEventsQuery() {
  const queryClient = useQueryClient();

  // Use optimized query for better performance
  const query = useOptimizedQuery<EventRow[], Error>(
    ['events', 'public', 'cards'],
    fetchEvents,
    {
      cacheKey: 'events_public_cards',
      cacheDuration: 1000 * 60 * 2, // 2 minutes
      retries: 2,
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: true,
    }
  );

  // Add optimized real-time subscription
  useEffect(() => {
    const channelKey = 'events-realtime';
    
    const channel = supabase
      .channel('public-events-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          // Invalidate and refetch on any event change
          queryClient.invalidateQueries({
            queryKey: ['events', 'public', 'cards'],
          });
        }
      )
      .subscribe();

    realtimeManager.subscribe(channelKey, channel);

    return () => {
      realtimeManager.unsubscribe(channelKey);
    };
  }, [queryClient]);

  return query;
}
