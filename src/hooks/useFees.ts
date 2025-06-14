
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Type for Fees Hook Arguments
type UseFeesArgs = {
  month?: number | string;
  year?: number | string;
  studentId?: string;
};

export function useFees(args: UseFeesArgs = {}) {
  const { month, year, studentId } = args;
  const queryClient = useQueryClient();
  const { data: rows, isLoading, error } = useQuery({
    queryKey: ["fees", month, year, studentId],
    queryFn: async () => {
      let q = supabase
        .from("fees")
        .select(
          "id, student_id, month, year, monthly_fee, paid_amount, balance_due, status, notes, created_at, updated_at, students(id, name, program, default_monthly_fee)"
        )
        .order("year", { ascending: false })
        .order("month", { ascending: false });
      if (month) q = q.eq("month", Number(month));
      if (year) q = q.eq("year", Number(year));
      if (studentId) q = q.eq("student_id", studentId);
      const { data, error } = await q;
      if (error) {
        console.error("Fees query error:", error.message);
        throw error;
      }
      console.log("Fees fetched:", data);
      return data || [];
    }
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
    // Accept payload as FeesInsert or FeesUpdate (see below)
    mutationFn: async (form: Partial<TablesInsert<'fees'>> & { id?: string }) => {
      const { id, ...payload } = form;
      if (id) {
        const updatePayload: TablesUpdate<'fees'> = { ...payload };
        const { error, data } = await supabase
          .from("fees")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const insertPayload: TablesInsert<'fees'> = {
          student_id: payload.student_id as string,
          month: payload.month as number,
          year: payload.year as number,
          monthly_fee: payload.monthly_fee as number,
          paid_amount: payload.paid_amount as number || 0,
          balance_due: payload.balance_due as number || 0,
          notes: payload.notes || null,
        };
        const { error, data } = await supabase
          .from("fees")
          .upsert(insertPayload, { onConflict: "student_id, month, year" })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
    }
  });
}
