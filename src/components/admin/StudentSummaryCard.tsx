
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, List } from "lucide-react";

type Student = {
  program: string;
};

export default function StudentSummaryCard({
  students,
  loading = false,
}: {
  students: Student[];
  loading?: boolean;
}) {
  const total = students?.length || 0;
  const byProgram: Record<string, number> = {};
  if (Array.isArray(students)) {
    students.forEach((stu) => {
      if (!stu.program) return;
      byProgram[stu.program] = (byProgram[stu.program] || 0) + 1;
    });
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 w-full">
      <Card className="shadow flex-1 min-w-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-blue-700 text-base">
            <Users className="w-5 h-5" />
            Total Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-bold">{loading ? "..." : total}</span>
        </CardContent>
      </Card>
      <Card className="shadow flex-1 min-w-0 col-span-1 xs:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-yellow-700 text-base">
            <List className="w-5 h-5" />
            By Program
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-x-4 gap-y-1">
          {loading
            ? "..."
            : Object.keys(byProgram).length === 0
            ? <span className="text-muted-foreground">No programs</span>
            : Object.entries(byProgram).map(([prog, count]) => (
                <div key={prog} className="text-xs font-medium text-gray-800 bg-yellow-50 rounded px-2 py-1 mb-1">
                  {prog}: <b>{count}</b>
                </div>
              ))}
        </CardContent>
      </Card>
    </div>
  );
}
