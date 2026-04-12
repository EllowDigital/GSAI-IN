import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, CalendarDays, SlidersHorizontal } from 'lucide-react';

type Props = {
  filterMonth: number;
  filterYear: number;
  filterStatus: string;
  filterName: string;
  setFilterMonth: (n: number) => void;
  setFilterYear: (n: number) => void;
  setFilterStatus: (v: string) => void;
  setFilterName: (v: string) => void;
};

export default function FeesFilterBar({
  filterMonth,
  filterYear,
  filterStatus,
  filterName,
  setFilterMonth,
  setFilterYear,
  setFilterStatus,
  setFilterName,
}: Props) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const monthOptions = [
    { value: 1, label: 'Jan' },
    { value: 2, label: 'Feb' },
    { value: 3, label: 'Mar' },
    { value: 4, label: 'Apr' },
    { value: 5, label: 'May' },
    { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' },
    { value: 8, label: 'Aug' },
    { value: 9, label: 'Sep' },
    { value: 10, label: 'Oct' },
    { value: 11, label: 'Nov' },
    { value: 12, label: 'Dec' },
  ];
  const yearOptions = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="w-full rounded-xl border border-border/70 bg-card/80 p-3 sm:p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal className="w-4 h-4 text-primary" />
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Filters
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="relative sm:col-span-2 xl:col-span-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by student name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        <label className="relative">
          <CalendarDays className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(Number(e.target.value))}
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm"
            aria-label="Month"
          >
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            aria-label="Year"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            aria-label="Status"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </label>
      </div>
    </div>
  );
}
