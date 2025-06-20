
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import StudentModal from './StudentModal';
import StudentDeleteDialog from './StudentDeleteDialog';
import StudentSummaryCard from './StudentSummaryCard';
import { exportStudentsToCsv } from '@/utils/exportToCsv';
import StudentsTable from './students/StudentsTable';
import StudentsCards from './students/StudentsCards';
import { useStudents } from '@/hooks/useStudents';
import RefreshButton from './RefreshButton';

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
  const {
    students,
    loading,
    filteredStudents,
    search,
    setSearch,
    sortConfig,
    requestSort,
    refetchStudents,
  } = useStudents();

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

  const handleModalClose = () => {
    setShowModal(false);
    // Auto-refresh after modal close
    setTimeout(() => {
      refetchStudents?.();
    }, 100);
  };

  const handleDeleteClose = () => {
    setDeleteStudent(null);
    // Auto-refresh after delete
    setTimeout(() => {
      refetchStudents?.();
    }, 100);
  };

  const renderContent = () => {
    const isLgUp = isClient && window.innerWidth >= 1024;

    if (isLgUp) {
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
  };

  return (
    <div className="max-w-full mx-auto w-full px-2 sm:px-4">
      {/* Summary and Export */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-4">
        <div className="w-full lg:flex-1">
          <StudentSummaryCard students={students} loading={loading} />
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <RefreshButton 
            onRefresh={refetchStudents}
            isLoading={loading}
            className="flex-1 lg:flex-none"
          />
          <button
            onClick={() => exportStudentsToCsv(filteredStudents)}
            className="border border-blue-400 px-3 md:px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium hover:bg-blue-200 transition text-xs sm:text-sm flex-1 lg:flex-none lg:min-w-[120px]"
            disabled={
              !Array.isArray(filteredStudents) || filteredStudents.length === 0
            }
            title="Download as CSV"
          >
            Download CSV
          </button>
        </div>
      </div>

      {/* Search/Add */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 w-full">
        <input
          type="text"
          className="border rounded-lg px-3 py-2 text-sm w-full sm:flex-1"
          placeholder="Search by Name or Program"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          onClick={handleAdd}
          variant="default"
          className="flex gap-2 rounded-full w-full sm:w-auto justify-center px-4 md:px-6"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add Student</span>
          <span className="inline sm:hidden">Add</span>
        </Button>
      </div>

      {/* Table or Cards */}
      <div className="w-full overflow-hidden">
        {renderContent()}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <StudentModal
          open={showModal}
          onOpenChange={handleModalClose}
          student={editingStudent}
        />
      )}
      {/* Delete dialog */}
      {deleteStudent && (
        <StudentDeleteDialog
          student={deleteStudent}
          onClose={handleDeleteClose}
        />
      )}
    </div>
  );
}
