
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
    <div className="flex flex-col sm:flex-row w-full gap-2">
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search student name..."
          value={filterName}
          onChange={e => setFilterName(e.target.value)}
          className="pl-8 w-full"
        />
      </div>
      <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
        <Input
          type="number"
          value={filterMonth}
          min={1}
          max={12}
          onChange={e => setFilterMonth(Number(e.target.value))}
          className="w-full xs:w-20"
          placeholder="Month"
        />
        <Input
          type="number"
          value={filterYear}
          min={2020}
          max={2100}
          onChange={e => setFilterYear(Number(e.target.value))}
          className="w-full xs:w-28"
          placeholder="Year"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border px-3 py-2 rounded text-sm bg-white w-full xs:w-28 min-w-[8rem]"
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
