
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import StudentModal from "./StudentModal";
import StudentDeleteDialog from "./StudentDeleteDialog";
import StudentSummaryCard from "./StudentSummaryCard";
import { exportStudentsToCsv } from "@/utils/exportToCsv";
import StudentsTable from "./students/StudentsTable";
import StudentsCards from "./students/StudentsCards";
import { useStudents } from "@/hooks/useStudents";

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
  const { students, loading, filteredStudents, search, setSearch, sortConfig, requestSort } = useStudents();
  
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<StudentRow | null>(null);

  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleEdit = (student: StudentRow) => {
    setEditingStudent(student);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingStudent(null);
    setShowModal(true);
  };

  const renderContent = () => {
    const isMdUp = isClient && window.innerWidth >= 768;

    if (isMdUp) {
      return (
        <StudentsTable
          students={filteredStudents}
          loading={loading}
          onEdit={handleEdit}
          onDelete={setDeleteStudent}
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
      );
    }
    return (
      <StudentsCards
        students={filteredStudents}
        loading={loading}
        onEdit={handleEdit}
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
          onClick={handleAdd}
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
