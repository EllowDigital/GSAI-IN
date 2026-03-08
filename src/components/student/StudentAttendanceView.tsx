import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useStudentAuth } from '@/pages/student/StudentAuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const STATUS_DISPLAY: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  present: { label: 'Present', icon: '✅', color: 'text-green-600' },
  absent: { label: 'Absent', icon: '❌', color: 'text-red-600' },
  late: { label: 'Late', icon: '⏰', color: 'text-yellow-600' },
  half_day: { label: 'Half Day', icon: '🌗', color: 'text-orange-600' },
  holiday: { label: 'Holiday', icon: '🏖️', color: 'text-blue-600' },
};

export default function StudentAttendanceView() {
  const { profile } = useStudentAuth();
  const [monthOffset, setMonthOffset] = useState(0);

  const currentMonth = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: [
      'student-attendance',
      profile?.studentId,
      format(currentMonth, 'yyyy-MM'),
    ],
    queryFn: async () => {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      const { data, error } = await (supabase
        .from('attendance' as any)
        .select('*')
        .eq('student_id', profile!.studentId)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: false }) as any);
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.studentId,
  });

  const stats = useMemo(() => {
    let present = 0,
      absent = 0,
      late = 0,
      total = (attendance as any[]).length;
    (attendance as any[]).forEach((a: any) => {
      if (a.status === 'present' || a.status === 'half_day') present++;
      if (a.status === 'absent') absent++;
      if (a.status === 'late') {
        late++;
        present++;
      }
    });
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, late, total, pct };
  }, [attendance]);

  if (isLoading)
    return (
      <div className="flex justify-center py-8">
        <Spinner size={20} />
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <CalendarCheck className="w-4 h-4" /> Attendance —{' '}
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setMonthOffset((m) => m - 1)}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={() => setMonthOffset(0)}
          >
            Current
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setMonthOffset((m) => m + 1)}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="border-green-500/20">
          <CardContent className="p-2.5 text-center">
            <p className="text-lg font-bold text-green-600">{stats.present}</p>
            <p className="text-[10px] text-muted-foreground">Present</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/20">
          <CardContent className="p-2.5 text-center">
            <p className="text-lg font-bold text-red-600">{stats.absent}</p>
            <p className="text-[10px] text-muted-foreground">Absent</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/20">
          <CardContent className="p-2.5 text-center">
            <p className="text-lg font-bold text-yellow-600">{stats.late}</p>
            <p className="text-[10px] text-muted-foreground">Late</p>
          </CardContent>
        </Card>
        <Card
          className={
            stats.pct >= 75
              ? 'border-green-500/20'
              : stats.pct >= 50
                ? 'border-yellow-500/20'
                : 'border-red-500/20'
          }
        >
          <CardContent className="p-2.5 text-center">
            <p
              className={`text-lg font-bold ${stats.pct >= 75 ? 'text-green-600' : stats.pct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}
            >
              {stats.pct}%
            </p>
            <p className="text-[10px] text-muted-foreground">Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Records */}
      {(attendance as any[]).length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-6">
          No attendance records for this month.
        </p>
      ) : (
        <div className="space-y-2">
          {(attendance as any[]).map((record: any) => {
            const statusInfo =
              STATUS_DISPLAY[record.status] || STATUS_DISPLAY.present;
            return (
              <Card key={record.id} className="border border-border">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {format(new Date(record.date), 'EEE, MMM d')}
                    </p>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                      {record.check_in_time && (
                        <span>
                          In: {format(new Date(record.check_in_time), 'h:mm a')}
                        </span>
                      )}
                      {record.check_out_time && (
                        <span>
                          Out:{' '}
                          {format(new Date(record.check_out_time), 'h:mm a')}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${statusInfo.color}`}
                  >
                    {statusInfo.icon} {statusInfo.label}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
