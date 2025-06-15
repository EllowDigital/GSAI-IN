
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import FeesTable from "./FeesTable";
import FeeEditModal from "./FeeEditModal";
import FeeHistoryDrawer from "./FeeHistoryDrawer";
import { toast } from "@/hooks/use-toast";

export default function FeesManagerPanel() {
  // Centralized filter state
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editFee, setEditFee] = useState<any | null>(null);
  const [editStudent, setEditStudent] = useState<any | null>(null);

  // Drawer for payment history
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [historyStudent, setHistoryStudent] = useState<any | null>(null);

  // Fetch all students (for sidebar and to ensure all included in table even with no fee entry)
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

  // Fetch all fees for selected month/year, plus whole history for payment drawer
  const { data: fees, isLoading: loadingFees } = useQuery({
    queryKey: ["fees", filterMonth, filterYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fees")
        .select("*")
        .eq("month", filterMonth)
        .eq("year", filterYear);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 2000, // Near-realtime sync!
  });

  // For full history drawer, fetch *all* fees per student
  const { data: allFees } = useQuery({
    queryKey: ["fees", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fees")
        .select("*");
      if (error) throw error;
      return data || [];
    },
    enabled: historyDrawerOpen,
    refetchInterval: historyDrawerOpen ? 2000 : false,
  });

  // Filtered fee table presentation
  return (
    <div>
      <FeesTable
        students={students}
        fees={fees}
        isLoading={loadingStudents || loadingFees}
        filterMonth={filterMonth}
        filterYear={filterYear}
        filterStatus={filterStatus}
        filterName={filterName}
        setFilterMonth={setFilterMonth}
        setFilterYear={setFilterYear}
        setFilterStatus={setFilterStatus}
        setFilterName={setFilterName}
        onEditFee={({ student, fee }) => {
          setEditStudent(student);
          setEditFee(fee);
          setModalOpen(true);
        }}
        onShowHistory={student => {
          setHistoryStudent(student);
          setHistoryDrawerOpen(true);
        }}
      />
      {/* Add/Edit Fee Modal */}
      {modalOpen && (
        <FeeEditModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          student={editStudent}
          fee={editFee}
          month={filterMonth}
          year={filterYear}
        />
      )}
      {/* Payment History Drawer */}
      {historyDrawerOpen && (
        <FeeHistoryDrawer
          open={historyDrawerOpen}
          onClose={() => setHistoryDrawerOpen(false)}
          student={historyStudent}
          allFees={allFees}
        />
      )}
    </div>
  );
}
