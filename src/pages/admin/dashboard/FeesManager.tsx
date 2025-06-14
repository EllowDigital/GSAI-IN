
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Loader2, BadgeDollarSign, Search, ChevronDown, ChevronUp } from "lucide-react";

const PROGRAMS = [
  "Karate",
  "Taekwondo",
  "Boxing",
  "Kickboxing",
  "Grappling",
  "MMA",
  "Kalaripayattu",
  "Self-Defense",
  "Fat Loss"
];

export default function FeesManager() {
  const queryClient = useQueryClient();
  const [programFilter, setProgramFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Fetch students
  const { data, isLoading, error } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, name, fee_status, program, aadhar_number, parent_name, parent_contact")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  // Mutation to update fee_status
  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("students")
        .update({ fee_status: status })
        .eq("id", id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Fee status updated!");
    },
    onError: () => {
      toast.error("Failed to update fee status.");
    },
  });

  // Filters
  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((s) => {
      if (programFilter && s.program !== programFilter) return false;
      if (statusFilter && s.fee_status !== statusFilter) return false;
      return true;
    });
  }, [data, programFilter, statusFilter]);

  // Stats
  const paidCount = data ? data.filter((s) => s.fee_status === "paid").length : 0;
  const unpaidCount = data ? data.filter((s) => s.fee_status !== "paid").length : 0;

  return (
    <div className="max-w-5xl mx-auto bg-white p-5 rounded-2xl shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-yellow-500">
          <BadgeDollarSign className="w-7 h-7" /> Fees Manager
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={programFilter}
            onChange={e => setProgramFilter(e.target.value)}
            className="border px-3 py-1 rounded bg-gray-50 text-sm"
          >
            <option value="">All Programs</option>
            {PROGRAMS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border px-3 py-1 rounded bg-gray-50 text-sm"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>
      <div className="mb-3 flex gap-6">
        <div className="text-green-600 font-bold">
          Paid: <span>{paidCount}</span>
        </div>
        <div className="text-red-500 font-bold">
          Unpaid: <span>{unpaidCount}</span>
        </div>
        <div className="ml-auto text-sm text-gray-500">
          Total Students: {data ? data.length : 0}
        </div>
      </div>
      <div className="overflow-auto rounded border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-10">
                  No students found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.program}</TableCell>
                  <TableCell>{s.parent_name}</TableCell>
                  <TableCell>{s.parent_contact}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-3 py-1 font-bold text-xs capitalize ${s.fee_status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {s.fee_status === "paid" ? "Paid" : "Unpaid"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={s.fee_status === "paid" ? "secondary" : "outline"}
                      size="sm"
                      disabled={mutation.isPending}
                      onClick={() =>
                        mutation.mutate({
                          id: s.id,
                          status: s.fee_status === "paid" ? "unpaid" : "paid",
                        })
                      }
                    >
                      {mutation.isPending ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : s.fee_status === "paid" ? "Mark Unpaid" : "Mark Paid"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
