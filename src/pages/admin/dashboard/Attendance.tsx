import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import Spinner from '@/components/ui/spinner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth } from 'date-fns';
import { CalendarCheck, ChevronLeft, ChevronRight, Check, X, Clock, UserCheck, Users, Search, Sun } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present', icon: '✅', color: 'bg-green-500/10 text-green-600' },
  { value: 'absent', label: 'Absent', icon: '❌', color: 'bg-red-500/10 text-red-600' },
  { value: 'late', label: 'Late', icon: '⏰', color: 'bg-yellow-500/10 text-yellow-600' },
  { value: 'half_day', label: 'Half Day', icon: '🌗', color: 'bg-orange-500/10 text-orange-600' },
  { value: 'holiday', label: 'Holiday', icon: '🏖️', color: 'bg-blue-500/10 text-blue-600' },
];

export default function AttendanceManager() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState('');
  const [monthOffset, setMonthOffset] = useState(0);

  const currentMonth = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  // Fetch students
  const { data: students = [] } = useQuery({
    queryKey: ['attendance-students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, program, profile_image_url')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch attendance for selected date
  const { data: dayAttendance = [], isLoading: dayLoading } = useQuery({
    queryKey: ['attendance-day', selectedDate],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('attendance' as any)
        .select('*')
        .eq('date', selectedDate) as any);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch monthly attendance for report
  const { data: monthAttendance = [] } = useQuery({
    queryKey: ['attendance-month', format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      const { data, error } = await (supabase
        .from('attendance' as any)
        .select('*')
        .gte('date', start)
        .lte('date', end) as any);
      if (error) throw error;
      return data || [];
    },
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: string; status: string }) => {
      const existing = (dayAttendance as any[]).find((a: any) => a.student_id === studentId);
      if (existing) {
        const { error } = await (supabase
          .from('attendance' as any)
          .update({ status, check_in_time: status !== 'absent' ? new Date().toISOString() : null } as any)
          .eq('id', existing.id) as any);
        if (error) throw error;
      } else {
        const { error } = await (supabase
          .from('attendance' as any)
          .insert({
            student_id: studentId,
            date: selectedDate,
            status,
            check_in_time: status !== 'absent' ? new Date().toISOString() : null,
          } as any) as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-day', selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['attendance-month'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const markCheckout = useMutation({
    mutationFn: async (studentId: string) => {
      const existing = (dayAttendance as any[]).find((a: any) => a.student_id === studentId);
      if (!existing) { toast.error('Student not checked in'); return; }
      const { error } = await (supabase
        .from('attendance' as any)
        .update({ check_out_time: new Date().toISOString() } as any)
        .eq('id', existing.id) as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-day', selectedDate] });
      toast.success('Check-out recorded');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const markAllPresent = async () => {
    const unmarked = students.filter(s => !(dayAttendance as any[]).find((a: any) => a.student_id === s.id));
    if (unmarked.length === 0) { toast.info('All students already marked'); return; }
    for (const s of unmarked) {
      await markAttendanceMutation.mutateAsync({ studentId: s.id, status: 'present' });
    }
    toast.success(`Marked ${unmarked.length} students present`);
  };

  const attendanceMap = useMemo(() => {
    const map: Record<string, any> = {};
    (dayAttendance as any[]).forEach((a: any) => { map[a.student_id] = a; });
    return map;
  }, [dayAttendance]);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.program.toLowerCase().includes(search.toLowerCase())
  );

  // Monthly stats
  const daysInMonth = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });

  const monthlyStats = useMemo(() => {
    const stats: Record<string, { present: number; absent: number; late: number; total: number }> = {};
    students.forEach(s => { stats[s.id] = { present: 0, absent: 0, late: 0, total: 0 }; });
    (monthAttendance as any[]).forEach((a: any) => {
      if (stats[a.student_id]) {
        stats[a.student_id].total++;
        if (a.status === 'present' || a.status === 'half_day') stats[a.student_id].present++;
        if (a.status === 'absent') stats[a.student_id].absent++;
        if (a.status === 'late') { stats[a.student_id].late++; stats[a.student_id].present++; }
      }
    });
    return stats;
  }, [students, monthAttendance]);

  const todayStats = useMemo(() => {
    const present = (dayAttendance as any[]).filter((a: any) => a.status === 'present' || a.status === 'late').length;
    const absent = (dayAttendance as any[]).filter((a: any) => a.status === 'absent').length;
    const unmarked = students.length - (dayAttendance as any[]).length;
    return { present, absent, unmarked };
  }, [dayAttendance, students]);

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-primary" /> Attendance
          </h2>
          <p className="text-sm text-muted-foreground">Daily check-in/check-out & monthly reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-auto h-9" />
          <Button size="sm" variant="outline" onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))} className="text-xs h-9">Today</Button>
        </div>
      </div>

      {/* Daily Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-green-500/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{todayStats.present}</p>
            <p className="text-xs text-muted-foreground">Present</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{todayStats.absent}</p>
            <p className="text-xs text-muted-foreground">Absent</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600">{todayStats.unmarked}</p>
            <p className="text-xs text-muted-foreground">Unmarked</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions + Search */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Button size="sm" onClick={markAllPresent} className="gap-1.5 h-9" disabled={markAttendanceMutation.isPending}>
          <UserCheck className="w-4 h-4" /> Mark All Present
        </Button>
      </div>

      {/* Daily Attendance Table */}
      <Card className="overflow-hidden border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CalendarCheck className="w-4 h-4" /> {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {dayLoading ? (
              <div className="flex justify-center py-8"><Spinner size={20} /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map(student => {
                    const record = attendanceMap[student.id];
                    const statusConfig = STATUS_OPTIONS.find(s => s.value === record?.status);
                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {student.profile_image_url ? (
                              <img src={student.profile_image_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                                {student.name.charAt(0)}
                              </div>
                            )}
                            <span className="text-sm font-medium">{student.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{student.program}</TableCell>
                        <TableCell>
                          {record ? (
                            <Badge variant="outline" className={`text-xs ${statusConfig?.color || ''}`}>
                              {statusConfig?.icon} {statusConfig?.label}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">Unmarked</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {record?.check_in_time ? format(new Date(record.check_in_time), 'h:mm a') : '—'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {record?.check_out_time ? format(new Date(record.check_out_time), 'h:mm a') : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-7 px-1.5 text-green-600" title="Present"
                              onClick={() => markAttendanceMutation.mutate({ studentId: student.id, status: 'present' })}>
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-1.5 text-red-600" title="Absent"
                              onClick={() => markAttendanceMutation.mutate({ studentId: student.id, status: 'absent' })}>
                              <X className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-1.5 text-yellow-600" title="Late"
                              onClick={() => markAttendanceMutation.mutate({ studentId: student.id, status: 'late' })}>
                              <Clock className="w-3.5 h-3.5" />
                            </Button>
                            {record && !record.check_out_time && record.status !== 'absent' && (
                              <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => markCheckout.mutate(student.id)}>
                                Out
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Report */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sun className="w-4 h-4" /> Monthly Report — {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMonthOffset(m => m - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => setMonthOffset(0)}>This Month</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMonthOffset(m => m + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background z-10">Student</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Late</TableHead>
                <TableHead>%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map(student => {
                const stat = monthlyStats[student.id] || { present: 0, absent: 0, late: 0, total: 0 };
                const pct = stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 0;
                return (
                  <TableRow key={student.id}>
                    <TableCell className="sticky left-0 bg-background z-10 font-medium text-sm">{student.name}</TableCell>
                    <TableCell className="text-green-600 font-semibold">{stat.present}</TableCell>
                    <TableCell className="text-red-600 font-semibold">{stat.absent}</TableCell>
                    <TableCell className="text-yellow-600 font-semibold">{stat.late}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {pct}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
