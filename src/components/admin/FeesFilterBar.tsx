import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

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
  return (
    <div className="flex flex-col lg:flex-row w-full gap-3 lg:gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search student name..."
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="pl-10 w-full"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 w-full lg:w-auto">
        <Input
          type="number"
          value={filterMonth}
          min={1}
          max={12}
          onChange={(e) => setFilterMonth(Number(e.target.value))}
          className="w-full sm:w-20 lg:w-24"
          placeholder="Month"
        />
        <Input
          type="number"
          value={filterYear}
          min={2020}
          max={2100}
          onChange={(e) => setFilterYear(Number(e.target.value))}
          className="w-full sm:w-28 lg:w-32"
          placeholder="Year"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border px-3 py-2 rounded text-sm bg-white w-full sm:w-28 lg:w-32 min-w-[8rem] h-10"
        >
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>
    </div>
  );
}
