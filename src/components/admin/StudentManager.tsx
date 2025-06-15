
import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import StudentModal from "./StudentModal";
import StudentDeleteDialog from "./StudentDeleteDialog";
import { toast } from "@/components/ui/sonner";
import StudentSummaryCard from "./StudentSummaryCard";
import { exportStudentsToCsv } from "@/utils/exportToCsv";
import StudentsTable from "./students/StudentsTable";
import StudentsCards from "./students/StudentsCards";

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

export default function StudentManager() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<StudentRow | null>(null);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<"name" | "program" | "join_date">("join_date");
  const [sortAsc, setSortAsc] = useState(false);

  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);

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

  const requestSort = (key: "name" | "program" | "join_date") => {
    const isAsc = sortCol === key ? !sortAsc : true;
    setSortCol(key);
    setSortAsc(isAsc);
  };

  const renderContent = () => {
    const isMdUp = isClient && window.innerWidth >= 768;

    if (isMdUp) {
      return (
        <StudentsTable
          students={filteredStudents}
          loading={loading}
          onEdit={(student) => { setEditingStudent(student); setShowModal(true); }}
          onDelete={setDeleteStudent}
          sortConfig={{ key: sortCol, direction: sortAsc ? 'asc' : 'desc' }}
          requestSort={requestSort}
        />
      );
    }
    return (
      <StudentsCards
        students={filteredStudents}
        loading={loading}
        onEdit={(student) => { setEditingStudent(student); setShowModal(true); }}
        onDelete={setDeleteStudent}
      />
    );
  }

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

      {/* Table or Cards */}
      {renderContent()}

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
