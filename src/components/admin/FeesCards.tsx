import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Plus, History, IndianRupee } from 'lucide-react';
import clsx from 'clsx';
import { getFeeStatus, getStatusTextAndColor } from '@/utils/feeStatusUtils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import FeeReminderButton from './FeeReminderButton';

interface FeesCardsProps {
  rows: { student: any; fee: any | null }[];
  onEditFee: (args: { student: any; fee?: any }) => void;
  onShowHistory: (student: any) => void;
  bulkMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (studentId: string) => void;
  filterMonth: number;
  filterYear: number;
}

export default function FeesCards({
  rows,
  onEditFee,
  onShowHistory,
  bulkMode = false,
  selectedIds = new Set(),
  onToggleSelect,
  filterMonth,
  filterYear,
}: FeesCardsProps) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return (
      <div className="w-full py-12 text-center">
        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
          <IndianRupee className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">
          No students found for the selected filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {rows.map(({ student, fee }) => {
        const status = fee ? getFeeStatus(fee) : 'unpaid';
        const [statusText, statusClass] = getStatusTextAndColor(status);
        const isSelected = selectedIds.has(student.id);

        return (
          <Card
            key={student.id}
            className={clsx(
              'group rounded-xl sm:rounded-2xl bg-card border transition-all duration-300 overflow-hidden',
              bulkMode && isSelected
                ? 'border-primary ring-2 ring-primary/20 shadow-lg'
                : 'border-border/50 hover:border-primary/30 hover:shadow-lg',
              bulkMode && 'cursor-pointer'
            )}
            onClick={() => bulkMode && onToggleSelect?.(student.id)}
          >
            {/* Status indicator bar */}
            <div
              className={clsx(
                'h-1',
                status === 'paid' && 'bg-green-500',
                status === 'partial' && 'bg-amber-500',
                status === 'unpaid' && 'bg-red-500'
              )}
            />

            <CardContent className="p-3 sm:p-4 flex flex-col gap-3">
              {/* Header */}
              <div className="flex items-start gap-3">
                {bulkMode && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect?.(student.id)}
                    className="mt-1 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-offset-2 ring-primary/10 flex-shrink-0">
                  {student.profile_image_url ? (
                    <AvatarImage
                      src={student.profile_image_url}
                      alt={student.name}
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-sm">
                      {student.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-foreground truncate">
                    {student.name}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {student.program}
                  </p>
                </div>
                <span
                  className={clsx(
                    'shrink-0 rounded-full px-2 py-0.5 font-semibold text-[10px] sm:text-xs capitalize',
                    statusClass
                  )}
                >
                  {statusText}
                </span>
              </div>

              {/* Fee Details */}
              <div className="grid grid-cols-2 gap-2 p-2 sm:p-3 bg-muted/30 rounded-lg text-xs sm:text-sm">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-[10px] sm:text-xs">
                    Month
                  </span>
                  <span className="font-medium text-foreground">
                    {fee
                      ? `${String(fee.month).padStart(2, '0')}/${fee.year}`
                      : '-'}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-muted-foreground text-[10px] sm:text-xs">
                    Fee
                  </span>
                  <span className="font-medium text-foreground">
                    ₹{fee ? fee.monthly_fee : student.default_monthly_fee}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-[10px] sm:text-xs">
                    Paid
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {fee ? `₹${fee.paid_amount}` : '-'}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-muted-foreground text-[10px] sm:text-xs">
                    Balance
                  </span>
                  <span
                    className={clsx(
                      'font-medium',
                      fee?.balance_due > 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-foreground'
                    )}
                  >
                    {fee ? `₹${fee.balance_due}` : '-'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {!bulkMode && (
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 sm:h-9 text-xs rounded-lg"
                    onClick={() => onShowHistory(student)}
                  >
                    <History className="w-3.5 h-3.5 mr-1.5" />
                    History
                  </Button>
                  {status !== 'paid' && (
                    <FeeReminderButton
                      studentName={student.name}
                      parentName={student.parent_name || 'Parent'}
                      parentContact={student.parent_contact || ''}
                      amount={
                        fee ? fee.balance_due : student.default_monthly_fee
                      }
                      month={fee ? fee.month : filterMonth}
                      year={fee ? fee.year : filterYear}
                    />
                  )}
                  <Button
                    variant={fee ? 'secondary' : 'default'}
                    size="sm"
                    onClick={() => onEditFee({ student, fee })}
                    className="flex-1 h-8 sm:h-9 text-xs rounded-lg"
                  >
                    {fee ? (
                      <>
                        <Edit className="w-3.5 h-3.5 mr-1.5" />
                        Edit
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
