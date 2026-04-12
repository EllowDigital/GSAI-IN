import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, History, Plus, Trash2 } from 'lucide-react';
import { getFeeStatus, getStatusTextAndColor } from '@/utils/feeStatusUtils';
import FeeReminderButton from './FeeReminderButton';

type FeeRow = {
  student: any;
  fee: any | null;
  reminderEmail?: string | null;
  programName: string;
  rowKey: string;
  expectedMonthlyFee: number;
};

interface FeesGroupedCardsProps {
  rows: FeeRow[];
  onEditFee: (args: { student: any; fee?: any; programName: string }) => void;
  onShowHistory: (student: any) => void;
  onDeleteFee: (args: { fee: any; student: any; programName: string }) => void;
  filterMonth: number;
  filterYear: number;
}

export default function FeesGroupedCards({
  rows,
  onEditFee,
  onShowHistory,
  onDeleteFee,
  filterMonth,
  filterYear,
}: FeesGroupedCardsProps) {
  const grouped = rows.reduce(
    (acc, row) => {
      const studentId = row.student.id;
      if (!acc[studentId]) {
        acc[studentId] = {
          student: row.student,
          reminderEmail: row.reminderEmail,
          rows: [],
        };
      }
      acc[studentId].rows.push(row);
      return acc;
    },
    {} as Record<
      string,
      { student: any; reminderEmail?: string | null; rows: FeeRow[] }
    >
  );

  const groups = Object.values(grouped);

  if (groups.length === 0) {
    return (
      <div className="w-full py-12 text-center text-muted-foreground">
        No students found for the selected filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <Card
          key={group.student.id}
          className="border border-border/70 bg-gradient-to-br from-card to-muted/20"
        >
          <CardContent className="p-3 sm:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-10 w-10 ring-1 ring-primary/20">
                  {group.student.profile_image_url ? (
                    <AvatarImage
                      src={group.student.profile_image_url}
                      alt={group.student.name}
                    />
                  ) : (
                    <AvatarFallback>
                      {group.student.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{group.student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {group.rows.length} program fee row
                    {group.rows.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full sm:w-auto"
                onClick={() => onShowHistory(group.student)}
              >
                <History className="w-3.5 h-3.5 mr-1.5" />
                History
              </Button>
            </div>

            <div className="space-y-2">
              {group.rows.map((row) => {
                const status = row.fee ? getFeeStatus(row.fee) : 'unpaid';
                const [statusText, statusClass] = getStatusTextAndColor(status);
                const monthYear = row.fee
                  ? `${String(row.fee.month).padStart(2, '0')}/${row.fee.year}`
                  : `${String(filterMonth).padStart(2, '0')}/${filterYear}`;

                return (
                  <div
                    key={row.rowKey}
                    className="rounded-lg border border-border/70 p-3 bg-background/70"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {row.programName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {monthYear}
                        </p>
                      </div>
                      <Badge variant="secondary" className={statusClass}>
                        {statusText}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Fee</p>
                        <p className="font-medium">
                          ₹
                          {row.fee
                            ? row.fee.monthly_fee
                            : row.expectedMonthlyFee}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Paid</p>
                        <p className="font-medium text-green-600">
                          ₹{row.fee ? row.fee.paid_amount : 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Balance</p>
                        <p className="font-medium text-destructive">
                          ₹
                          {row.fee
                            ? row.fee.balance_due
                            : row.expectedMonthlyFee}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                      {status !== 'paid' ? (
                        <FeeReminderButton
                          studentName={row.student.name}
                          parentName={row.student.parent_name || 'Parent'}
                          parentContact={row.student.parent_contact || ''}
                          studentEmail={row.reminderEmail || ''}
                          parentEmail={row.student.parent_email || ''}
                          amount={
                            row.fee
                              ? row.fee.balance_due
                              : row.expectedMonthlyFee
                          }
                          month={row.fee ? row.fee.month : filterMonth}
                          year={row.fee ? row.fee.year : filterYear}
                        />
                      ) : (
                        <div className="hidden sm:block" />
                      )}

                      <Button
                        size="sm"
                        variant={row.fee ? 'secondary' : 'default'}
                        className="h-8"
                        onClick={() =>
                          onEditFee({
                            student: row.student,
                            fee: row.fee || undefined,
                            programName: row.programName,
                          })
                        }
                      >
                        {row.fee ? (
                          <>
                            <Edit className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Add
                          </>
                        )}
                      </Button>

                      {row.fee ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8"
                          onClick={() =>
                            onDeleteFee({
                              fee: row.fee,
                              student: row.student,
                              programName: row.programName,
                            })
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Delete
                        </Button>
                      ) : (
                        <div className="hidden sm:block" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
