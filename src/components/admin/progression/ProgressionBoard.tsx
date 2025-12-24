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
  Trophy,
  TrendingUp,
  Filter,
  Layers,
  Download,
} from 'lucide-react';
import { exportProgressionToCsv, exportPromotionHistoryToCsv } from '@/utils/exportToCsv';
import {
  ProgressionRecord,
  ProgressStatus,
  useProgressionQuery,
} from '@/hooks/useProgressionQuery';
import { useBeltLevels } from '@/hooks/useBeltLevels';
import { useStudents } from '@/hooks/useStudents';
import { usePromotionHistory } from '@/hooks/usePromotionHistory';
import AssignStudentBeltDialog from './AssignStudentBeltDialog';
import ProgressionTimeline from './ProgressionTimeline';
import StripeTracker from './StripeTracker';
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
import { isBeltDiscipline, isLevelDiscipline, getDisciplineConfig, hasStripeSupport } from '@/config/disciplineConfig';

const STATUS_CONFIG: Record<
  ProgressStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ElementType;
    bgColor: string;
    textColor: string;
  }
> = {
  needs_work: {
    label: 'Needs Work',
    variant: 'destructive',
    icon: AlertCircle,
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    textColor: 'text-red-600 dark:text-red-400',
  },
  ready: {
    label: 'Ready',
    variant: 'secondary',
    icon: Clock,
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    textColor: 'text-amber-600 dark:text-amber-400',
  },
  passed: {
    label: 'Passed',
    variant: 'default',
    icon: CheckCircle,
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    textColor: 'text-green-600 dark:text-green-400',
  },
  deferred: {
    label: 'Deferred',
    variant: 'outline',
    icon: Clock,
    bgColor: 'bg-slate-50 dark:bg-slate-900/50',
    textColor: 'text-slate-500 dark:text-slate-400',
  },
};

const BELT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  white: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-300' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-400' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-400' },
  green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-400' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-400' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-400' },
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-400' },
  brown: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-600' },
  black: { bg: 'bg-slate-800', text: 'text-white', border: 'border-slate-600' },
};

const LEVEL_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-400' },
  2: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-400' },
  3: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-400' },
  4: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-400' },
  5: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-400' },
};

function getBeltStyle(color: string) {
  return BELT_COLORS[color.toLowerCase()] || BELT_COLORS.white;
}

function getLevelStyle(order: number) {
  return LEVEL_COLORS[order] || LEVEL_COLORS[1];
}

