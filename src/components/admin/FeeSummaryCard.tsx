
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeDollarSign, Clock, Ban } from "lucide-react";

export default function FeeSummaryCard({
  fees,
  loading
}: {
  fees: any[];
  loading: boolean;
}) {
  // Computed stats
  const paid = fees?.filter(f => f.status === "paid").reduce((a, f) => a + (f.paid_amount || 0), 0);
  const pending = fees?.filter(f => f.status === "partial").reduce((a, f) => a + (f.balance_due || 0), 0);
  const overdue = fees?.filter(f => (f.status === "unpaid" || !f.status)).reduce((a, f) => a + (f.balance_due || 0), 0);

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
          <span className="text-2xl font-bold">{loading ? "..." : `₹${paid || 0}`}</span>
        </CardContent>
      </Card>
      <Card className="shadow flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-yellow-700 text-base">
            <Clock className="w-5 h-5" />
            Pending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-bold">{loading ? "..." : `₹${pending || 0}`}</span>
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
          <span className="text-2xl font-bold">{loading ? "..." : `₹${overdue || 0}`}</span>
        </CardContent>
      </Card>
    </div>
  );
}
