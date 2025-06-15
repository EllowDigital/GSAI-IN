
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeDollarSign, Clock, Ban } from "lucide-react";
import { summarizeFees } from "@/utils/feeStatusUtils";

export default function FeeSummaryCard({
  fees,
  loading
}: {
  fees: any[];
  loading: boolean;
}) {
  const summary = summarizeFees(fees || []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
      <Card className="shadow flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-green-700 text-base">
            <BadgeDollarSign className="w-5 h-5" />
            Paid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-bold">{loading ? "..." : `₹${summary.paidAmount}`}</span>
          <div className="text-xs text-green-900">{loading ? "" : `${summary.paidCount} payment(s)`}</div>
        </CardContent>
      </Card>
      <Card className="shadow flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-yellow-700 text-base">
            <Clock className="w-5 h-5" />
            Partial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-bold">{loading ? "..." : `₹${summary.partialAmount}`}</span>
          <div className="text-xs text-yellow-900">{loading ? "" : `${summary.partialCount} partial`}</div>
        </CardContent>
      </Card>
      <Card className="shadow flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-red-700 text-base">
            <Ban className="w-5 h-5" />
            Overdue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-bold">{loading ? "..." : `₹${summary.overdueAmount}`}</span>
          <div className="text-xs text-red-900">{loading ? "" : `${summary.overdueCount} overdue`}</div>
        </CardContent>
      </Card>
    </div>
  );
}
