import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface BeltLevel {
  id: string;
  color: string;
  rank: number;
  discipline: string | null;
  requirements: Record<string, unknown>[];
  min_age: number | null;
  min_sessions: number | null;
  next_level_id: string | null;
}

async function fetchBeltLevels(): Promise<BeltLevel[]> {
  const { data, error } = await supabase
    .from('belt_levels')
    .select(
      'id, color, rank, discipline, requirements, min_age, min_sessions, next_level_id'
    )
    .order('discipline, rank', { ascending: true });

  if (error) {
    const fallback = error.message?.toLowerCase().includes('permission')
      ? 'Missing admin role: add your account to user_roles to manage belts.'
      : `Failed to load belt levels: ${error.message}`;
    toast.error(fallback);
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
      label: `${belt.color} Belt${belt.discipline ? ` (${belt.discipline})` : ''} - Rank ${belt.rank}`,
      value: belt.id,
      color: belt.color,
      discipline: belt.discipline,
      description:
        belt.requirements.length > 0
          ? `${belt.requirements.length} requirements`
          : 'Beginner level',
    }));
  }, [query.data]);

  // Group belts by discipline
  const beltsByDiscipline = useMemo(() => {
    const map = new Map<string, BeltLevel[]>();
    (query.data ?? []).forEach((belt) => {
      const discipline = belt.discipline ?? 'general';
      const existing = map.get(discipline) ?? [];
      existing.push(belt);
      map.set(discipline, existing);
    });
    return map;
  }, [query.data]);

  const getWhiteBeltId = (discipline?: string) => {
    const belts = query.data ?? [];
    // Try to find white belt for specific discipline
    if (discipline) {
      const disciplineBelt = belts.find(
        (belt) => belt.discipline === discipline && (belt.color.toLowerCase() === 'white' || belt.rank === 1)
      );
      if (disciplineBelt) return disciplineBelt.id;
    }
    // Fallback to general or first white belt
    const whiteBelt = belts.find(
      (belt) => belt.color.toLowerCase() === 'white' || belt.rank === 1
    );
    return whiteBelt?.id;
  };

  return { ...query, beltMap, beltOptions, beltsByDiscipline, getWhiteBeltId };
}
