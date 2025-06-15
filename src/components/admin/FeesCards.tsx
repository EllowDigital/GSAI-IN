
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Plus, History } from "lucide-react";
import clsx from "clsx";
import { getFeeStatus, getStatusTextAndColor } from "@/utils/feeStatusUtils";

export default function FeesCards({
  rows,
  onEditFee,
  onShowHistory,
}: {
  rows: { student: any; fee: any | null }[];
  onEditFee: (args: { student: any; fee?: any }) => void;
  onShowHistory: (student: any) => void;
}) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return (
      <div className="w-full py-10 text-center text-gray-400">
        No students found for the selected filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
      {rows.map(({ student, fee }) => {
        const status = fee ? getFeeStatus(fee) : "unpaid";
        const [statusText, statusClass] = getStatusTextAndColor(status);
        return (
          <Card key={student.id} className="rounded-xl shadow-lg bg-white p-3">
            <CardContent className="p-0 flex flex-col gap-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <h4 className="font-bold text-base text-gray-800">{student.name}</h4>
                  <p className="text-xs text-gray-500">{student.program}</p>
                </div>
                <span className={clsx("rounded-full px-2 py-0.5 font-bold text-[11px] capitalize self-start", statusClass)}>
                  {statusText}
                </span>
              </div>
              <div className="text-xs space-y-1 text-gray-600 border-t pt-2">
                <p><strong>Month:</strong> {fee ? `${String(fee.month).padStart(2, "0")}/${fee.year}` : "-"}</p>
                <p><strong>Fee:</strong> ₹{fee ? fee.monthly_fee : student.default_monthly_fee}</p>
                <p><strong>Paid:</strong> {fee ? `₹${fee.paid_amount}` : "-"}</p>
                <p><strong>Balance:</strong> {fee ? `₹${fee.balance_due}` : "-"}</p>
              </div>
              <div className="flex justify-end items-center gap-2 border-t pt-2 mt-1">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-full text-xs"
                    onClick={() => onShowHistory(student)}
                >
                    <History className="w-3 h-3 mr-1" /> History
                </Button>
                <Button
                  variant={fee ? "secondary" : "default"}
                  size="sm"
                  onClick={() => onEditFee({ student, fee })}
                  className="flex-1 rounded-full text-xs"
                >
                  {fee ? <><Edit className="w-3 h-3 mr-1" /> Edit</> : <><Plus className="w-3 h-3 mr-1" /> Add</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
