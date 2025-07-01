import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Grid, List } from 'lucide-react';
import StudentModal from './StudentModal';
import StudentDeleteDialog from './StudentDeleteDialog';
import StudentSummaryCard from './StudentSummaryCard';
import { exportStudentsToCsv } from '@/utils/exportToCsv';
import StudentsTable from './students/StudentsTable';
import StudentsCards from './students/StudentsCards';
import { useStudents } from '@/hooks/useStudents';
import RefreshButton from './RefreshButton';
import { toast } from '@/hooks/use-toast';

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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

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

  const handleRefresh = async () => {
    try {
      await refetchStudents?.();
      toast({
        title: 'Success',
        description: 'Students refreshed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to refresh students',
        variant: 'error',
      });
    }
  };

  const renderContent = () => {
    // Use view mode state instead of window width check
    if (viewMode === 'table') {
      return (
        <div className="rounded-2xl shadow-lg overflow-x-auto bg-white">
          <StudentsTable
            students={filteredStudents}
            loading={loading}
            onEdit={handleEdit}
            onDelete={setDeleteStudent}
            sortConfig={sortConfig}
            requestSort={requestSort}
          />
        </div>
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
    <div className="w-full space-y-3 sm:space-y-4 md:space-y-6 p-2 sm:p-4 md:p-6">
      {/* Summary and Export */}
      <div className="flex flex-col space-y-3 sm:space-y-4">
        <div className="w-full">
          <StudentSummaryCard students={students} loading={loading} />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4">
          <div className="flex gap-3 w-full lg:w-auto">
            <RefreshButton
              onRefresh={handleRefresh}
              isLoading={loading}
              className="flex-1 lg:flex-none"
            />
            <button
              onClick={() => exportStudentsToCsv(filteredStudents)}
              className="flex-1 lg:flex-none border border-blue-400 px-3 sm:px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium hover:bg-blue-200 transition text-xs sm:text-sm min-h-[40px] flex items-center justify-center"
              disabled={
                !Array.isArray(filteredStudents) ||
                filteredStudents.length === 0
              }
              title="Download as CSV"
            >
              Download CSV
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 border rounded-full p-1 bg-gray-50 w-full lg:w-auto">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="rounded-full px-3 flex-1 lg:flex-none"
            >
              <Grid size={16} />
              <span className="hidden sm:inline ml-1">Cards</span>
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-full px-3 flex-1 lg:flex-none"
            >
              <List size={16} />
              <span className="hidden sm:inline ml-1">Table</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Search/Add */}
      <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 md:gap-4">
        <input
          type="text"
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          placeholder="Search by Name or Program"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          onClick={handleAdd}
          variant="default"
          className="flex gap-2 rounded-full xs:w-auto w-full justify-center px-4 md:px-6 min-h-[40px]"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add Student</span>
          <span className="inline sm:hidden">Add</span>
        </Button>
      </div>

      {/* Table or Cards */}
      <div className="w-full overflow-hidden">{renderContent()}</div>

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
