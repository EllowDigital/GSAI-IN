import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Grid3X3, Table2, Users, Search, Filter } from 'lucide-react';
import StudentModal from './StudentModal';
import StudentDeleteDialog from './StudentDeleteDialog';
import StudentSummaryCard from './StudentSummaryCard';
import StudentsTable from './students/StudentsTable';
import StudentsCards from './students/StudentsCards';
import RefreshButton from './RefreshButton';
import { useStudents } from '@/hooks/useStudents';

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

  return (
    <>
      <div className="w-full p-3 sm:p-4 lg:p-6 xl:p-8 max-w-[1600px] mx-auto">
        <Card className="bg-card border border-border/50 shadow-sm rounded-xl sm:rounded-2xl">
          <CardHeader className="border-b border-border/50 p-4 sm:p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 text-foreground">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                <span>Student Management</span>
              </CardTitle>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                Manage student records, programs, and enrollment information.
              </p>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <RefreshButton onRefresh={handleRefresh} isLoading={loading || isRefreshing} className="flex-shrink-0" />
              <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow" size="sm">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Student</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Search and Filters */}
            <Card className="border-border/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name or parent..."
                      className="pl-9 h-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={programFilter} onValueChange={setProgramFilter}>
                      <SelectTrigger className="w-full sm:w-[160px] h-9">
                        <Filter className="h-4 w-4 mr-2 flex-shrink-0" />
                        <SelectValue placeholder="Program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Programs</SelectItem>
                        {programOptions.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-1 border rounded-lg p-1 bg-muted/30">
                      <Button
                        variant={viewMode === 'cards' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('cards')}
                        className="h-7 px-2"
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('table')}
                        className="h-7 px-2"
                      >
                        <Table2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                {(search || programFilter !== 'all') && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <span>Showing {filteredStudents.length} of {students.length} students</span>
                    {(search || programFilter !== 'all') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSearch(''); setProgramFilter('all'); }}
                        className="h-6 text-xs"
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <StudentSummaryCard students={students} loading={loading} />
            </div>

            {/* Student List */}
            <div className="space-y-4">
              {loading || isRefreshing ? (
                <Card className="p-8 sm:p-12 border-border/50">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="animate-spin h-8 w-8 sm:h-10 sm:w-10 border-4 border-primary border-t-transparent rounded-full" />
                    <p className="text-sm sm:text-base text-muted-foreground">Loading students...</p>
                  </div>
                </Card>
              ) : viewMode === 'cards' ? (
                <StudentsCards students={filteredStudents} loading={loading} onEdit={handleEdit} onDelete={setDeleteStudent} />
              ) : (
                <Card className="overflow-hidden border-border/50">
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
                <Card className="p-8 sm:p-12 border-border/50">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No Students Found</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4">
                      Get started by adding your first student to the academy.
                    </p>
                    <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add First Student
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        <StudentModal open={isModalOpen} onOpenChange={setIsModalOpen} student={editingStudent} />

        {deleteStudent && <StudentDeleteDialog student={deleteStudent} onClose={() => setDeleteStudent(null)} />}
      </div>
    </>
  );
}
