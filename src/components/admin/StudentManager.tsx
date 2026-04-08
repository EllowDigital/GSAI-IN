import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Grid3X3, Table2, Users, Search, Filter } from 'lucide-react';
import StudentModal from './StudentModal';
import StudentDeleteDialog from './StudentDeleteDialog';
import StudentSummaryCard from './StudentSummaryCard';
import StudentsTable from './students/StudentsTable';
import StudentsCards from './students/StudentsCards';
import RefreshButton from './RefreshButton';
import { useStudents } from '@/hooks/useStudents';
import { usePersistentState } from '@/hooks/usePersistentState';

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
  default_monthly_fee: number;
  discount_percent: number;
};

export default function StudentManager() {
  const {
    students,
    loading,
    filteredStudents,
    search,
    setSearch,
    programFilter,
    setProgramFilter,
    programOptions,
    sortConfig,
    requestSort,
    refetchStudents,
  } = useStudents();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<StudentRow | null>(null);
  const [viewMode, setViewMode] = usePersistentState<'cards' | 'table'>(
    'admin:layout:view-mode',
    'cards',
    ['cards', 'table']
  );

  const handleEdit = (student: StudentRow) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchStudents();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      <div className="admin-page max-w-full p-0">
        <Card className="admin-panel rounded-xl">
          <CardHeader className="admin-panel-header bg-gradient-to-r from-primary/5 via-background to-background flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2 text-foreground">
                <Users className="w-5 h-5 text-yellow-500" />
                Student Management
              </CardTitle>
              <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                Manage student records, programs, and enrollment.
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
                className="gap-1.5"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Student</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-3 sm:p-5 space-y-4">
            {/* Filters */}
            <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or parent..."
                    className="pl-9 h-9 text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select
                    value={programFilter}
                    onValueChange={setProgramFilter}
                  >
                    <SelectTrigger className="w-full sm:w-[150px] h-9 text-sm">
                      <Filter className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                      <SelectValue placeholder="Program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Programs</SelectItem>
                      {programOptions.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="admin-toggle rounded-lg border-border/50 bg-card">
                    <Button
                      variant={viewMode === 'cards' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('cards')}
                      className="h-7 px-2"
                    >
                      <Grid3X3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                      className="h-7 px-2"
                    >
                      <Table2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
              {(search || programFilter !== 'all') && (
                <div className="flex items-center gap-2 mt-2.5 text-xs text-muted-foreground">
                  <span>
                    Showing {filteredStudents.length} of {students.length}{' '}
                    students
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearch('');
                      setProgramFilter('all');
                    }}
                    className="h-5 text-[11px] px-2"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <StudentSummaryCard students={students} loading={loading} />
            </div>

            {/* List */}
            <div className="space-y-3">
              {viewMode === 'cards' ? (
                <StudentsCards
                  students={filteredStudents}
                  loading={loading || isRefreshing}
                  onEdit={handleEdit}
                  onDelete={setDeleteStudent}
                />
              ) : (
                <Card className="overflow-hidden border-border/50">
                  <CardHeader className="pb-2 px-4 pt-3">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Users className="w-4 h-4" /> Students Table
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <StudentsTable
                        students={filteredStudents}
                        loading={loading || isRefreshing}
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
                <Card className="p-8 sm:p-12 border-border/50">
                  <div className="text-center space-y-3">
                    <div className="w-14 h-14 mx-auto bg-muted rounded-full flex items-center justify-center">
                      <Users className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      No Students Found
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Get started by adding your first student.
                    </p>
                    <Button
                      onClick={() => setIsModalOpen(true)}
                      className="gap-1.5"
                      size="sm"
                    >
                      <Plus className="w-4 h-4" /> Add First Student
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

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
