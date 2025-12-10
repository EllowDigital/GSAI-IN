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
  History,
  ArrowRight,
} from 'lucide-react';
import {
  ProgressionRecord,
  ProgressStatus,
  useProgressionQuery,
} from '@/hooks/useProgressionQuery';
import { useBeltLevels } from '@/hooks/useBeltLevels';
import { useStudents } from '@/hooks/useStudents';
import { usePromotionHistory } from '@/hooks/usePromotionHistory';
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
import { ScrollArea } from '@/components/ui/scroll-area';
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
        <CardContent className="p-3 sm:p-4">
          {/* Header with Avatar and Name */}
          <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-primary/20 flex-shrink-0">
              {student?.profile_image_url ? (
                <AvatarImage
                  src={student.profile_image_url}
                  alt={student?.name}
                />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs sm:text-sm">
                  {student?.name?.slice(0, 2).toUpperCase() ?? 'ST'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base truncate">
                {student?.name ?? 'Unassigned'}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {student?.program ?? 'N/A'}
              </p>
              <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                <StatusIcon
                  className={`h-3 w-3 sm:h-4 sm:w-4 ${STATUS_CONFIG[record.status].color}`}
                />
                <Badge
                  variant={STATUS_CONFIG[record.status].variant}
                  className="text-[10px] sm:text-xs"
                >
                  {STATUS_CONFIG[record.status].label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Belt Level Badge */}
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border ${getBeltColorClass(belt?.color ?? 'white')}`}
            >
              <Award className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{belt?.color ?? 'No Belt'}</span>
              <span className="text-[10px] sm:text-xs opacity-70">
                R{belt?.rank ?? 0}
              </span>
            </div>
          </div>

          {/* Assessment Date */}
          {record.assessment_date && (
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>
                {format(new Date(record.assessment_date), 'MMM dd, yyyy')}
              </span>
            </div>
          )}

          {/* Notes Preview */}
          {record.coach_notes && (
            <div className="mb-2 sm:mb-3 p-2 bg-muted/50 rounded-md text-xs sm:text-sm border">
              <p className="line-clamp-2 text-muted-foreground">
                {record.coach_notes}
              </p>
            </div>
          )}

          {/* Status Buttons */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            {(
              ['needs_work', 'ready', 'passed', 'deferred'] as ProgressStatus[]
            ).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={status === record.status ? 'default' : 'outline'}
                onClick={() => onStatusChange(status)}
                className="text-[10px] sm:text-xs h-7 sm:h-8 px-1 sm:px-2"
              >
                {STATUS_CONFIG[status].label}
              </Button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 gap-1 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm"
              onClick={() => setNotesDialogOpen(true)}
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              {record.coach_notes ? 'Edit' : 'Add'} Notes
            </Button>
            {record.status === 'passed' && nextBelt && (
              <Button
                size="sm"
                className="flex-1 gap-1 sm:gap-2 h-8 sm:h-9 bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                onClick={onPromote}
                disabled={promoting}
              >
                {promoting ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
                <span className="truncate">Promote to {nextBelt.color}</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Coach Notes - {student?.name}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Add assessment notes, feedback, or areas for improvement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add assessment notes..."
              rows={4}
              className="text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNotesDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveNotes}>
                Save
              </Button>
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
    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-card rounded-lg border">
      <div className={`p-1.5 sm:p-2 rounded-lg ${color}`}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <div>
        <p className="text-lg sm:text-2xl font-bold">{value}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function ProgressionBoard() {
  const [search, setSearch] = useState('');
  const [program, setProgram] = useState<string>();
  const [beltLevelId, setBeltLevelId] = useState<string>();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  const { beltOptions, beltMap } = useBeltLevels();
  const { students } = useStudents();
  const {
    history,
    addPromotion,
    isLoading: historyLoading,
  } = usePromotionHistory();

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
    records,
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
    record: ProgressionRecord,
    nextBelt: { id: string; color: string; rank: number }
  ) => {
    try {
      // Log promotion history first
      await addPromotion({
        studentId: record.students?.id ?? '',
        fromBeltId: record.belt_levels?.id ?? null,
        toBeltId: nextBelt.id,
      });

      // Then promote
      await promoteStudent({
        id: record.id,
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
        <CardHeader className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                Belt Progression
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Track and manage student belt assessments
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHistoryDialogOpen(true)}
                className="gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <History className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">History</span>
              </Button>
              <Button
                onClick={() => setAssignDialogOpen(true)}
                size="sm"
                className="gap-1 sm:gap-2 shadow text-xs sm:text-sm"
              >
                <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Assign</span>
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-3 sm:mt-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-3 sm:mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Select
              value={program ?? 'all'}
              onValueChange={(v) => setProgram(v === 'all' ? undefined : v)}
            >
              <SelectTrigger className="h-9 text-sm">
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
              <SelectTrigger className="h-9 text-sm">
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

        <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="needs_work" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-3 sm:mb-4 h-auto p-1">
                <TabsTrigger
                  value="needs_work"
                  className="text-[10px] sm:text-xs px-1 sm:px-2 py-1.5 sm:py-2"
                >
                  <span className="truncate">Needs</span>
                  {(grouped.needs_work?.length ?? 0) > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 text-[10px] h-4 px-1"
                    >
                      {grouped.needs_work?.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="ready"
                  className="text-[10px] sm:text-xs px-1 sm:px-2 py-1.5 sm:py-2"
                >
                  <span className="truncate">Ready</span>
                  {(grouped.ready?.length ?? 0) > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 text-[10px] h-4 px-1"
                    >
                      {grouped.ready?.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="passed"
                  className="text-[10px] sm:text-xs px-1 sm:px-2 py-1.5 sm:py-2"
                >
                  <span className="truncate">Passed</span>
                  {(grouped.passed?.length ?? 0) > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 text-[10px] h-4 px-1"
                    >
                      {grouped.passed?.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="deferred"
                  className="text-[10px] sm:text-xs px-1 sm:px-2 py-1.5 sm:py-2"
                >
                  <span className="truncate">Defer</span>
                  {(grouped.deferred?.length ?? 0) > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 text-[10px] h-4 px-1"
                    >
                      {grouped.deferred?.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {(
                [
                  'needs_work',
                  'ready',
                  'passed',
                  'deferred',
                ] as ProgressStatus[]
              ).map((status) => (
                <TabsContent key={status} value={status} className="mt-0">
                  {grouped[status] && grouped[status].length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
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
                              nextBelt && handlePromote(record, nextBelt)
                            }
                            nextBelt={nextBelt}
                            promoting={promotingStudent}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                      <Users className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-40" />
                      <p className="font-medium text-sm sm:text-base">
                        No students here
                      </p>
                      <p className="text-xs sm:text-sm mt-1">
                        Students appear as you update their status
                      </p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}

          {!isLoading && totalCount === 0 && (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <Award className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 opacity-30" />
              <p className="text-base sm:text-lg font-medium">
                No progression records
              </p>
              <p className="text-xs sm:text-sm mt-1 mb-3 sm:mb-4">
                Add students to begin tracking
              </p>
              <Button
                onClick={() => setAssignDialogOpen(true)}
                variant="default"
                size="sm"
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Assign First Student
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Promotion History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Promotion History
            </DialogTitle>
            <DialogDescription>Recent belt promotions</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No promotion history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      {item.students?.profile_image_url ? (
                        <AvatarImage src={item.students.profile_image_url} />
                      ) : (
                        <AvatarFallback className="text-xs">
                          {item.students?.name?.slice(0, 2).toUpperCase() ??
                            'ST'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.students?.name ?? 'Unknown'}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getBeltColorClass(item.from_belt?.color ?? 'white')}`}
                        >
                          {item.from_belt?.color ?? 'None'}
                        </span>
                        <ArrowRight className="h-3 w-3" />
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getBeltColorClass(item.to_belt?.color ?? 'white')}`}
                        >
                          {item.to_belt?.color ?? 'Unknown'}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {format(
                          new Date(item.promoted_at),
                          'MMM dd, yyyy h:mm a'
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

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
