
import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, User } from "lucide-react";
import StudentModal from "./StudentModal";
import StudentDeleteDialog from "./StudentDeleteDialog";
import { toast } from "@/components/ui/sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import clsx from "clsx";
import StudentSummaryCard from "./StudentSummaryCard";
import { exportStudentsToCsv } from "@/utils/exportToCsv";

// --- All required columns now reflected ---
type StudentRow = {
  id: string;
  name: string;
  aadhar_number: string;
  program: string;
  join_date: string;
  parent_name: string;
  parent_contact: string;
  profile_image_url: string | null;
  created_at: string | null;
};

const TABLE_HEAD = [
  "Avatar",
  "Name",
  "Aadhar Number",
  "Program",
  "Join Date",
  "Parent Name",
  "Parent Contact",
  "Actions",
];

export default function StudentManager() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<StudentRow | null>(null);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<"name" | "program" | "join_date">("join_date");
  const [sortAsc, setSortAsc] = useState(false);

  // Realtime fetch with all required columns
  useEffect(() => {
    let ignore = false;
    const fetchStudents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("students")
        .select("id, name, aadhar_number, program, join_date, parent_name, parent_contact, profile_image_url, created_at")
        .order("created_at", { ascending: false });
      if (!ignore) {
        if (error) {
          toast.error("Failed to fetch students: " + error.message);
        }
        setStudents((data || []) as StudentRow[]);
        setLoading(false);
      }
    };
    fetchStudents();

    const channel = supabase
      .channel("gsai-students-admin-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        fetchStudents
      )
      .subscribe();
    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  // Sorting and searching
  const filteredStudents = useMemo(() => {
    let filtered = students;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.program.toLowerCase().includes(q)
      );
    }
    filtered = [...filtered].sort((a, b) => {
      if (sortCol === "join_date") {
        return sortAsc
          ? new Date(a.join_date).getTime() - new Date(b.join_date).getTime()
          : new Date(b.join_date).getTime() - new Date(a.join_date).getTime();
      }
      const aV = (a[sortCol] ?? "").toLowerCase();
      const bV = (b[sortCol] ?? "").toLowerCase();
      if (aV < bV) return sortAsc ? -1 : 1;
      if (aV > bV) return sortAsc ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [students, search, sortCol, sortAsc]);

  return (
    <div className="max-w-[98vw] mx-auto w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
        <div className="w-full">
          <StudentSummaryCard students={students} loading={loading} />
        </div>
        <button
          onClick={() => exportStudentsToCsv(filteredStudents)}
          className="border border-blue-400 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium hover:bg-blue-200 transition text-xs sm:text-sm ml-0 md:ml-auto min-w-[120px]"
          disabled={!Array.isArray(filteredStudents) || filteredStudents.length === 0}
          title="Download as CSV"
        >
          Download CSV
        </button>
      </div>
      {/* Search/Add */}
      <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 mb-4 w-full">
        <input
          type="text"
          className="border rounded px-2 py-2 text-sm w-full xs:w-auto flex-1"
          placeholder="Search by Name or Program"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button
          onClick={() => { setEditingStudent(null); setShowModal(true); }}
          variant="default"
          className="flex gap-2 rounded-full w-full xs:w-auto justify-center"
        >
          <Plus size={18} /> <span className="hidden xs:inline">Add Student</span>
          <span className="inline xs:hidden">Add</span>
        </Button>
      </div>
      {/* Table */}
      <div className="rounded-2xl shadow-lg overflow-x-auto bg-white scrollbar-thin scrollbar-thumb-yellow-200 scrollbar-track-yellow-50">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[60px]">Avatar</TableHead>
              <TableHead
                className="cursor-pointer min-w-[110px]"
                onClick={() => {
                  if (sortCol !== "name") setSortCol("name");
                  else setSortAsc(a => !a);
                }}
              >Name</TableHead>
              <TableHead className="min-w-[130px]">Aadhar Number</TableHead>
              <TableHead
                className="cursor-pointer min-w-[120px]"
                onClick={() => {
                  if (sortCol !== "program") setSortCol("program");
                  else setSortAsc(a => !a);
                }}
              >Program</TableHead>
              <TableHead
                className="cursor-pointer min-w-[115px]"
                onClick={() => {
                  if (sortCol !== "join_date") setSortCol("join_date");
                  else setSortAsc(a => !a);
                }}
              >Join Date</TableHead>
              <TableHead className="min-w-[120px]">Parent Name</TableHead>
              <TableHead className="min-w-[120px]">Parent Contact</TableHead>
              <TableHead className="min-w-[90px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <div className="py-8 flex items-center justify-center">
                    <span className="animate-spin w-7 h-7 rounded-full border-4 border-yellow-300 border-t-transparent inline-block mr-2" />
                    Loading students...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <div className="py-10 text-center text-gray-400">No students found.</div>
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map(stu => (
                <TableRow
                  key={stu.id}
                  className={clsx(
                    "transition",
                    "hover:bg-yellow-50",
                    (filteredStudents.indexOf(stu) % 2 === 1) ? "bg-gray-50" : "bg-white"
                  )}
                >
                  <TableCell>
                    <Avatar className="h-9 w-9">
                      {stu.profile_image_url ? (
                        <AvatarImage src={stu.profile_image_url} alt={stu.name} className="object-cover" />
                      ) : (
                        <AvatarFallback className="bg-yellow-100">
                          <User size={18} className="text-yellow-600" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-semibold">{stu.name}</TableCell>
                  <TableCell>{stu.aadhar_number}</TableCell>
                  <TableCell>
                    <span className="block max-w-[100px] truncate">{stu.program}</span>
                  </TableCell>
                  <TableCell>
                    {stu.join_date
                      ? new Date(stu.join_date).toLocaleDateString()
                      : ""}
                  </TableCell>
                  <TableCell>
                    <span className="block max-w-[110px] truncate">{stu.parent_name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="block max-w-[110px] truncate">{stu.parent_contact}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditingStudent(stu); setShowModal(true); }}
                        className="rounded-full"
                        aria-label="Edit"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteStudent(stu)}
                        className="rounded-full"
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Add/Edit Modal */}
      {showModal && (
        <StudentModal
          open={showModal}
          onOpenChange={setShowModal}
          student={editingStudent}
        />
      )}
      {/* Delete dialog */}
      {deleteStudent && (
        <StudentDeleteDialog
          student={deleteStudent}
          onClose={() => setDeleteStudent(null)}
        />
      )}
    </div>
  );
}

// This file is now getting quite long (over 240 lines). Consider refactoring into smaller components if you frequently modify or extend this functionality.

