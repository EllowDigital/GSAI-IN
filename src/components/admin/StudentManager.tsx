import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Grid3X3, Table2, Users } from 'lucide-react';
import StudentModal from './StudentModal';
import StudentDeleteDialog from './StudentDeleteDialog';
import StudentSummaryCard from './StudentSummaryCard';
import StudentsTable from './students/StudentsTable';
import StudentsCards from './students/StudentsCards';
import BackCard from './BackCard';
import { useStudents } from '@/hooks/useStudents';
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<StudentRow | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const handleEdit = (student: StudentRow) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleDelete = (student: StudentRow) => {
    setDeleteStudent(student);
  };

  const handleSave = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  return (
    <div className="w-full p-3 sm:p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6 lg:space-y-8 max-w-[1400px] mx-auto">
      {/* Header Card */}
      <BackCard
        title="Student Management"
        subtitle="Manage student records, programs, and enrollment information across all academy programs"
        onRefresh={() => refetchStudents()}
        isRefreshing={loading}
      >
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="gap-2"
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="gap-2"
            >
              <Table2 className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </Button>
          </div>
          
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 shadow-lg"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Student</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </BackCard>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <StudentSummaryCard students={students} loading={loading} />
      </div>

      {/* Content */}
      <div className="space-y-4 sm:space-y-6">
        {loading ? (
          <Card className="p-8 sm:p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="animate-spin h-8 w-8 sm:h-10 sm:w-10 border-4 border-primary border-t-transparent rounded-full" />
              <p className="text-sm sm:text-base text-muted-foreground">Loading students...</p>
            </div>
          </Card>
        ) : viewMode === 'cards' ? (
          <StudentsCards
            students={filteredStudents}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5" />
                Students Table View
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <StudentsTable
                  students={filteredStudents}
                  loading={loading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && students.length === 0 && (
          <Card className="p-8 sm:p-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No Students Found</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  Get started by adding your first student to the academy
                </p>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add First Student
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Modal */}
      <StudentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        student={editingStudent}
      />

      {/* Delete Dialog */}
      {deleteStudent && (
        <StudentDeleteDialog
          student={deleteStudent}
          onClose={() => setDeleteStudent(null)}
        />
      )}
    </div>
  );
}
