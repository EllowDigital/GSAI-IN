
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Search, Edit, Plus } from "lucide-react";
import clsx from "clsx";

function getStatusTextAndColor(status: string) {
  switch (status) {
    case "paid":
    case "Paid":
      return ["Paid", "bg-green-100 text-green-700"];
    case "partial":
    case "Partial":
      return ["Partial", "bg-yellow-100 text-yellow-700"];
    case "unpaid":
    case "Unpaid":
    default:
      return ["Unpaid", "bg-red-100 text-red-700"];
  }
}

export default function FeesTable({
  students,
  fees,
  isLoading,
  filterMonth,
  filterYear,
  filterStatus,
  filterName,
  setFilterMonth,
  setFilterYear,
  setFilterStatus,
  setFilterName,
  onEditFee,
  onShowHistory
}: {
  students: any[];
  fees: any[];
  isLoading: boolean;
  filterMonth: number;
  filterYear: number;
  filterStatus: string;
  filterName: string;
  setFilterMonth: (n: number) => void;
  setFilterYear: (n: number) => void;
  setFilterStatus: (v: string) => void;
  setFilterName: (v: string) => void;
  onEditFee: (args: { student: any, fee?: any }) => void;
  onShowHistory: (student: any) => void;
}) {
  // Defensive: loading or no data
  if (isLoading) {
    return <div className="w-full py-10 flex items-center justify-center">Loading students & fees...</div>;
  }
  if (!Array.isArray(students) || students.length === 0) {
    return <div className="w-full py-10 text-center text-gray-400">No students found.</div>;
  }
  // Map: For current month, merge fees into student rows
  const rows = students.map((student) => {
    const fee = fees?.find(f => f.student_id === student.id) || null;
    return { student, fee };
  }).filter(row => {
    if (filterName && !row.student.name.toLowerCase().includes(filterName.toLowerCase())) return false;
    if (filterStatus) {
      const status = row.fee ? (row.fee.status || "unpaid").toLowerCase() : "unpaid";
      return status === filterStatus.toLowerCase();
    }
    return true;
  });

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search student name..."
            value={filterName}
            onChange={e => setFilterName(e.target.value)}
            className="pl-8"
          />
        </div>
        <Input
          type="number"
          value={filterMonth}
          min={1}
          max={12}
          onChange={e => setFilterMonth(Number(e.target.value))}
          className="w-20"
          placeholder="Month"
        />
        <Input
          type="number"
          value={filterYear}
          min={2020}
          max={2100}
          onChange={e => setFilterYear(Number(e.target.value))}
          className="w-28"
          placeholder="Year"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border px-3 py-2 rounded text-sm"
        >
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>
      {/* Table */}
      <div className="rounded-2xl shadow-lg overflow-x-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ student, fee }) => {
              const [statusText, statusClass] = getStatusTextAndColor(
                fee ? fee.status : "unpaid"
              );
              return (
                <TableRow key={student.id} className={clsx(fee ? "" : "bg-gray-50")}>
                  <TableCell>
                    <button
                      className="text-blue-700 underline text-sm font-bold"
                      onClick={() => onShowHistory(student)}
                      title="Show payment history"
                    >
                      {student.name}
                    </button>
                  </TableCell>
                  <TableCell>{student.program}</TableCell>
                  <TableCell>
                    {fee
                      ? `${fee.month.toString().padStart(2, "0")}/${fee.year}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    ₹{fee ? fee.monthly_fee : student.default_monthly_fee}
                  </TableCell>
                  <TableCell>
                    {fee ? `₹${fee.paid_amount}` : "-"}
                  </TableCell>
                  <TableCell>
                    {fee ? `₹${fee.balance_due}` : "-"}
                  </TableCell>
                  <TableCell>
                    <span className={clsx("rounded-full px-3 py-1 font-bold text-xs capitalize", statusClass)}>
                      {statusText}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={fee ? "secondary" : "default"}
                      size="sm"
                      onClick={() => onEditFee({ student, fee })}
                      className="flex items-center gap-1"
                    >
                      {fee ? <>
                        <Edit className="w-4 h-4" /> Edit
                      </> : <>
                        <Plus className="w-4 h-4" /> Add
                      </>}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
