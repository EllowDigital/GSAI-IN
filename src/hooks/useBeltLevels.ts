import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BeltLevel {
  id: string;
  color: string;
  rank: number;
  requirements: Record<string, unknown>[];
  min_age: number | null;
  min_sessions: number | null;
  next_level_id: string | null;
}

async function fetchBeltLevels(): Promise<BeltLevel[]> {
  const { data, error } = await supabase
    .from('belt_levels')
    .select('id, color, rank, requirements, min_age, min_sessions, next_level_id')
    .order('rank', { ascending: true });

  if (error) {
    throw error;
  }

  return (data as BeltLevel[]) ?? [];
}

export function useBeltLevels() {
  const query = useQuery({
    queryKey: ['belt-levels'],
    queryFn: fetchBeltLevels,
    staleTime: 1000 * 60 * 30,
  });

  const beltMap = useMemo(() => {
    const map = new Map<string, BeltLevel>();
    (query.data ?? []).forEach((belt) => {
      map.set(belt.id, belt);
    });
    return map;
  }, [query.data]);

  const beltOptions = useMemo(() => {
    return (query.data ?? []).map((belt) => ({
      label: `${belt.color} (Rank ${belt.rank})`,
      value: belt.id,
      color: belt.color,
    }));
  }, [query.data]);

  return { ...query, beltMap, beltOptions };
}
