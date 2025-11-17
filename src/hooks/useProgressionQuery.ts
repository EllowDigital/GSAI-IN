import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export type ProgressStatus = 'needs_work' | 'ready' | 'passed' | 'deferred';

export interface ProgressionRecord {
  id: string;
  status: ProgressStatus;
  assessment_date: string | null;
  coach_notes: string | null;
  evidence_media_urls: string[];
  belt_levels?: {
    id: string;
    color: string;
    rank: number;
    requirements: Record<string, unknown>[] | null;
  } | null;
  students?: {
    id: string;
    name: string;
    program: string;
    profile_image_url: string | null;
  } | null;
}

async function fetchProgression(): Promise<ProgressionRecord[]> {
  const { data, error } = await supabase
    .from('student_progress')
    .select(
      `id, status, assessment_date, coach_notes, evidence_media_urls,
       belt_levels:belt_levels (id, color, rank, requirements),
       students:students (id, name, program, profile_image_url)`
    )
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ProgressionRecord[]) ?? [];
}

export function useProgressionQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['student-progress'],
    queryFn: fetchProgression,
    staleTime: 1000 * 30,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      assessment_date,
      coach_notes,
    }: {
      id: string;
      status: ProgressStatus;
      assessment_date?: string | null;
      coach_notes?: string | null;
    }) => {
      const payload: Record<string, unknown> = { status };
      if (assessment_date !== undefined) payload.assessment_date = assessment_date;
      if (coach_notes !== undefined) payload.coach_notes = coach_notes;

      const { error } = await supabase
        .from('student_progress')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      return { id, ...payload };
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['student-progress'] });
      const previous = queryClient.getQueryData<ProgressionRecord[]>([
        'student-progress',
      ]);

      if (previous) {
        queryClient.setQueryData<ProgressionRecord[]>(['student-progress'], (old) =>
          old?.map((record) =>
            record.id === variables.id
              ? {
                  ...record,
                  status: variables.status,
                  assessment_date:
                    variables.assessment_date ?? record.assessment_date,
                  coach_notes: variables.coach_notes ?? record.coach_notes,
                }
              : record
          ) ?? []
        );
      }

      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['student-progress'], context.previous);
      }
      toast.error(error instanceof Error ? error.message : 'Update failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
    },
    onSuccess: () => {
      toast.success('Progress updated');
    },
  });

  const grouped = useMemo(() => {
    const base: Record<ProgressStatus, ProgressionRecord[]> = {
      needs_work: [],
      ready: [],
      passed: [],
      deferred: [],
    };

    (query.data ?? []).forEach((record) => {
      const status = record.status ?? 'needs_work';
      base[status]?.push(record);
    });

    return base;
  }, [query.data]);

  return {
    ...query,
    grouped,
    updateProgress: updateMutation.mutate,
    updating: updateMutation.isPending,
  };
}
