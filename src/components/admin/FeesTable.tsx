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
  Trash2,
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
  onDeleteFee,
}: {
  rows: {
    student: any;
    fee: any | null;
    programName: string;
    rowKey: string;
    expectedMonthlyFee: number;
  }[];
  isLoading: boolean;
  onEditFee: (args: { student: any; fee?: any; programName: string }) => void;
  onShowHistory: (student: any) => void;
  onDeleteFee?: (args: { fee: any; student: any; programName: string }) => void;
}) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-sm border border-border/70 overflow-hidden">
        <div className="py-16 flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="animate-spin h-12 w-12 border-4 border-green-200 border-t-green-600 rounded-full"></div>
            <div className="absolute inset-0 h-12 w-12 border-4 border-green-100 rounded-full opacity-20"></div>
          </div>
          <p className="text-muted-foreground font-medium">Loading fees data...</p>
        </div>
      </div>
    );
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return (
      <div className="bg-card rounded-2xl shadow-sm border border-border/70 overflow-hidden">
        <div className="py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No fee records found
          </h3>
          <p className="text-muted-foreground">
            No students match the selected filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border/70 overflow-hidden">
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow>
            <TableHead>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Student Name
              </div>
            </TableHead>
            <TableHead className="hidden md:table-cell">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                Program
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Month/Year
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
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
          {rows.map(({ student, fee, programName, rowKey, expectedMonthlyFee }) => {
            const status = fee ? getFeeStatus(fee) : 'unpaid';
            const [statusText, statusClass] = getStatusTextAndColor(status);
            return (
              <TableRow
                key={rowKey}
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
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-2 py-1 text-[11px] font-semibold text-blue-700 sm:text-xs">
                    {programName}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-foreground">
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
                      : expectedMonthlyFee.toLocaleString()}
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
                      'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide sm:px-3 sm:text-xs',
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
                      className="h-8 w-8 rounded-lg border-border transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 group/btn sm:h-9 sm:w-9"
                      onClick={() => onShowHistory(student)}
                      title="Show payment history"
                    >
                      <History className="w-4 h-4 text-muted-foreground group-hover/btn:text-blue-600" />
                    </Button>
                    <Button
                      variant={fee ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => onEditFee({ student, fee, programName })}
                      className={clsx(
                        'h-8 w-8 rounded-lg transition-all duration-200 group/btn sm:h-9 sm:w-9',
                        fee
                          ? 'border-border hover:border-amber-300 hover:bg-amber-50'
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg'
                      )}
                    >
                      {fee ? (
                        <Edit className="w-4 h-4 text-muted-foreground group-hover/btn:text-amber-600" />
                      ) : (
                        <Plus className="w-4 h-4 text-white" />
                      )}
                    </Button>
                    {fee ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteFee?.({ fee, student, programName })}
                        className="h-8 w-8 rounded-lg transition-all duration-200 sm:h-9 sm:w-9"
                        title="Delete fee record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    ) : null}
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
