
import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import FeeModal from "./FeeModal";

// Helper: status color
function getStatusColor(status: string) {
  return status === "paid"
    ? "bg-green-100 text-green-800"
    : status === "partial"
    ? "bg-orange-100 text-orange-700"
    : "bg-red-100 text-red-700";
}

// Helper: determine status based on paid and fee
function calcStatus(monthly_fee: number, paid_amount: number) {
  if (paid_amount >= monthly_fee) return "paid";
  if (paid_amount > 0 && paid_amount < monthly_fee) return "partial";
  return "unpaid";
}

// Helper: find the latest fee object for a student, for balance carry-over
function getLatestMonthFeeRecord(feesArr, studentId, currentYear, currentMonth) {
  if (!Array.isArray(feesArr)) return null;
  // find latest fee before selected [year, month]
  const sorted = feesArr
    .filter(
      (f) =>
        f.student_id === studentId &&
        (f.year < currentYear ||
          (f.year === currentYear && f.month < currentMonth))
    )
    .sort((a, b) =>
      a.year !== b.year
        ? b.year - a.year
        : b.month - a.month
    );
  return sorted.length > 0 ? sorted[0] : null;
}

export default function FeeTable({
  fees,
  students,
  isLoading,
}: {
  fees: any[] | undefined;
  students: any[] | undefined;
  isLoading: boolean;
}) {
  // DEBUG LOGS to help track rendering
  console.log("[FeeTable] fees:", fees);
  console.log("[FeeTable] students:", students);
  console.log("[FeeTable] isLoading:", isLoading);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalFee, setModalFee] = useState<any>(null);
  const [modalStudent, setModalStudent] = useState<any>(null);
  const [modalMonth, setModalMonth] = useState<number | null>(null);
  const [modalYear, setModalYear] = useState<number | null>(null);

  const [month, setMonth] = useState<string>(
    (new Date().getMonth() + 1).toString()
  );
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // Defensive: show loading spinner until both arrays are loaded
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 w-full">
        <Loader2 className="animate-spin text-yellow-500" />
        <span className="ml-3 text-gray-600">
          Loading students and fees...
        </span>
      </div>
    );
  }
  // Defensive: show visible error if students fail to load
  if (!Array.isArray(students) || students.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10 w-full">
        No students available. Add students before managing fees.
      </div>
    );
  }
  // Defensive: if fees is undefined/errored show visible notice
  if (!Array.isArray(fees)) {
    return (
      <div className="text-center text-gray-500 py-10 w-full">
        Fees data could not be loaded.<br />
        Please check your connection or try reloading.<br />
        <span className="mt-2 block text-xs text-red-400">If the issue persists, check for errors in the browser console.</span>
      </div>
    );
  }

  // Assemble rows: one for each student for the selected month/year, either from fee record or as a blank/new row
  const allRows = useMemo(() => {
    const selectedMonth = Number(month);
    const selectedYear = Number(year);

    // If fees not loaded or empty, just all students
    const result = students.map((stu) => {
      // Find a fee entry for this student for this month/year
      const feeRec =
        Array.isArray(fees) && fees.length > 0
          ? fees.find(
              (f) =>
                f.student_id === stu.id &&
                f.month === selectedMonth &&
                f.year === selectedYear
            )
          : null;

      // Carry-forward: get previous unpaid balance (from prev month)
      let previousFeeRec = getLatestMonthFeeRecord(
        fees,
        stu.id,
        selectedYear,
        selectedMonth
      );
      const carryForward =
        previousFeeRec && previousFeeRec.status !== "paid"
          ? previousFeeRec.balance_due
          : 0;

      return {
        student: stu,
        fee: feeRec,
        carryForward,
      };
    });
    // filter by search
    const filtered = result.filter((r) => {
      if (
        search &&
        !(r.student.name || "").toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      if (status && r.fee && r.fee.status !== status) return false;
      if (status && !r.fee && status !== "unpaid") return false;
      return true;
    });
    return filtered;
  }, [fees, students, month, year, search, status]);

  // For summary (collected, pending, overdue)
  const summary = useMemo(() => {
    let collected = 0,
      pending = 0,
      overdue = 0;
    if (!Array.isArray(fees)) return { collected, pending, overdue };
    fees.forEach((f) => {
      if (f.status === "paid") collected += f.paid_amount;
      else if (f.status === "partial") pending += f.balance_due;
      else overdue += f.balance_due;
    });
    return { collected, pending, overdue };
  }, [fees]);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-2 md:items-end mb-4">
        <div className="relative w-full md:w-56">
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <Search className="w-4 h-4" />
          </span>
          <Input
            placeholder="Search student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Input
          placeholder="Month"
          type="number"
          min={1}
          max={12}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full md:w-32"
        />
        <Input
          placeholder="Year"
          type="number"
          min={2020}
          max={2100}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full md:w-32"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border px-3 py-1 rounded bg-gray-50 text-sm w-full md:w-40"
        >
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>
      {/* Summary */}
      <div className="flex gap-6 mb-2">
        <div className="text-green-700 font-bold">
          Collected: ₹{summary.collected}
        </div>
        <div className="text-orange-700 font-bold">
          Pending: ₹{summary.pending}
        </div>
        <div className="text-red-700 font-bold">
          Overdue: ₹{summary.overdue}
        </div>
      </div>
      <div className="overflow-auto rounded-2xl shadow-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Monthly Fee</TableHead>
              <TableHead>Prev Balance</TableHead>
              <TableHead>Paid Amount</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-gray-500 py-10">
                  No fee data found for selected filters.
                </TableCell>
              </TableRow>
            ) : (
              allRows.map(({ student, fee, carryForward }) => (
                <TableRow key={student.id} className={fee ? getStatusColor(fee.status) : ""}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.program}</TableCell>
                  <TableCell>{month}</TableCell>
                  <TableCell>{year}</TableCell>
                  <TableCell>
                    {fee ? <>₹{fee.monthly_fee}</> : <>₹{student.default_monthly_fee}</>}
                  </TableCell>
                  <TableCell>
                    ₹{carryForward}
                  </TableCell>
                  <TableCell>
                    {fee ? <>₹{fee.paid_amount}</> : <>-</>}
                  </TableCell>
                  <TableCell>
                    {fee ? <>₹{fee.balance_due}</> : <>-</>}
                  </TableCell>
                  <TableCell>
                    <span className="rounded-full px-3 py-1 font-bold text-xs capitalize">
                      {fee
                        ? fee.status
                        : carryForward > 0
                        ? "unpaid"
                        : "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={fee ? "secondary" : "default"}
                      size="sm"
                      onClick={() => {
                        setModalFee(fee);
                        setModalStudent(student);
                        setModalMonth(Number(month));
                        setModalYear(Number(year));
                        setModalOpen(true);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      {fee ? "Edit" : "Add"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Modal for editing/adding */}
      <FeeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fee={modalFee}
        student={modalStudent}
        month={modalMonth}
        year={modalYear}
        carryForwardBalance={
          modalStudent && allRows.find(r => r.student.id === modalStudent.id)?.carryForward
        }
      />
    </div>
  );
}
