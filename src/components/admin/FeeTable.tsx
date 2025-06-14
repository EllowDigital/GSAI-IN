
import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import FeeModal from "./FeeModal";

function getStatusColor(status: string) {
  return status === "paid"
    ? "bg-green-100 text-green-800"
    : status === "partial"
    ? "bg-orange-100 text-orange-700"
    : "bg-red-100 text-red-700";
}

export default function FeeTable({
  fees,
  students,
  isLoading
}: {
  fees: any[];
  students: any[];
  isLoading: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFee, setModalFee] = useState<any>(null);
  const [modalStudent, setModalStudent] = useState<any>(null);

  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const filtered = useMemo(() => {
    if (!fees) return [];
    return fees.filter((f) => {
      if (month && f.month !== Number(month)) return false;
      if (year && f.year !== Number(year)) return false;
      if (status && f.status !== status) return false;
      if (
        search &&
        !f.students?.name?.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [fees, month, year, status, search]);

  // Monthly summary
  const summary = useMemo(() => {
    let collected = 0,
      pending = 0,
      overdue = 0;
    filtered.forEach((f) => {
      if (f.status === "paid") collected += f.paid_amount;
      else if (f.status === "partial") pending += f.balance_due;
      else overdue += f.balance_due;
    });
    return { collected, pending, overdue };
  }, [filtered]);

  // For modal: select month/year from fee row or defaults
  const modalMonth = modalFee?.month ?? "";
  const modalYear = modalFee?.year ?? "";

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-2 md:items-end mb-4">
        <div className="relative w-full md:w-56">
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <Search className="w-4 h-4" />
          </span>
          <Input
            placeholder="Search student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Input
          placeholder="Month"
          type="number"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full md:w-32"
        />
        <Input
          placeholder="Year"
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full md:w-32"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border px-3 py-1 rounded bg-gray-50 text-sm w-full md:w-40"
        >
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>
      {/* Summary */}
      <div className="flex gap-6 mb-2">
        <div className="text-green-700 font-bold">
          Collected: ₹{summary.collected}
        </div>
        <div className="text-orange-700 font-bold">
          Pending: ₹{summary.pending}
        </div>
        <div className="text-red-700 font-bold">
          Overdue: ₹{summary.overdue}
        </div>
      </div>
      <div className="overflow-auto rounded-2xl shadow-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Monthly Fee</TableHead>
              <TableHead>Paid Amount</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-500 py-10">
                  No fees found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((fee) => (
                <TableRow key={fee.id} className={getStatusColor(fee.status)}>
                  <TableCell>{fee.students?.name}</TableCell>
                  <TableCell>{fee.students?.program}</TableCell>
                  <TableCell>{fee.month}</TableCell>
                  <TableCell>{fee.year}</TableCell>
                  <TableCell>₹{fee.monthly_fee}</TableCell>
                  <TableCell>₹{fee.paid_amount}</TableCell>
                  <TableCell>₹{fee.balance_due}</TableCell>
                  <TableCell>
                    <span className="rounded-full px-3 py-1 font-bold text-xs capitalize">
                      {fee.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setModalFee(fee);
                        setModalStudent(fee.students);
                        setModalOpen(true);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <FeeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fee={modalFee}
        student={modalStudent}
        month={modalMonth}
        year={modalYear}
      />
    </div>
  );
}
