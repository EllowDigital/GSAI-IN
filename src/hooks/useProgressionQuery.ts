import { useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { toast } from '@/components/ui/sonner';

export type ProgressStatus = 'needs_work' | 'ready' | 'passed' | 'deferred';

export interface ProgressionFilters {
  search?: string;
  program?: string;
  coachId?: string;
  beltLevelId?: string;
  statuses?: ProgressStatus[];
}

export interface ProgressionRecord {
  id: string;
  status: ProgressStatus;
  assessment_date: string | null;
  coach_notes: string | null;
  evidence_media_urls: string[];
  assessed_by: string | null;
  updated_at: string;
  stripe_count: number;
  belt_levels?: {
    id: string;
    color: string;
    rank: number;
    discipline: string | null;
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
      `id, status, assessment_date, coach_notes, evidence_media_urls, assessed_by, updated_at, stripe_count,
       belt_levels:belt_levels (id, color, rank, discipline, requirements),
       students:students (id, name, program, profile_image_url)`
    )
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ProgressionRecord[]) ?? [];
}

function filterRecords(
  records: ProgressionRecord[] | undefined,
  filters: ProgressionFilters
) {
  if (!records) return [];

  const search = filters.search?.trim().toLowerCase();
  const allowedStatuses =
    filters.statuses && filters.statuses.length > 0
      ? filters.statuses
      : (['needs_work', 'ready', 'passed', 'deferred'] as ProgressStatus[]);

  return records.filter((record) => {
    if (!allowedStatuses.includes(record.status)) {
      return false;
    }

    if (filters.program) {
      // student.program may be comma-separated (multi-program)
      const studentPrograms = (record.students?.program ?? '')
        .split(',')
        .map((p) => p.trim().toLowerCase());
      const beltDiscipline = (
        record.belt_levels?.discipline ?? ''
      ).toLowerCase();
      const filterProg = filters.program.toLowerCase();
      // Match if the filter matches any of the student's programs OR the belt's discipline
      if (
        !studentPrograms.includes(filterProg) &&
        beltDiscipline !== filterProg
      ) {
        return false;
      }
    }

    if (filters.beltLevelId && record.belt_levels?.id !== filters.beltLevelId) {
      return false;
    }

    if (filters.coachId && record.assessed_by !== filters.coachId) {
      return false;
    }

    if (search) {
      const candidate = [
        record.students?.name ?? '',
        record.students?.program ?? '',
        record.belt_levels?.color ?? '',
        record.belt_levels?.rank != null
          ? record.belt_levels.rank.toString()
          : '',
        record.status ?? '',
        record.coach_notes ?? '',
      ]
        .join(' ')
        .toLowerCase();
      if (!candidate.includes(search)) {
        return false;
      }
    }

    return true;
  });
}

