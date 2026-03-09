import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Discipline {
  id: string;
  name: string;
  type: 'belt' | 'level';
  has_stripes: boolean;
  description: string | null;
  is_active: boolean;
  display_order: number;
}

/**
 * Fetches all active disciplines from the `disciplines` table.
 * This is the single source of truth for program/discipline options
 * across enrollment forms, student modals, progression assignment, etc.
 */
export function useDisciplines() {
  const query = useQuery({
    queryKey: ['disciplines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disciplines')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data || []) as Discipline[];
    },
    staleTime: 1000 * 60 * 10, // 10 min
  });

  const disciplines = query.data ?? [];

  /** All active disciplines as Select options */
  const disciplineOptions = useMemo(
    () =>
      disciplines.map((d) => ({
        value: d.name,
        label: d.name,
        type: d.type,
        hasStripes: d.has_stripes,
      })),
    [disciplines]
  );

  /** Belt-based disciplines */
  const beltDisciplines = useMemo(
    () => disciplines.filter((d) => d.type === 'belt'),
    [disciplines]
  );

  /** Level-based disciplines */
  const levelDisciplines = useMemo(
    () => disciplines.filter((d) => d.type === 'level'),
    [disciplines]
  );

  /** Check if a program name is belt-based */
  const isBeltBased = (programName: string): boolean => {
    const d = disciplines.find(
      (d) => d.name.toLowerCase() === programName.toLowerCase()
    );
    return d?.type === 'belt';
  };

  /** Check if a program name is level-based */
  const isLevelBased = (programName: string): boolean => {
    const d = disciplines.find(
      (d) => d.name.toLowerCase() === programName.toLowerCase()
    );
    return d?.type === 'level';
  };

  /** Check if a program supports stripes */
  const hasStripes = (programName: string): boolean => {
    const d = disciplines.find(
      (d) => d.name.toLowerCase() === programName.toLowerCase()
    );
    return d?.has_stripes ?? false;
  };

  /** Get discipline config by name */
  const getDiscipline = (programName: string): Discipline | undefined => {
    return disciplines.find(
      (d) => d.name.toLowerCase() === programName.toLowerCase()
    );
  };

  return {
    ...query,
    disciplines,
    disciplineOptions,
    beltDisciplines,
    levelDisciplines,
    isBeltBased,
    isLevelBased,
    hasStripes,
    getDiscipline,
  };
}
