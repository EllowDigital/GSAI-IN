import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Edit,
  Plus,
  History,
  DollarSign,
  Calendar,
  User,
  GraduationCap,
} from 'lucide-react';
import clsx from 'clsx';
import { getFeeStatus, getStatusTextAndColor } from '@/utils/feeStatusUtils';

export default function FeesTable({
  rows,
  isLoading,
  onEditFee,
  onShowHistory,
}: {
  rows: { student: any; fee: any | null }[];
  isLoading: boolean;
  onEditFee: (args: { student: any; fee?: any }) => void;
  onShowHistory: (student: any) => void;
}) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
        <div className="py-16 flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="animate-spin h-12 w-12 border-4 border-green-200 border-t-green-600 rounded-full"></div>
            <div className="absolute inset-0 h-12 w-12 border-4 border-green-100 rounded-full opacity-20"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading fees data...</p>
        </div>
      </div>
    );
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
        <div className="py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-600 mb-2">
            No fee records found
          </h3>
          <p className="text-slate-500">
            No students match the selected filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow>
            <TableHead>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                Student Name
              </div>
            </TableHead>
            <TableHead className="hidden md:table-cell">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-slate-500" />
                Program
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                Month/Year
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-500" />
                Monthly Fee
              </div>
            </TableHead>
            <TableHead>Paid Amount</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ student, fee }) => {
            const status = fee ? getFeeStatus(fee) : 'unpaid';
            const [statusText, statusClass] = getStatusTextAndColor(status);
            return (
              <TableRow
                key={student.id}
                className={clsx(
                  'group transition-all duration-200',
                  'hover:bg-gradient-to-r hover:from-green-50/30 hover:to-emerald-50/20',
                  fee ? 'bg-white' : 'bg-amber-50/30'
                )}
              >
                <TableCell>
                  <button
                    className="text-blue-700 font-bold text-sm hover:text-blue-800 hover:underline transition-all duration-200 hover:scale-105"
                    onClick={() => onShowHistory(student)}
                    title="Show payment history"
                  >
                    {student.name}
                  </button>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700">
                    {student.program}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-slate-700">
                      {fee
                        ? `${fee.month.toString().padStart(2, '0')}/${fee.year}`
                        : '--'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-bold text-green-700">
                    ₹
                    {fee
                      ? fee.monthly_fee.toLocaleString()
                      : student.default_monthly_fee.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-blue-700">
                    {fee ? `₹${fee.paid_amount.toLocaleString()}` : '--'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-amber-700">
                    {fee ? `₹${fee.balance_due.toLocaleString()}` : '--'}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={clsx(
                      'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide',
                      statusClass
                    )}
                  >
                    {statusText}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 rounded-xl border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group/btn"
                      onClick={() => onShowHistory(student)}
                      title="Show payment history"
                    >
                      <History className="w-4 h-4 text-slate-600 group-hover/btn:text-blue-600" />
                    </Button>
                    <Button
                      variant={fee ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => onEditFee({ student, fee })}
                      className={clsx(
                        'h-9 w-9 rounded-xl transition-all duration-200 group/btn',
                        fee
                          ? 'border-slate-200 hover:border-amber-300 hover:bg-amber-50'
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg'
                      )}
                    >
                      {fee ? (
                        <Edit className="w-4 h-4 text-slate-600 group-hover/btn:text-amber-600" />
                      ) : (
                        <Plus className="w-4 h-4 text-white" />
                      )}
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
