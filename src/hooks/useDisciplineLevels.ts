import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface DisciplineLevel {
  id: string;
  discipline: string;
  level_name: string;
  level_order: number;
  description: string | null;
  requirements: Record<string, unknown> | null;
}

async function fetchDisciplineLevels(): Promise<DisciplineLevel[]> {
  const { data, error } = await supabase
    .from('discipline_levels')
    .select('id, discipline, level_name, level_order, description, requirements')
    .order('discipline, level_order', { ascending: true });

  if (error) {
    toast.error(`Failed to load discipline levels: ${error.message}`);
    throw error;
  }

  return (data as DisciplineLevel[]) ?? [];
}

export function useDisciplineLevels() {
  const query = useQuery({
    queryKey: ['discipline-levels'],
    queryFn: fetchDisciplineLevels,
    staleTime: 1000 * 60 * 30,
  });

  const levelsByDiscipline = useMemo(() => {
    const map = new Map<string, DisciplineLevel[]>();
    (query.data ?? []).forEach((level) => {
      const existing = map.get(level.discipline) ?? [];
      existing.push(level);
      map.set(level.discipline, existing);
    });
    return map;
  }, [query.data]);

  const levelOptions = useMemo(() => {
    return (query.data ?? []).map((level) => ({
      label: `${level.level_name} (${level.discipline})`,
      value: level.id,
      discipline: level.discipline,
      order: level.level_order,
    }));
  }, [query.data]);

  return { ...query, levelsByDiscipline, levelOptions };
}