function StudentCard({
  record,
  onStatusChange,
  onNotesUpdate,
  onPromote,
  onStripeUpdate,
  nextBelt,
  promoting,
}: {
  record: ProgressionRecord;
  onStatusChange: (status: ProgressStatus) => void;
  onNotesUpdate: (notes: string) => void;
  onPromote: () => void;
  onStripeUpdate: (newCount: number) => void;
  nextBelt: { id: string; color: string; rank: number } | null;
  promoting: boolean;
}) {
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notes, setNotes] = useState(record.coach_notes ?? '');
  const student = record.students;
  const belt = record.belt_levels;
  const program = student?.program ?? '';
  const isBeltBased = isBeltDiscipline(program);
  const showStripes = hasStripeSupport(program);
  const beltStyle = getBeltStyle(belt?.color ?? 'white');

  const handleSaveNotes = () => {
    onNotesUpdate(notes);
    setNotesDialogOpen(false);
  };

  const StatusIcon = STATUS_CONFIG[record.status].icon;

  // Get progression display based on discipline type
  const getProgressionDisplay = () => {
    if (isBeltBased) {
      const stripeCount = record.stripe_count ?? 0;
      return (
        <div className="flex items-center gap-2 mt-1.5">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${beltStyle.bg} ${beltStyle.text} ${beltStyle.border} border`}>
            <Award className="h-3 w-3" />
            {belt?.color ?? 'White'} Belt
            {showStripes && stripeCount > 0 && (
              <span className="ml-1">• {stripeCount} stripes</span>
            )}
          </div>
        </div>
      );
    } else {
      // Level-based discipline
      const config = getDisciplineConfig(program);
      return (
        <div className="flex items-center gap-2 mt-1.5">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20`}>
            <Layers className="h-3 w-3" />
            {config?.type === 'level' ? 'Level-based' : 'Training'}
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <Card className="group hover:shadow-md transition-all duration-300 overflow-hidden">
        {/* Belt/Level color indicator */}
        <div className={`h-1.5 ${isBeltBased ? beltStyle.bg : 'bg-gradient-to-r from-primary/30 to-primary/10'} ${isBeltBased ? beltStyle.border : ''} border-b`} />
        
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-primary/10">
              {student?.profile_image_url ? (
                <AvatarImage src={student.profile_image_url} alt={student?.name} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                  {student?.name?.slice(0, 2).toUpperCase() ?? 'ST'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{student?.name ?? 'Unassigned'}</h3>
              <p className="text-sm text-muted-foreground truncate">{program || 'N/A'}</p>
              {getProgressionDisplay()}
            </div>
          </div>

          {/* Current Status */}
          <div className={`flex items-center gap-2 p-2.5 rounded-lg mb-3 ${STATUS_CONFIG[record.status].bgColor}`}>
            <StatusIcon className={`h-4 w-4 ${STATUS_CONFIG[record.status].textColor}`} />
            <span className={`text-sm font-medium ${STATUS_CONFIG[record.status].textColor}`}>
              {STATUS_CONFIG[record.status].label}
            </span>
            {record.assessment_date && (
              <span className="text-xs text-muted-foreground ml-auto">
                {format(new Date(record.assessment_date), 'MMM dd')}
              </span>
            )}
          </div>

          {/* Notes Preview */}
          {record.coach_notes && (
            <div className="mb-3 p-2 bg-muted/50 rounded-md text-sm border border-border/50">
              <p className="line-clamp-2 text-muted-foreground">{record.coach_notes}</p>
            </div>
          )}

          {/* Status Actions */}
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {(['needs_work', 'ready', 'passed', 'deferred'] as ProgressStatus[]).map((status) => {
              const config = STATUS_CONFIG[status];
              const isActive = status === record.status;
              return (
                <Button
                  key={status}
                  size="sm"
                  variant={isActive ? 'default' : 'ghost'}
                  onClick={() => onStatusChange(status)}
                  className={`h-8 px-2 text-xs ${isActive ? '' : 'hover:bg-muted'}`}
                  title={config.label}
                >
                  <config.icon className="h-3.5 w-3.5" />
                </Button>
              );
            })}
          </div>

          {/* Stripe Tracker for BJJ/Grappling */}
          {showStripes && isBeltBased && (
            <div className="mb-3">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Stripes</p>
              <StripeTracker
                stripeCount={record.stripe_count ?? 0}
                onUpdate={onStripeUpdate}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9"
              onClick={() => setNotesDialogOpen(true)}
            >
              <FileText className="h-4 w-4 mr-1.5" />
              Notes
            </Button>
            {record.status === 'passed' && nextBelt && (
              <Button
                size="sm"
                className="flex-1 h-9 bg-green-600 hover:bg-green-700"
                onClick={onPromote}
                disabled={promoting}
              >
                {promoting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Promote
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Coach Notes</DialogTitle>
            <DialogDescription>{student?.name} - {belt?.color} Belt</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add assessment notes, feedback, or areas for improvement..."
              rows={5}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveNotes}>Save Notes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border bg-card ${color}`}>
      <div className="p-2.5 rounded-lg bg-background/80">
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  const { beltOptions, beltMap } = useBeltLevels();
  const { students } = useStudents();
  const { history, addPromotion, isLoading: historyLoading } = usePromotionHistory();

  const studentOptions = useMemo(
    () => students.map((student) => ({ 
      label: `${student.name} • ${student.program}`, 
      value: student.id,
      program: student.program,
    })),
    [students]
  );

  const programOptions = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.program))).map((p) => ({ label: p, value: p }));
  }, [students]);

  const { grouped, updateProgress, assignStudent, assigningStudent, promoteStudent, promotingStudent, isLoading, records, updateStripeCount } = useProgressionQuery({
    search,
    program,
    beltLevelId,
  });

  const handleStatusChange = (id: string, status: ProgressStatus) => {
    updateProgress({ id, status, assessment_date: new Date().toISOString().slice(0, 10) });
  };

  const handleNotesUpdate = (id: string, notes: string) => {
    const record = grouped.needs_work?.find((r) => r.id === id) ?? grouped.ready?.find((r) => r.id === id) ?? grouped.passed?.find((r) => r.id === id) ?? grouped.deferred?.find((r) => r.id === id);
    if (record) {
      updateProgress({ id, status: record.status, coach_notes: notes });
    }
  };

  const handlePromote = async (record: ProgressionRecord, nextBelt: { id: string; color: string; rank: number }) => {
    try {
      await addPromotion({ studentId: record.students?.id ?? '', fromBeltId: record.belt_levels?.id ?? null, toBeltId: nextBelt.id });
      await promoteStudent({ id: record.id, nextBelt: { ...nextBelt, requirements: null } });
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

  const totalCount = (grouped.needs_work?.length ?? 0) + (grouped.ready?.length ?? 0) + (grouped.passed?.length ?? 0) + (grouped.deferred?.length ?? 0);

  // Filter records by status
  const filteredRecords = useMemo(() => {
    if (statusFilter === 'all') return records;
    return records.filter((r) => r.status === statusFilter);
  }, [records, statusFilter]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-500" />
            Belt Progression
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage student belt assessments</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const exportData = records.map((r) => ({
                studentName: r.students?.name,
                program: r.students?.program,
                beltColor: r.belt_levels?.color,
                beltRank: r.belt_levels?.rank,
                status: r.status,
                stripeCount: r.stripe_count ?? 0,
                assessmentDate: r.assessment_date,
                coachNotes: r.coach_notes,
              }));
              exportProgressionToCsv(exportData);
            }}
            disabled={records.length === 0}
            className="h-9"
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setHistoryDialogOpen(true)} className="h-9">
            <History className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">History</span>
          </Button>
          <Button size="sm" onClick={() => setAssignDialogOpen(true)} className="h-9">
            <UserPlus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Assign Student</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <StatCard label="Needs Work" value={grouped.needs_work?.length ?? 0} icon={AlertCircle} color="border-red-200 dark:border-red-900/50" />
        <StatCard label="Ready" value={grouped.ready?.length ?? 0} icon={Clock} color="border-amber-200 dark:border-amber-900/50" />
        <StatCard label="Passed" value={grouped.passed?.length ?? 0} icon={CheckCircle} color="border-green-200 dark:border-green-900/50" />
        <StatCard label="Total" value={totalCount} icon={TrendingUp} color="border-primary/20" />
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..." className="pl-9 h-9" />
            </div>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[130px] h-9">
                  <Filter className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="needs_work">Needs Work</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="deferred">Deferred</SelectItem>
                </SelectContent>
              </Select>
              <Select value={program ?? 'all'} onValueChange={(v) => setProgram(v === 'all' ? undefined : v)}>
                <SelectTrigger className="w-full sm:w-[130px] h-9">
                  <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programOptions.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={beltLevelId ?? 'all'} onValueChange={(v) => setBeltLevelId(v === 'all' ? undefined : v)}>
                <SelectTrigger className="w-full sm:w-[130px] h-9">
                  <SelectValue placeholder="Belt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Belts</SelectItem>
                  {beltOptions.map((b) => (
                    <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 sm:py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading students...</p>
          </div>
        </div>
      ) : filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredRecords.map((record) => {
            const nextBelt = getNextBelt(record.belt_levels?.id);
            return (
              <StudentCard
                key={record.id}
                record={record}
                onStatusChange={(newStatus) => handleStatusChange(record.id, newStatus)}
                onNotesUpdate={(notes) => handleNotesUpdate(record.id, notes)}
                onPromote={() => nextBelt && handlePromote(record, nextBelt)}
                onStripeUpdate={(newCount) => updateStripeCount({ id: record.id, stripeCount: newCount })}
                nextBelt={nextBelt}
                promoting={promotingStudent}
              />
            );
          })}
        </div>
      ) : (
        <Card className="p-8 sm:p-12 border-border/50">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <Award className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">No Students Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {totalCount === 0 ? 'Assign students to start tracking their progression.' : 'No students match your current filters.'}
            </p>
            {totalCount === 0 && (
              <Button onClick={() => setAssignDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Assign First Student
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Promotion History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Promotion History
            </DialogTitle>
            <DialogDescription>Recent belt promotions</DialogDescription>
          </DialogHeader>
          <ProgressionTimeline history={history} isLoading={historyLoading} />
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
    </div>
  );
}
