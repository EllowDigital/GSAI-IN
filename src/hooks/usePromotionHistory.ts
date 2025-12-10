import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface PromotionHistoryRecord {
  id: string;
  student_id: string;
  from_belt_id: string | null;
  to_belt_id: string;
  promoted_by: string | null;
  promoted_at: string;
  notes: string | null;
  students?: {
    id: string;
    name: string;
    program: string;
    profile_image_url: string | null;
  } | null;
  from_belt?: {
    id: string;
    color: string;
    rank: number;
  } | null;
  to_belt?: {
    id: string;
    color: string;
    rank: number;
  } | null;
}

async function fetchPromotionHistory(): Promise<PromotionHistoryRecord[]> {
  const { data, error } = await supabase
    .from('promotion_history')
    .select(
      `id, student_id, from_belt_id, to_belt_id, promoted_by, promoted_at, notes,
       students:students (id, name, program, profile_image_url),
       from_belt:belt_levels!promotion_history_from_belt_id_fkey (id, color, rank),
       to_belt:belt_levels!promotion_history_to_belt_id_fkey (id, color, rank)`
    )
    .order('promoted_at', { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  return (data as PromotionHistoryRecord[]) ?? [];
}

export function usePromotionHistory() {
  const queryClient = useQueryClient();
  const queryKey = ['promotion-history'];

  const query = useQuery({
    queryKey,
    queryFn: fetchPromotionHistory,
    staleTime: 1000 * 60,
  });

  const addMutation = useMutation({
    mutationFn: async ({
      studentId,
      fromBeltId,
      toBeltId,
      notes,
    }: {
      studentId: string;
      fromBeltId: string | null;
      toBeltId: string;
      notes?: string;
    }) => {
      const { error } = await supabase.from('promotion_history').insert({
        student_id: studentId,
        from_belt_id: fromBeltId,
        to_belt_id: toBeltId,
        notes: notes ?? null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      console.error('Failed to log promotion:', error);
    },
  });

  return {
    ...query,
    history: query.data ?? [],
    addPromotion: addMutation.mutateAsync,
    addingPromotion: addMutation.isPending,
  };
}
