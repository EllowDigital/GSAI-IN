import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export default function FeeHistoryDrawer({
  open,
  onClose,
  student,
  allFees,
}: {
  open: boolean;
  onClose: () => void;
  student: any;
  allFees: any[];
}) {
  // Filter fees for this student, sort by year+month desc
  const rows = (allFees || [])
    .filter((f) => f.student_id === student?.id)
    .sort((a, b) => (b.year !== a.year ? b.year - a.year : b.month - a.month));
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fee History - {student?.name}</DialogTitle>
        </DialogHeader>
        <div className="text-xs text-gray-500 mb-2">
          Each row shows a month's fee. Recent first.
        </div>
        <div className="max-h-[400px] overflow-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-400">
                    No payment history.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell>
                      {fee.month.toString().padStart(2, '0')}
                    </TableCell>
                    <TableCell>{fee.year}</TableCell>
                    <TableCell>₹{fee.monthly_fee}</TableCell>
                    <TableCell>₹{fee.paid_amount}</TableCell>
                    <TableCell>₹{fee.balance_due}</TableCell>
                    <TableCell>
                      <span
                        className={
                          fee.status === 'paid'
                            ? 'bg-green-100 text-green-700 px-2 rounded-full'
                            : fee.status === 'partial'
                              ? 'bg-yellow-100 text-yellow-700 px-2 rounded-full'
                              : 'bg-red-100 text-red-700 px-2 rounded-full'
                        }
                      >
                        {fee.status?.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {fee.receipt_url ? (
                        <a
                          href={fee.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 underline text-xs"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate">
                      {fee.notes ?? ''}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
