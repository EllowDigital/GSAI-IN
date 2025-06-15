import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

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

  // Use react-query for fetching and retry mechanism
  const query = useQuery<EventRow[], Error>({
    queryKey: ['events', 'public', 'cards'],
    queryFn: fetchEvents,
    retry: 2, // Retry up to 2 times on failure
    staleTime: 1000 * 60, // 1 minute
    // cacheTime removed due to API change
    refetchOnWindowFocus: true, // Refetch when user returns to page
  });

  // Add supabase real-time subscription for live event updates
  useEffect(() => {
    // Subscribe to events changes from Supabase
    const channel = supabase
      .channel('public-events-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          // Refetch on any event change
          queryClient.invalidateQueries({
            queryKey: ['events', 'public', 'cards'],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
