import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeDollarSign, Clock, Ban } from 'lucide-react';
import { summarizeFees } from '@/utils/feeStatusUtils';

export default function FeeSummaryCard({
  fees,
  loading,
}: {
  fees: any[];
  loading: boolean;
}) {
  const summary = summarizeFees(fees || []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
      <Card className="relative overflow-hidden border-green-200/70 bg-gradient-to-br from-green-50/70 via-card to-card shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-green-500" />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-green-700 text-sm sm:text-base">
            <BadgeDollarSign className="w-5 h-5" />
            Paid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
            {loading ? '...' : `₹${summary.paidAmount.toLocaleString('en-IN')}`}
          </span>
          <div className="text-xs text-green-900 mt-1">
            {loading ? '' : `${summary.paidCount} payment(s)`}
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-amber-200/70 bg-gradient-to-br from-amber-50/70 via-card to-card shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-amber-500" />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-amber-700 text-sm sm:text-base">
            <Clock className="w-5 h-5" />
            Partial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
            {loading ? '...' : `₹${summary.partialAmount.toLocaleString('en-IN')}`}
          </span>
          <div className="text-xs text-amber-900 mt-1">
            {loading ? '' : `${summary.partialCount} partial`}
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-rose-200/70 bg-gradient-to-br from-rose-50/70 via-card to-card shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-rose-500" />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-rose-700 text-sm sm:text-base">
            <Ban className="w-5 h-5" />
            Overdue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
            {loading ? '...' : `₹${summary.overdueAmount.toLocaleString('en-IN')}`}
          </span>
          <div className="text-xs text-rose-900 mt-1">
            {loading ? '' : `${summary.overdueCount} overdue`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
