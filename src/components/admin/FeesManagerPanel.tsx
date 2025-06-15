import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import FeesTable from "./FeesTable";
import FeeEditModal from "./FeeEditModal";
import FeeHistoryDrawer from "./FeeHistoryDrawer";
import { toast } from "@/hooks/use-toast";
import FeeSummaryCard from "./FeeSummaryCard";
import { exportFeesToCsv } from "@/utils/exportToCsv";
import { useAdminRLS } from "./useAdminRLS";

// ---- REMOVE THIS OLD/INNER FUNCTION ----
// (It started like this, remove all lines down to before `export default function FeesManagerPanel() {`)
/*
function AdminRLSBanner() {
  // Access values from parent scope
  // These will be available in closure from the parent FeesManagerPanel component
  // (adminEmail, checkingAdminEntry, rlsError, isAdminInTable should all be in scope)
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
        <br />
        <span className="block text-xs mt-2">
          <b>⚠️ Important:</b>
          <br />
          You will NOT be able to save or update fees unless your email is present in the <b>admin_users</b> table. 
          <br />
          Please check in Supabase → <b>admin_users</b> and add your login email if needed.
        </span>
      </div>
    );
  }
  if (isAdminInTable === false) {
    return (
      <div className="p-2 bg-red-100 text-red-700 rounded mb-3 text-center font-bold">
        Your admin email is <b>not</b> in the admin_users table!
        <br />
        You cannot save or edit fees.
        <br />
        See Supabase → admin_users to add your email.
      </div>
    );
  }
  return null;
}
*/

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

  // Use centralized RLS logic
  const {
    adminEmail,
    isAdminInTable,
    rlsError,
    checkingAdminEntry,
    canSubmitFeeEdits,
  } = useAdminRLS();

  // Fetch all students
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

  // Fetch all fees for selected month/year
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

  // For history, fetch *all* fees per student
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

  // Map students/fees for CSV: merge rows
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
          )
            return false;
          if (filterStatus) {
            const status = row.fee
              ? (row.fee.status || "unpaid").toLowerCase()
              : "unpaid";
            return status === filterStatus.toLowerCase();
          }
          return true;
        })
    : [];

  return (
    <div>
      <AdminRLSBanner
        adminEmail={adminEmail}
        checkingAdminEntry={checkingAdminEntry}
        rlsError={rlsError}
        isAdminInTable={isAdminInTable}
      />
      {/* Debug: Show admin email and admin_users lookup for debugging */}
      <div className="mb-2 text-xs text-gray-400">
        <span>
          Session email: <b>{adminEmail || "none"}</b>
        </span>
        |{" "}
        <span>
          In admin_users?{" "}
          <b>
            {isAdminInTable === null
              ? "..."
              : isAdminInTable
              ? "✅"
              : "❌"}
          </b>
        </span>
      </div>
      {/* Suggest debugging steps if RLS errors persist */}
      {(rlsError || isAdminInTable === false) && (
        <div className="mb-2 p-2 text-sm rounded bg-orange-50 text-orange-700 border border-orange-300">
          <b>Still seeing "violates row-level security" errors?</b> <br />
          <ul className="list-disc ml-4">
            <li>
              Check <b>admin_users</b> table in Supabase and make sure your
              exact login email exists there.
            </li>
            <li>Double-check for any typos or extra spaces in the email.</li>
            <li>Try re-logging in to refresh the JWT.</li>
            <li>
              Review <b>public.rls_debug_log</b> for the actual email claim
              reaching Postgres.
            </li>
            <li>
              If still stuck: Try logging out, clearing localStorage/cookies,
              and re-login.
            </li>
          </ul>
        </div>
      )}
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
          if (!canSubmitFeeEdits()) {
            toast({
              title: "RLS Error",
              description:
                "Your admin email is not in admin_users; you cannot edit or add fees.",
              variant: "error",
            });
            return;
          }
          setEditStudent(student);
          setEditFee(fee);
          setModalOpen(true);
        }}
        onShowHistory={(student) => {
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
      <div className="mt-3 text-xs text-gray-600">
        <b>Having trouble saving fee?</b> Make sure you are signed in as an admin and your email exists in the{" "}
        <b>admin_users</b> table in Supabase.
        <br />
        <b>Common issues:</b>
        <ul className="inline-block ml-2 text-xs">
          <li>
            (1) You are not logged in, or session is expired (log out and retry)
          </li>
          <li>(2) Your email is not present in "admin_users" table</li>
          <li>(3) You are logging in with a typo in your email</li>
        </ul>
      </div>
    </div>
  );
}

// ---- Keep this PROP-BASED version ONLY ---- //
function AdminRLSBanner({
  adminEmail,
  checkingAdminEntry,
  rlsError,
  isAdminInTable,
}: {
  adminEmail: string | null;
  checkingAdminEntry: boolean;
  rlsError: string | null;
  isAdminInTable: boolean | null;
}) {
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
        <br />
        <span className="block text-xs mt-2">
          <b>⚠️ Important:</b>
          <br />
          You will NOT be able to save or update fees unless your email is present in the <b>admin_users</b> table. 
          <br />
          Please check in Supabase → <b>admin_users</b> and add your login email if needed.
        </span>
      </div>
    );
  }
  if (isAdminInTable === false) {
    return (
      <div className="p-2 bg-red-100 text-red-700 rounded mb-3 text-center font-bold">
        Your admin email is <b>not</b> in the admin_users table!
        <br />
        You cannot save or edit fees.
        <br />
        See Supabase → admin_users to add your email.
      </div>
    );
  }
  return null;
}
