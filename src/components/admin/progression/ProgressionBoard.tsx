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
import {
  Search,
  UserPlus,
  Award,
  Clock,
  FileText,
  ChevronUp,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
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
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';

const STATUS_CONFIG: Record<
  ProgressStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ElementType;
    color: string;
  }
> = {
  needs_work: {
    label: 'Needs Work',
    variant: 'destructive',
    icon: AlertCircle,
    color: 'text-red-500',
  },
  ready: {
    label: 'Ready',
    variant: 'secondary',
    icon: Clock,
    color: 'text-yellow-500',
  },
  passed: {
    label: 'Passed',
    variant: 'default',
    icon: CheckCircle,
    color: 'text-green-500',
  },
  deferred: {
    label: 'Deferred',
    variant: 'outline',
    icon: Clock,
    color: 'text-muted-foreground',
  },
};

const BELT_COLORS: Record<string, string> = {
  white: 'bg-slate-100 text-slate-800 border-slate-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-400',
  orange: 'bg-orange-100 text-orange-800 border-orange-400',
  green: 'bg-green-100 text-green-800 border-green-400',
  blue: 'bg-blue-100 text-blue-800 border-blue-400',
  brown: 'bg-amber-700 text-white border-amber-800',
  black: 'bg-slate-900 text-white border-slate-700',
};

function getBeltColorClass(color: string): string {
  return BELT_COLORS[color.toLowerCase()] || 'bg-muted text-muted-foreground';
}

