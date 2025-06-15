
import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Edit, Plus } from "lucide-react";
import clsx from "clsx";
import { getFeeStatus, getStatusTextAndColor } from "@/utils/feeStatusUtils";

export default function FeesTable({
  students,
  fees,
  isLoading,
  onEditFee,
  onShowHistory
}: {
  students: any[];
  fees: any[];
  isLoading: boolean;
  onEditFee: (args: { student: any, fee?: any }) => void;
  onShowHistory: (student: any) => void;
}) {
  if (isLoading) return <div className="w-full py-10 flex items-center justify-center">Loading students & fees...</div>;
  if (!Array.isArray(students) || students.length === 0)
    return <div className="w-full py-10 text-center text-gray-400">No students found.</div>;
  const rows = students.map((student) => {
    const fee = fees?.find(f => f.student_id === student.id) || null;
    return { student, fee };
  });

  return (
    <div className="w-full">
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
              const status = fee ? getFeeStatus(fee) : "unpaid";
              const [statusText, statusClass] = getStatusTextAndColor(status);
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
