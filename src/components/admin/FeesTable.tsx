
import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Edit, Plus, History } from "lucide-react";
import clsx from "clsx";
import { getFeeStatus, getStatusTextAndColor } from "@/utils/feeStatusUtils";

export default function FeesTable({
  rows,
  isLoading,
  onEditFee,
  onShowHistory
}: {
  rows: { student: any; fee: any | null }[];
  isLoading: boolean;
  onEditFee: (args: { student: any, fee?: any }) => void;
  onShowHistory: (student: any) => void;
}) {
  if (isLoading) return (
    <div className="w-full py-10 flex items-center justify-center">Loading students & fees...</div>
  );
  if (!Array.isArray(rows) || rows.length === 0)
    return <div className="w-full py-10 text-center text-gray-400">No students found for the selected filters.</div>;

  return (
    <div className="w-full min-w-[540px] sm:min-w-[720px] md:min-w-[900px] overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden xs:table-cell">Program</TableHead>
            <TableHead>Month</TableHead>
            <TableHead>Fee</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ student, fee }) => {
            const status = fee ? getFeeStatus(fee) : "unpaid";
            const [statusText, statusClass] = getStatusTextAndColor(status);
            return (
              <TableRow key={student.id} className={clsx("transition-colors hover:bg-yellow-50/50", fee ? "" : "bg-gray-50/80")}>
                <TableCell>
                  <button
                    className="text-blue-700 underline text-sm font-bold hover-scale"
                    onClick={() => onShowHistory(student)}
                    title="Show payment history"
                  >
                    {student.name}
                  </button>
                </TableCell>
                <TableCell className="hidden xs:table-cell">{student.program}</TableCell>
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
                  <span className={clsx(
                    "rounded-full px-3 py-1 font-bold text-xs capitalize",
                    statusClass
                  )}>
                    {statusText}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => onShowHistory(student)}
                            title="Show payment history"
                        >
                            <History className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={fee ? "secondary" : "default"}
                            size="icon"
                            onClick={() => onEditFee({ student, fee })}
                            className="h-8 w-8 rounded-full"
                        >
                            {fee ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </Button>
                    </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
