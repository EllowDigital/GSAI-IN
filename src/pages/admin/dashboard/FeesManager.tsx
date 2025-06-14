
import React from "react";
import { BadgeDollarSign } from "lucide-react";
import { useFees } from "@/hooks/useFees";
import { supabase } from "@/integrations/supabase/client";
import FeeTable from "@/components/admin/FeeTable";
import { useQuery } from "@tanstack/react-query";

export default function FeesManager() {
  // Fetch all students for dropdown/modal use
  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, name, program, default_monthly_fee");
      if (error) throw error;
      return data || [];
    },
  });

  // All fees (live)
  const { fees, isLoading: loadingFees } = useFees();

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white rounded-2xl shadow-lg">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-yellow-500">
          <BadgeDollarSign className="w-7 h-7" /> Fees Management
        </h2>
      </div>
      <FeeTable fees={fees} students={students} isLoading={loadingFees || loadingStudents} />
    </div>
  );
}