function StudentCard({
  record,
  onStatusChange,
  onNotesUpdate,
  onPromote,
  nextBelt,
  promoting,
}: {
  record: ProgressionRecord;
  onStatusChange: (status: ProgressStatus) => void;
  onNotesUpdate: (notes: string) => void;
  onPromote: () => void;
  nextBelt: { id: string; color: string; rank: number } | null;
  promoting: boolean;
}) {
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notes, setNotes] = useState(record.coach_notes ?? '');
  const student = record.students;
  const belt = record.belt_levels;

  const handleSaveNotes = () => {
    onNotesUpdate(notes);
    setNotesDialogOpen(false);
  };

  const StatusIcon = STATUS_CONFIG[record.status].icon;

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/50">
        <CardContent className="p-4">
          {/* Header with Avatar and Name */}
          <div className="flex items-start gap-3 mb-4">
            <Avatar className="h-14 w-14 ring-2 ring-primary/20">
              {student?.profile_image_url ? (
                <AvatarImage
                  src={student.profile_image_url}
                  alt={student?.name}
                />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {student?.name?.slice(0, 2).toUpperCase() ?? 'ST'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base truncate">
                {student?.name ?? 'Unassigned'}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {student?.program ?? 'N/A'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <StatusIcon
                  className={`h-4 w-4 ${STATUS_CONFIG[record.status].color}`}
                />
                <Badge
                  variant={STATUS_CONFIG[record.status].variant}
                  className="text-xs"
                >
                  {STATUS_CONFIG[record.status].label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Belt Level Badge */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getBeltColorClass(belt?.color ?? 'white')}`}
            >
              <Award className="h-4 w-4" />
              <span>{belt?.color ?? 'No Belt'} Belt</span>
              <span className="text-xs opacity-70">Rank {belt?.rank ?? 0}</span>
            </div>
          </div>

          {/* Assessment Date */}
          {record.assessment_date && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Clock className="h-4 w-4" />
              <span>
                Assessed: {format(new Date(record.assessment_date), 'MMM dd, yyyy')}
              </span>
            </div>
          )}

          {/* Notes Preview */}
          {record.coach_notes && (
            <div className="mb-3 p-2 bg-muted/50 rounded-md text-sm border">
              <p className="line-clamp-2 text-muted-foreground">
                {record.coach_notes}
              </p>
            </div>
          )}

          {/* Status Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {(
              ['needs_work', 'ready', 'passed', 'deferred'] as ProgressStatus[]
            ).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={status === record.status ? 'default' : 'outline'}
                onClick={() => onStatusChange(status)}
                className="text-xs h-8"
              >
                {STATUS_CONFIG[status].label}
              </Button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 gap-2 h-9"
              onClick={() => setNotesDialogOpen(true)}
            >
              <FileText className="h-4 w-4" />
              {record.coach_notes ? 'Edit' : 'Add'} Notes
            </Button>
            {record.status === 'passed' && nextBelt && (
              <Button
                size="sm"
                className="flex-1 gap-2 h-9 bg-green-600 hover:bg-green-700"
                onClick={onPromote}
                disabled={promoting}
              >
                {promoting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
                Promote to {nextBelt.color}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Coach Notes - {student?.name}</DialogTitle>
            <DialogDescription>
              Add assessment notes, feedback, or areas for improvement.
            </DialogDescription>
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

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function ProgressionBoard() {
  const [search, setSearch] = useState('');
  const [program, setProgram] = useState<string>();
  const [beltLevelId, setBeltLevelId] = useState<string>();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const { beltOptions, beltMap } = useBeltLevels();
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

  const {
    grouped,
    updateProgress,
    assignStudent,
    assigningStudent,
    promoteStudent,
    promotingStudent,
    isLoading,
  } = useProgressionQuery({
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
    const record =
      grouped.needs_work?.find((r) => r.id === id) ??
      grouped.ready?.find((r) => r.id === id) ??
      grouped.passed?.find((r) => r.id === id) ??
      grouped.deferred?.find((r) => r.id === id);

    if (record) {
      updateProgress({
        id,
        status: record.status,
        coach_notes: notes,
      });
    }
  };

  const handlePromote = async (
    id: string,
    nextBelt: { id: string; color: string; rank: number }
  ) => {
    try {
      await promoteStudent({
        id,
        nextBelt: { ...nextBelt, requirements: null },
      });
    } catch (error) {
      toast.error('Failed to promote student');
    }
  };

  const getNextBelt = (currentBeltId: string | undefined) => {
    if (!currentBeltId) return null;
    const currentBelt = beltMap.get(currentBeltId);
    if (!currentBelt?.next_level_id) return null;
    return beltMap.get(currentBelt.next_level_id) ?? null;
  };

  const totalCount =
    (grouped.needs_work?.length ?? 0) +
    (grouped.ready?.length ?? 0) +
    (grouped.passed?.length ?? 0) +
    (grouped.deferred?.length ?? 0);

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Award className="h-6 w-6 text-primary" />
                Belt Progression
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track and manage student belt assessments
              </p>
            </div>
            <Button
              onClick={() => setAssignDialogOpen(true)}
              className="gap-2 shadow"
            >
              <UserPlus className="h-4 w-4" />
              Assign Student
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <StatCard
              label="Needs Work"
              value={grouped.needs_work?.length ?? 0}
              icon={AlertCircle}
              color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            />
            <StatCard
              label="Ready"
              value={grouped.ready?.length ?? 0}
              icon={Clock}
              color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
            />
            <StatCard
              label="Passed"
              value={grouped.passed?.length ?? 0}
              icon={CheckCircle}
              color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
            />
            <StatCard
              label="Total"
              value={totalCount}
              icon={Users}
              color="bg-primary/10 text-primary"
            />
          </div>

          {/* Filters */}
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
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      {b.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="needs_work" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="needs_work" className="gap-1">
                  <AlertCircle className="h-3 w-3 hidden sm:inline" />
                  <span className="truncate">Needs Work</span>
                  {(grouped.needs_work?.length ?? 0) > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {grouped.needs_work?.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="ready" className="gap-1">
                  <Clock className="h-3 w-3 hidden sm:inline" />
                  <span className="truncate">Ready</span>
                  {(grouped.ready?.length ?? 0) > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {grouped.ready?.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="passed" className="gap-1">
                  <CheckCircle className="h-3 w-3 hidden sm:inline" />
                  <span className="truncate">Passed</span>
                  {(grouped.passed?.length ?? 0) > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {grouped.passed?.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="deferred" className="gap-1">
                  <span className="truncate">Deferred</span>
                  {(grouped.deferred?.length ?? 0) > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {grouped.deferred?.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {(
                ['needs_work', 'ready', 'passed', 'deferred'] as ProgressStatus[]
              ).map((status) => (
                <TabsContent key={status} value={status} className="mt-0">
                  {grouped[status] && grouped[status].length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {grouped[status].map((record) => {
                        const nextBelt = getNextBelt(record.belt_levels?.id);
                        return (
                          <StudentCard
                            key={record.id}
                            record={record}
                            onStatusChange={(newStatus) =>
                              handleStatusChange(record.id, newStatus)
                            }
                            onNotesUpdate={(notes) =>
                              handleNotesUpdate(record.id, notes)
                            }
                            onPromote={() =>
                              nextBelt &&
                              handlePromote(record.id, {
                                id: nextBelt.id,
                                color: nextBelt.color,
                                rank: nextBelt.rank,
                              })
                            }
                            nextBelt={nextBelt}
                            promoting={promotingStudent}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
                      <p className="font-medium">No students in this category</p>
                      <p className="text-sm mt-1">
                        Students will appear here as you update their status
                      </p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}

          {!isLoading && totalCount === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Award className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No progression records found</p>
              <p className="text-sm mt-1 mb-4">
                Add students to begin tracking their belt progression
              </p>
              <Button
                onClick={() => setAssignDialogOpen(true)}
                variant="default"
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
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
