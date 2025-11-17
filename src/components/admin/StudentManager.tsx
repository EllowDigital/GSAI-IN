import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Grid3X3, Table2, Users, KanbanSquare } from 'lucide-react';
import StudentModal from './StudentModal';
import StudentDeleteDialog from './StudentDeleteDialog';
import StudentSummaryCard from './StudentSummaryCard';
import StudentsTable from './students/StudentsTable';
import StudentsCards from './students/StudentsCards';
import RefreshButton from './RefreshButton';
import { useStudents } from '@/hooks/useStudents';
import ProgressionBoard from './progression/ProgressionBoard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { toast } from '@/hooks/use-toast'; // Optional: for success/error toasts

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
  const [activeTab, setActiveTab] = useState<'roster' | 'progression'>('roster');

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

  return (
    <>
      <div className="w-full p-3 sm:p-4 lg:p-6 xl:p-8 max-w-[1400px] mx-auto">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'roster' | 'progression')} className="space-y-6">
          <TabsList className="grid grid-cols-2 rounded-2xl bg-white shadow-sm border">
            <TabsTrigger value="roster" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Roster
            </TabsTrigger>
            <TabsTrigger value="progression" className="flex items-center gap-2">
              <KanbanSquare className="h-4 w-4" /> Progression
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roster" className="focus-visible:outline-none">
            <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 shadow-sm rounded-none sm:rounded-2xl">
              <CardHeader className="border-b border-slate-200/60 dark:border-slate-700/60 p-4 sm:p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                    <span>Student Management</span>
                  </CardTitle>
                  <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                    Manage student records, programs, and enrollment information
                    across all academy programs.
                  </p>
                </div>
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <RefreshButton
                    onRefresh={handleRefresh}
                    isLoading={loading || isRefreshing}
                    className="flex-shrink-0"
                  />
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="gap-2 shadow"
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Student</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  <StudentSummaryCard students={students} loading={loading} />
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {loading || isRefreshing ? (
                    <Card className="p-8 sm:p-12">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="animate-spin h-8 w-8 sm:h-10 sm:w-10 border-4 border-primary border-t-transparent rounded-full" />
                        <p className="text-sm sm:text-base text-muted-foreground">
                          Loading students...
                        </p>
                      </div>
                    </Card>
                  ) : viewMode === 'cards' ? (
                    <StudentsCards
                      students={filteredStudents}
                      loading={loading}
                      onEdit={handleEdit}
                      onDelete={setDeleteStudent}
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
                            onDelete={setDeleteStudent}
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
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                          No Students Found
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground mb-4">
                          Get started by adding your first student to the academy.
                        </p>
                        <Button
                          onClick={() => setIsModalOpen(true)}
                          className="gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add First Student
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progression" className="focus-visible:outline-none">
            <ProgressionBoard />
          </TabsContent>
        </Tabs>

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
    </>
  );
}
