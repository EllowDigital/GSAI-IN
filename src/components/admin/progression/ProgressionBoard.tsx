import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Search, UserPlus, Award, Clock, FileText } from 'lucide-react';
import {
  ProgressionRecord,
  ProgressStatus,
  useProgressionQuery,
} from '@/hooks/useProgressionQuery';
import { useBeltLevels } from '@/hooks/useBeltLevels';
import { useStudents } from '@/hooks/useStudents';
import AssignStudentBeltDialog from './AssignStudentBeltDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const STATUS_CONFIG: Record<
  ProgressStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  needs_work: { label: 'Needs Work', variant: 'destructive' },
  ready: { label: 'Ready', variant: 'secondary' },
  passed: { label: 'Passed', variant: 'default' },
  deferred: { label: 'Deferred', variant: 'outline' },
};

function StudentCard({
  record,
  onStatusChange,
  onNotesUpdate,
}: {
  record: ProgressionRecord;
  onStatusChange: (status: ProgressStatus) => void;
  onNotesUpdate: (notes: string) => void;
}) {
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notes, setNotes] = useState(record.coach_notes ?? '');
  const student = record.students;
  const belt = record.belt_levels;

  const handleSaveNotes = () => {
    onNotesUpdate(notes);
    setNotesDialogOpen(false);
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-12 w-12">
              {student?.profile_image_url ? (
                <AvatarImage
                  src={student.profile_image_url}
                  alt={student?.name}
                />
              ) : (
                <AvatarFallback>
                  {student?.name?.slice(0, 2).toUpperCase() ?? 'ST'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{student?.name ?? 'Unassigned'}</h3>
              <p className="text-sm text-muted-foreground">
                {student?.program ?? 'N/A'}
              </p>
            </div>
            <Badge variant={STATUS_CONFIG[record.status].variant}>
              {STATUS_CONFIG[record.status].label}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Award className="h-4 w-4" />
              <span>{belt?.color ?? 'No Belt'}</span>
            </div>
            {record.assessment_date && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {format(new Date(record.assessment_date), 'MMM dd, yyyy')}
                </span>
              </div>
            )}
          </div>

          {record.coach_notes && (
            <div className="mb-3 p-2 bg-muted rounded-md text-sm">
              <p className="line-clamp-2">{record.coach_notes}</p>
            </div>
          )}

          <div className="flex gap-2 mb-3">
            {(
              ['needs_work', 'ready', 'passed', 'deferred'] as ProgressStatus[]
            ).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={status === record.status ? 'default' : 'outline'}
                onClick={() => onStatusChange(status)}
                className="flex-1 text-xs"
              >
                {STATUS_CONFIG[status].label.split(' ')[0]}
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2"
            onClick={() => setNotesDialogOpen(true)}
          >
            <FileText className="h-4 w-4" />
            {record.coach_notes ? 'Edit Notes' : 'Add Notes'}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Coach Notes - {student?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add assessment notes, feedback, or areas for improvement..."
              rows={6}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setNotesDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveNotes}>Save Notes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ProgressionBoard() {
  const [search, setSearch] = useState('');
  const [program, setProgram] = useState<string>();
  const [beltLevelId, setBeltLevelId] = useState<string>();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const { beltOptions } = useBeltLevels();
  const { students } = useStudents();

  const studentOptions = useMemo(
    () =>
      students.map((student) => ({
        label: `${student.name} • ${student.program}`,
        value: student.id,
      })),
    [students]
  );

  const programOptions = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.program))).map((p) => ({
      label: p,
      value: p,
    }));
  }, [students]);

  const { grouped, updateProgress, assignStudent, assigningStudent } =
    useProgressionQuery({
      search,
      program,
      beltLevelId,
    });

  const handleStatusChange = (id: string, status: ProgressStatus) => {
    updateProgress({
      id,
      status,
      assessment_date: new Date().toISOString().slice(0, 10),
    });
  };

  const handleNotesUpdate = (id: string, notes: string) => {
    updateProgress({
      id,
      status:
        grouped.needs_work?.find((r) => r.id === id)?.status ??
        grouped.ready?.find((r) => r.id === id)?.status ??
        grouped.passed?.find((r) => r.id === id)?.status ??
        grouped.deferred?.find((r) => r.id === id)?.status ??
        'needs_work',
      coach_notes: notes,
    });
  };

  const totalCount =
    (grouped.needs_work?.length ?? 0) +
    (grouped.ready?.length ?? 0) +
    (grouped.passed?.length ?? 0) +
    (grouped.deferred?.length ?? 0);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>Student Progression</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track student belt progress and assessments
              </p>
            </div>
            <Button onClick={() => setAssignDialogOpen(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Assign Student
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="pl-9"
              />
            </div>
            <Select
              value={program ?? 'all'}
              onValueChange={(v) => setProgram(v === 'all' ? undefined : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programOptions.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={beltLevelId ?? 'all'}
              onValueChange={(v) => setBeltLevelId(v === 'all' ? undefined : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Belts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Belts</SelectItem>
                {beltOptions.map((b) => (
                  <SelectItem key={b.value} value={b.value}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="needs_work" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="needs_work">
                Needs Work
                {grouped.needs_work && grouped.needs_work.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {grouped.needs_work.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="ready">
                Ready
                {grouped.ready && grouped.ready.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {grouped.ready.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="passed">
                Passed
                {grouped.passed && grouped.passed.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {grouped.passed.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="deferred">
                Deferred
                {grouped.deferred && grouped.deferred.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {grouped.deferred.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {(
              ['needs_work', 'ready', 'passed', 'deferred'] as ProgressStatus[]
            ).map((status) => (
              <TabsContent key={status} value={status} className="mt-4">
                {grouped[status] && grouped[status].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {grouped[status].map((record) => (
                      <StudentCard
                        key={record.id}
                        record={record}
                        onStatusChange={(newStatus) =>
                          handleStatusChange(record.id, newStatus)
                        }
                        onNotesUpdate={(notes) =>
                          handleNotesUpdate(record.id, notes)
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No students in this category</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>

          {totalCount === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No student progression records found</p>
              <Button
                onClick={() => setAssignDialogOpen(true)}
                variant="outline"
                className="mt-4"
              >
                Assign Your First Student
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AssignStudentBeltDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        students={studentOptions}
        belts={beltOptions}
        onSubmit={assignStudent}
        loading={assigningStudent}
      />
    </>
  );
}
