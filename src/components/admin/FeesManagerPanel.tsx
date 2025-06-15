import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import FeesTable from "./FeesTable";
import FeeEditModal from "./FeeEditModal";
import FeeHistoryDrawer from "./FeeHistoryDrawer";
import { toast } from "@/hooks/use-toast";
import FeeSummaryCard from "./FeeSummaryCard";
import { exportFeesToCsv } from "@/utils/exportToCsv";

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

  // Track RLS error for user notification
  const [rlsError, setRlsError] = useState<string | null>(null);
  const [checkingAdminEntry, setCheckingAdminEntry] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isAdminInTable, setIsAdminInTable] = useState<boolean | null>(null);

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

  // Debug: Check if user is logged in and has correct email for admin access
  // We'll log these for better RLS issue tracking
  React.useEffect(() => {
    setCheckingAdminEntry(true);
    (async () => {
      const { data: sessionData, error: authError } = await supabase.auth.getSession();
      const userEmail = sessionData?.session?.user?.email;
      setAdminEmail(userEmail ?? null);
      console.log("DEBUG: Current session email:", userEmail);

      if (userEmail) {
        // Check if admin email exists in admin_users table
        const { data: foundUser, error: adminError } = await supabase
          .from("admin_users")
          .select("*")
          .eq("email", userEmail)
          .maybeSingle();
        setIsAdminInTable(!!foundUser);
        console.log("DEBUG: Is admin email in admin_users table?", !!foundUser, foundUser);
        if (!foundUser) {
          setRlsError(
            `Your email (${userEmail}) is NOT present in the admin_users table. 
            Please add your admin email to the "admin_users" table in Supabase Dashboard.`
          );
        } else {
          setRlsError(null);
        }
      } else {
        setIsAdminInTable(null);
      }
      setCheckingAdminEntry(false);
    })();
  }, []);

  // Function to display error UI message (visible above main panel)
  function AdminRLSBanner() {
    if (checkingAdminEntry) {
      return (
        <div className="p-2 bg-yellow-50 text-yellow-800 rounded mb-3 text-center font-bold">
          Checking admin status...
        </div>
      );
    }
    if (rlsError) {
      return (
        <div className="p-2 bg-red-100 text-red-700 rounded mb-3 text-center font-bold">
          {rlsError}
        </div>
      );
    }
    return null;
  }

  // Map students/fees for CSV: Reuse rows creation from FeesTable logic
  const rows = Array.isArray(students)
    ? students.map((student) => {
        const fee = fees?.find((f) => f.student_id === student.id) || null;
        return { student, fee };
      }).filter(row => {
        if (filterName && !row.student.name.toLowerCase().includes(filterName.toLowerCase())) return false;
        if (filterStatus) {
          const status = row.fee ? (row.fee.status || "unpaid").toLowerCase() : "unpaid";
          return status === filterStatus.toLowerCase();
        }
        return true;
      })
    : [];

  return (
    <div>
      <AdminRLSBanner />
      {/* Show admin email and admin_users lookup for debugging */}
      <div className="mb-2 text-xs text-gray-400">
        <span>Session email: <b>{adminEmail || "none"}</b> </span>
        | <span>
          In admin_users? <b>{isAdminInTable === null ? "..." : isAdminInTable ? "✅" : "❌"}</b>
        </span>
      </div>
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
      {/* Filters and table */}
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
          // Patch: propagate RLS error up if detected (optional, for FeeEditModal)
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
      <div className="mt-3 text-xs text-gray-600">
        <b>Having trouble saving fee?</b> Make sure you are signed in as an admin and your email exists in the <b>admin_users</b> table in Supabase.
        <br />
        <b>Common issues:</b> <ul className="inline-block ml-2 text-xs">
          <li>(1) You are not logged in, or session is expired (log out and retry)</li>
          <li>(2) Your email is not present in "admin_users" table</li>
          <li>(3) You are logging in with a typo in your email</li>
        </ul>
      </div>
    </div>
  );
}