export function useProgressionQuery(filters: ProgressionFilters = {}) {
  const queryClient = useQueryClient();
  const queryKey = ['student-progress'];

  const query = useQuery({
    queryKey,
    queryFn: fetchProgression,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const channel = supabase
      .channel('student-progress-admin-stream')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_progress' },
        () => queryClient.invalidateQueries({ queryKey })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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
      if (assessment_date !== undefined)
        payload.assessment_date = assessment_date;
      if (coach_notes !== undefined) payload.coach_notes = coach_notes;

      const { error } = await supabase
        .from('student_progress')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      return { id, ...payload };
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ProgressionRecord[]>(queryKey);

      if (previous) {
        queryClient.setQueryData<ProgressionRecord[]>(
          queryKey,
          (old) =>
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
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error(error instanceof Error ? error.message : 'Update failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: () => {
      toast.success('Progress updated');
    },
  });

  const evidenceMutation = useMutation({
    mutationFn: async ({ id, mediaUrl }: { id: string; mediaUrl: string }) => {
      const current =
        queryClient.getQueryData<ProgressionRecord[]>(queryKey) ?? [];
      const target = current.find((record) => record.id === id);
      const nextEvidence = [...(target?.evidence_media_urls ?? []), mediaUrl];

      const { error } = await supabase
        .from('student_progress')
        .update({ evidence_media_urls: nextEvidence })
        .eq('id', id);

      if (error) throw error;
      return { id, evidence_media_urls: nextEvidence };
    },
    onMutate: async ({ id, mediaUrl }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ProgressionRecord[]>(queryKey);

      if (previous) {
        queryClient.setQueryData<ProgressionRecord[]>(
          queryKey,
          (old) =>
            old?.map((record) =>
              record.id === id
                ? {
                    ...record,
                    evidence_media_urls: [
                      ...(record.evidence_media_urls ?? []),
                      mediaUrl,
                    ],
                  }
                : record
            ) ?? []
        );
      }

      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: () => {
      toast.success('Evidence attached');
    },
  });

  const assignMutation = useMutation({
    mutationFn: async ({
      studentId,
      beltLevelId,
      status = 'needs_work',
    }: {
      studentId: string;
      beltLevelId: string;
      status?: ProgressStatus;
    }) => {
      // Check if student already has a progress record for THIS specific belt level
      const { data: existingForBelt, error: checkBeltErr } = await supabase
        .from('student_progress')
        .select('id')
        .eq('student_id', studentId)
        .eq('belt_level_id', beltLevelId)
        .maybeSingle();

      if (checkBeltErr && checkBeltErr.code !== 'PGRST116') {
        throw checkBeltErr;
      }

      if (existingForBelt) {
        // Update existing record for this belt
        const { error } = await supabase
          .from('student_progress')
          .update({
            status,
            assessment_date: null,
            coach_notes: null,
          })
          .eq('id', existingForBelt.id);
        if (error) throw error;
      } else {
        // Insert new record — allows multiple records per student (one per program/belt)
        const { error } = await supabase.from('student_progress').insert({
          student_id: studentId,
          belt_level_id: beltLevelId,
          status,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Student assigned to belt');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Assignment failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: async ({
      id,
      nextBelt,
    }: {
      id: string;
      nextBelt: {
        id: string;
        color: string;
        rank: number;
        requirements: Record<string, unknown>[] | null;
      };
    }) => {
      const { error } = await supabase
        .from('student_progress')
        .update({
          belt_level_id: nextBelt.id,
          status: 'needs_work',
          assessment_date: null,
          coach_notes: null,
        })
        .eq('id', id);

      if (error) throw error;
      return { id, nextBelt };
    },
    onMutate: async ({ id, nextBelt }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ProgressionRecord[]>(queryKey);

      if (previous) {
        queryClient.setQueryData<ProgressionRecord[]>(
          queryKey,
          (old) =>
            old?.map((record) =>
              record.id === id
                ? {
                    ...record,
                    belt_levels: record.belt_levels
                      ? {
                          ...record.belt_levels,
                          id: nextBelt.id,
                          color: nextBelt.color,
                          rank: nextBelt.rank,
                          requirements: nextBelt.requirements,
                        }
                      : record.belt_levels,
                    status: 'needs_work',
                    assessment_date: null,
                    coach_notes: null,
                  }
                : record
            ) ?? []
        );
      }

      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error(error instanceof Error ? error.message : 'Promotion failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['promotion-history'] });
    },
    onSuccess: () => {
      toast.success('Student promoted to next belt');
    },
  });

  // Stripe count mutation for BJJ/Grappling
  const stripeMutation = useMutation({
    mutationFn: async ({
      id,
      stripeCount,
    }: {
      id: string;
      stripeCount: number;
    }) => {
      const clampedCount = Math.max(0, Math.min(4, stripeCount));
      const { error } = await supabase
        .from('student_progress')
        .update({ stripe_count: clampedCount })
        .eq('id', id);

      if (error) throw error;
      return { id, stripe_count: clampedCount };
    },
    onMutate: async ({ id, stripeCount }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ProgressionRecord[]>(queryKey);

      if (previous) {
        queryClient.setQueryData<ProgressionRecord[]>(
          queryKey,
          (old) =>
            old?.map((record) =>
              record.id === id
                ? {
                    ...record,
                    stripe_count: Math.max(0, Math.min(4, stripeCount)),
                  }
                : record
            ) ?? []
        );
      }

      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error(
        error instanceof Error ? error.message : 'Stripe update failed'
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: () => {
      toast.success('Stripe count updated');
    },
  });

  // Edit progression record mutation (change belt/level, stripe, notes)
  const editMutation = useMutation({
    mutationFn: async ({
      id,
      belt_level_id,
      stripe_count,
      status,
      coach_notes,
    }: {
      id: string;
      belt_level_id?: string;
      stripe_count?: number;
      status?: ProgressStatus;
      coach_notes?: string | null;
    }) => {
      const payload: Record<string, unknown> = {};
      if (belt_level_id !== undefined) payload.belt_level_id = belt_level_id;
      if (stripe_count !== undefined)
        payload.stripe_count = Math.max(0, Math.min(4, stripe_count));
      if (status !== undefined) payload.status = status;
      if (coach_notes !== undefined) payload.coach_notes = coach_notes;

      const { error } = await supabase
        .from('student_progress')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      return { id, ...payload };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: () => {
      toast.success('Progression record updated');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Edit failed');
    },
  });

  // Delete progression record mutation — also removes related promotion history
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Find the record to get student_id and belt_level_id for history cleanup
      const current =
        queryClient.getQueryData<ProgressionRecord[]>(queryKey) ?? [];
      const target = current.find((r) => r.id === id);

      // Delete promotion history linked to this student + belt
      if (target?.students?.id && target?.belt_levels?.id) {
        await supabase
          .from('promotion_history')
          .delete()
          .eq('student_id', target.students.id)
          .or(
            `from_belt_id.eq.${target.belt_levels.id},to_belt_id.eq.${target.belt_levels.id}`
          );
      }

      const { error } = await supabase
        .from('student_progress')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ProgressionRecord[]>(queryKey);

      if (previous) {
        queryClient.setQueryData<ProgressionRecord[]>(
          queryKey,
          (old) => old?.filter((record) => record.id !== id) ?? []
        );
      }

      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['promotion-history'] });
      queryClient.invalidateQueries({
        queryKey: ['discipline-progress-admin'],
      });
    },
    onSuccess: () => {
      toast.success('Progression record deleted');
    },
  });

  const filteredRecords = useMemo(
    () => filterRecords(query.data, filters),
    [query.data, filters]
  );

  const grouped = useMemo(() => {
    const base: Record<ProgressStatus, ProgressionRecord[]> = {
      needs_work: [],
      ready: [],
      passed: [],
      deferred: [],
    };

    filteredRecords.forEach((record) => {
      base[record.status]?.push(record);
    });

    return base;
  }, [filteredRecords]);

  return {
    ...query,
    records: filteredRecords,
    grouped,
    updateProgress: updateMutation.mutate,
    updateProgressAsync: updateMutation.mutateAsync,
    updating: updateMutation.isPending,
    appendEvidence: evidenceMutation.mutate,
    appendingEvidence: evidenceMutation.isPending,
    assignStudent: assignMutation.mutateAsync,
    assigningStudent: assignMutation.isPending,
    promoteStudent: promoteMutation.mutateAsync,
    promotingStudent: promoteMutation.isPending,
    updateStripeCount: stripeMutation.mutate,
    updatingStripeCount: stripeMutation.isPending,
    deleteProgress: deleteMutation.mutateAsync,
    deletingProgress: deleteMutation.isPending,
    editProgress: editMutation.mutateAsync,
    editingProgress: editMutation.isPending,
  };
}
