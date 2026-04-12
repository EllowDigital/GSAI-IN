import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileClock, Filter, History, Search } from 'lucide-react';
import { format } from 'date-fns';
import { exportFeesToCsv } from '@/utils/exportToCsv';

type FeeRow = {
  id: string;
  student_id: string;
  month: number;
  year: number;
  monthly_fee: number;
  paid_amount: number;
  balance_due: number;
  status: string;
  created_at: string;
};

type StudentLite = {
  id: string;
  name: string;
  program: string;
};

export default function FeeHistoryLogPanel() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  const { data: fees = [], isLoading: loadingFees } = useQuery({
    queryKey: ['fees', 'history-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fees')
        .select(
          'id,student_id,month,year,monthly_fee,paid_amount,balance_due,status,created_at'
        )
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as FeeRow[];
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students', 'fee-history-lite'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id,name,program');

      if (error) throw error;
      return (data || []) as StudentLite[];
    },
  });

  const studentMap = useMemo(() => {
    const map = new Map<string, StudentLite>();
    for (const s of students) map.set(s.id, s);
    return map;
  }, [students]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredRows = useMemo(() => {
    return fees.filter((row) => {
      if (statusFilter && row.status?.toLowerCase() !== statusFilter) {
        return false;
      }

      if (yearFilter && String(row.year) !== yearFilter) {
        return false;
      }

      if (!normalizedQuery) return true;

      const student = studentMap.get(row.student_id);
      const studentName = (student?.name || '').toLowerCase();
      const program = (student?.program || '').toLowerCase();
      const monthYear = `${row.month}/${row.year}`;

      return (
        studentName.includes(normalizedQuery) ||
        program.includes(normalizedQuery) ||
        monthYear.includes(normalizedQuery)
      );
    });
  }, [fees, normalizedQuery, statusFilter, yearFilter, studentMap]);

  const snapshot = useMemo(() => {
    const total = filteredRows.length;
    const paid = filteredRows.filter((r) => r.status === 'paid').length;
    const pending = total - paid;
    const collected = filteredRows.reduce(
      (sum, row) => sum + Number(row.paid_amount || 0),
      0
    );
    const due = filteredRows.reduce(
      (sum, row) => sum + Number(row.balance_due || 0),
      0
    );

    return { total, paid, pending, collected, due };
  }, [filteredRows]);

  const yearOptions = useMemo(() => {
    const years = new Set<number>();
    for (const row of fees) years.add(row.year);
    return [...years].sort((a, b) => b - a);
  }, [fees]);

  const exportRows = filteredRows.map((row) => {
    const student = studentMap.get(row.student_id);
    return {
      student: {
        name: student?.name || 'Unknown Student',
        program: student?.program || '-',
      },
      fee: row,
    };
  });

  return (
    <div className="admin-page">
      <div className="admin-panel rounded-xl sm:rounded-2xl overflow-hidden">
        <div className="admin-panel-body space-y-4">
          <div className="admin-toolbar">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <History className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-foreground sm:text-lg">
                  Fee History Log
                </h2>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  View month-wise fee logs for all students.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportFeesToCsv(exportRows as any, 0, 0)}
              disabled={filteredRows.length === 0}
              className="h-9"
            >
              Export Log CSV
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <Card className="p-3">
              <p className="text-[11px] text-muted-foreground">Total Logs</p>
              <p className="text-lg font-semibold tabular-nums">{snapshot.total}</p>
            </Card>
            <Card className="p-3">
              <p className="text-[11px] text-muted-foreground">Paid</p>
              <p className="text-lg font-semibold tabular-nums">{snapshot.paid}</p>
            </Card>
            <Card className="p-3">
              <p className="text-[11px] text-muted-foreground">Pending</p>
              <p className="text-lg font-semibold tabular-nums">{snapshot.pending}</p>
            </Card>
            <Card className="p-3">
              <p className="text-[11px] text-muted-foreground">Collected</p>
              <p className="text-lg font-semibold tabular-nums">
                ₹{snapshot.collected.toLocaleString('en-IN')}
              </p>
            </Card>
            <Card className="p-3 col-span-2 sm:col-span-1">
              <p className="text-[11px] text-muted-foreground">Due</p>
              <p className="text-lg font-semibold tabular-nums">
                ₹{snapshot.due.toLocaleString('en-IN')}
              </p>
            </Card>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="relative sm:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
                placeholder="Search student, program, or month/year"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/20 px-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 w-full bg-transparent text-sm outline-none"
                >
                  <option value="">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                </select>
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/20 px-3">
                <FileClock className="h-4 w-4 text-muted-foreground" />
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="h-9 w-full bg-transparent text-sm outline-none"
                >
                  <option value="">All Years</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={String(year)}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Student</th>
                  <th className="px-3 py-2 text-left font-medium">Program</th>
                  <th className="px-3 py-2 text-left font-medium">Month</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <th className="px-3 py-2 text-right font-medium">Fee</th>
                  <th className="px-3 py-2 text-right font-medium">Paid</th>
                  <th className="px-3 py-2 text-right font-medium">Due</th>
                  <th className="px-3 py-2 text-left font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {loadingFees ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-8 text-center text-muted-foreground"
                    >
                      Loading fee logs...
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-8 text-center text-muted-foreground"
                    >
                      No fee logs found for selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => {
                    const student = studentMap.get(row.student_id);
                    const status = (row.status || 'unpaid').toLowerCase();
                    const badgeClass =
                      status === 'paid'
                        ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                        : status === 'partial'
                          ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                          : 'bg-destructive/10 text-destructive';

                    return (
                      <tr key={row.id} className="border-t border-border/50">
                        <td className="px-3 py-2.5 font-medium">
                          {student?.name || 'Unknown Student'}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {student?.program || '-'}
                        </td>
                        <td className="px-3 py-2.5">
                          {row.month}/{row.year}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${badgeClass}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          ₹{Number(row.monthly_fee || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          ₹{Number(row.paid_amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          ₹{Number(row.balance_due || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                          {row.created_at
                            ? format(new Date(row.created_at), 'dd MMM yyyy')
                            : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
