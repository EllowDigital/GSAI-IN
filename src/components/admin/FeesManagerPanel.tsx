
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import FeeSummaryCard from "./FeeSummaryCard";
import FeesTable from "./FeesTable";
import FeeEditModal from "./FeeEditModal";
import FeeHistoryDrawer from "./FeeHistoryDrawer";
import FeesFilterBar from "./FeesFilterBar";
import { exportFeesToCsv } from "@/utils/exportToCsv";

export default function FeesManagerPanel() {
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterStatus, setFilterStatus] = useState("");
  const [filterName, setFilterName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<any | null>(null);
  const [editFee, setEditFee] = useState<any | null>(null);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [historyStudent, setHistoryStudent] = useState<any | null>(null);

  // Fetch students
  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, name, program, default_monthly_fee, profile_image_url");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch fees for filtered month/year
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
    refetchInterval: 2000,
  });

  // All fees for history drawer
  const { data: allFees } = useQuery({
    queryKey: ["fees", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("fees").select("*");
      if (error) throw error;
      return data || [];
    },
    enabled: historyDrawerOpen,
    refetchInterval: historyDrawerOpen ? 2000 : false,
  });

  // Compose filtered rows
  const rows = Array.isArray(students)
    ? students
      .map((student) => {
        const fee = fees?.find((f) => f.student_id === student.id) || null;
        return { student, fee };
      })
      .filter((row) => {
        if (
          filterName &&
          !row.student.name.toLowerCase().includes(filterName.toLowerCase())
        ) return false;
        if (filterStatus) {
          const status = row.fee
            ? (row.fee.status || "unpaid").toLowerCase()
            : "unpaid";
          return status === filterStatus.toLowerCase();
        }
        return true;
      })
    : [];

  // Handlers
  const handleEditFee = ({ student, fee }: { student: any; fee?: any }) => {
    setEditStudent(student);
    setEditFee(fee);
    setModalOpen(true);
  };
  const handleShowHistory = (student: any) => {
    setHistoryStudent(student);
    setHistoryDrawerOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
        <FeeSummaryCard fees={fees || []} loading={loadingFees} />
        <button
          onClick={() => exportFeesToCsv(rows, filterMonth, filterYear)}
          className="border border-yellow-400 px-4 py-2 rounded-full bg-yellow-50 text-yellow-700 font-medium hover:bg-yellow-200 transition text-sm ml-auto"
          disabled={!Array.isArray(rows) || rows.length === 0}
        >
          Export CSV
        </button>
      </div>
      <FeesFilterBar
        filterMonth={filterMonth}
        filterYear={filterYear}
        filterStatus={filterStatus}
        filterName={filterName}
        setFilterMonth={setFilterMonth}
        setFilterYear={setFilterYear}
        setFilterStatus={setFilterStatus}
        setFilterName={setFilterName}
      />
      <FeesTable
        students={students}
        fees={fees}
        isLoading={loadingStudents || loadingFees}
        onEditFee={handleEditFee}
        onShowHistory={handleShowHistory}
      />
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
