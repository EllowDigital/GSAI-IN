import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Plus, History } from 'lucide-react';
import clsx from 'clsx';
import { getFeeStatus, getStatusTextAndColor } from '@/utils/feeStatusUtils';

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
      {rows.map(({ student, fee }) => {
        const status = fee ? getFeeStatus(fee) : 'unpaid';
        const [statusText, statusClass] = getStatusTextAndColor(status);
        return (
          <Card
            key={student.id}
            className="rounded-xl shadow-lg bg-white p-3 hover:shadow-xl transition-shadow duration-200"
          >
            <CardContent className="p-0 flex flex-col gap-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-base text-gray-800 truncate">
                    {student.name}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {student.program}
                  </p>
                </div>
                <span
                  className={clsx(
                    'rounded-full px-2 py-0.5 font-bold text-[11px] capitalize self-start whitespace-nowrap',
                    statusClass
                  )}
                >
                  {statusText}
                </span>
              </div>
              <div className="text-xs space-y-1 text-gray-600 border-t pt-2">
                <div className="flex justify-between">
                  <strong>Month:</strong>
                  <span>
                    {fee
                      ? `${String(fee.month).padStart(2, '0')}/${fee.year}`
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <strong>Fee:</strong>
                  <span>
                    ₹{fee ? fee.monthly_fee : student.default_monthly_fee}
                  </span>
                </div>
                <div className="flex justify-between">
                  <strong>Paid:</strong>
                  <span>{fee ? `₹${fee.paid_amount}` : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <strong>Balance:</strong>
                  <span>{fee ? `₹${fee.balance_due}` : '-'}</span>
                </div>
              </div>
              <div className="flex justify-between items-center gap-2 border-t pt-2 mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-full text-xs px-2 py-1 h-8"
                  onClick={() => onShowHistory(student)}
                >
                  <History className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">History</span>
                  <span className="inline sm:hidden">Hist</span>
                </Button>
                <Button
                  variant={fee ? 'secondary' : 'default'}
                  size="sm"
                  onClick={() => onEditFee({ student, fee })}
                  className="flex-1 rounded-full text-xs px-2 py-1 h-8"
                >
                  {fee ? (
                    <>
                      <Edit className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Edit</span>
                      <span className="inline sm:hidden">Edit</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Add</span>
                      <span className="inline sm:hidden">Add</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
