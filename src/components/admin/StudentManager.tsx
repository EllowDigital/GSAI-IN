import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Grid3X3, Table2, Users } from 'lucide-react';
import StudentModal from './StudentModal';
import StudentDeleteDialog from './StudentDeleteDialog';
import StudentSummaryCard from './StudentSummaryCard';
import StudentsTable from './students/StudentsTable';
import StudentsCards from './students/StudentsCards';
import RefreshButton from './RefreshButton';
import { useStudents } from '@/hooks/useStudents';
import { AdminCard, AdminCardContent } from './AdminCard';
import { AdminPageHeader } from './AdminPageHeader';
import { AdminStatsGrid } from './AdminStatsGrid';

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
    sortConfig,
    requestSort,
    refetchStudents,
  } = useStudents();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<StudentRow | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const handleEdit = (student: StudentRow) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchStudents();
    } catch (error) {
      // Silent error handling
    } finally {
      setIsRefreshing(false);
    }
  };

  const statsData = [
    {
      label: 'Total Students',
      value: students.length,
      icon: Users,
      color: 'primary' as const,
      trend: students.length > 0 ? '+12%' : '0%',
      trendUp: true
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Header */}
      <AdminCard>
        <AdminPageHeader
          title="Student Management"
          description="Manage student records, programs, and enrollment information across all academy programs"
          icon={Users}
          actions={
            <div className="flex gap-3">
              <RefreshButton
                onRefresh={handleRefresh}
                isLoading={loading || isRefreshing}
                className="interactive-button"
              />
              <Button
                onClick={() => setIsModalOpen(true)}
                className="gap-2 interactive-button"
                size="default"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Student</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          }
        />

        <AdminCardContent>
          {/* View Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="gap-2 interactive-button"
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="hidden sm:inline">Cards</span>
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="gap-2 interactive-button"
              >
                <Table2 className="w-4 h-4" />
                <span className="hidden sm:inline">Table</span>
              </Button>
            </div>
          </div>

          {/* Enhanced Stats */}
          <AdminStatsGrid stats={statsData} columns={4} />

          {/* Content Area */}
          <div className="space-y-6">
            {loading || isRefreshing ? (
              <AdminCard>
                <AdminCardContent padding="lg">
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
                    <p className="text-body-md text-muted-foreground">
                      Loading students...
                    </p>
                  </div>
                </AdminCardContent>
              </AdminCard>
            ) : viewMode === 'cards' ? (
              <StudentsCards
                students={filteredStudents}
                loading={loading}
                onEdit={handleEdit}
                onDelete={setDeleteStudent}
              />
            ) : (
              <AdminCard>
                <AdminCardContent padding="none">
                  <div className="overflow-x-auto">
                    <StudentsTable
                      students={filteredStudents}
                      loading={loading}
                      onEdit={handleEdit}
                      onDelete={setDeleteStudent}
                      sortConfig={sortConfig}
                      requestSort={requestSort}
                    />
                  </div>
                </AdminCardContent>
              </AdminCard>
            )}

            {/* Empty State */}
            {!loading && students.length === 0 && (
              <AdminCard>
                <AdminCardContent padding="lg">
                  <div className="text-center py-12 space-y-6">
                    <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
                      <Users className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-heading-md text-foreground font-bold">
                        No Students Found
                      </h3>
                      <p className="text-body-md text-muted-foreground max-w-md mx-auto">
                        Get started by adding your first student to the academy.
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsModalOpen(true)}
                      className="gap-2 interactive-button"
                      size="lg"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Student
                    </Button>
                  </div>
                </AdminCardContent>  
              </AdminCard>
            )}
          </div>
        </AdminCardContent>
      </AdminCard>

      {/* Modals */}
      <StudentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        student={editingStudent}
      />

      {deleteStudent && (
        <StudentDeleteDialog
          student={deleteStudent}
          onClose={() => setDeleteStudent(null)}
        />
      )}
    </div>
  );
}
