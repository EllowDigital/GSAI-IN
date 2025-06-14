
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFees({ month, year, studentId } = {}) {
  const queryClient = useQueryClient();
  const { data: rows, isLoading, error } = useQuery({
    queryKey: ["fees", month, year, studentId],
    queryFn: async () => {
      let q = supabase
        .from("fees")
        .select(
          "id, student_id, month, year, monthly_fee, paid_amount, balance_due, status, notes, created_at, updated_at, students(name, program, default_monthly_fee)"
        )
        .order("year", { ascending: false })
        .order("month", { ascending: false });
      if (month) q = q.eq("month", month);
      if (year) q = q.eq("year", year);
      if (studentId) q = q.eq("student_id", studentId);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });

  // Realtime - listen to inserts/updates/deletes on fees
  useEffect(() => {
    const channel = supabase
      .channel("public:fees")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fees" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["fees"] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { fees: rows, isLoading, error };
}

// Mutation hooks
export function useUpsertFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (form) => {
      // For upsert, match on student_id, month, year.
      const { id, ...payload } = form;
      const isUpdate = !!id;
      let q = supabase.from("fees");
      if (isUpdate) {
        const { error, data } = await q.update(payload).eq("id", id).select().single();
        if (error) throw error;
        return data;
      } else {
        // Insert, but if exists, update (unique constraint)
        // Try insert, on conflict update
        const { error, data } = await q
          .upsert(payload, { onConflict: "student_id, month, year" })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
    },
  });
}
