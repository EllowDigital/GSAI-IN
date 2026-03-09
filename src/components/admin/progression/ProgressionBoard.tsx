import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  ChevronRight,
  Trash2,
  RotateCcw,
  Pencil,
} from 'lucide-react';
import {
  exportProgressionToCsv,
  exportPromotionHistoryToCsv,
} from '@/utils/exportToCsv';
import {
  ProgressionRecord,
  ProgressStatus,
  useProgressionQuery,
} from '@/hooks/useProgressionQuery';
import { useBeltLevels } from '@/hooks/useBeltLevels';
import { useDisciplineLevels } from '@/hooks/useDisciplineLevels';
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
import { supabase } from '@/integrations/supabase/client';
import { useDisciplines } from '@/hooks/useDisciplines';

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

const BELT_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  white: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-300',
  },
  yellow: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-400',
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-400',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-400',
  },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-400' },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-400',
  },
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-400' },
  brown: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-600',
  },
  black: { bg: 'bg-slate-800', text: 'text-white', border: 'border-slate-600' },
};

const LEVEL_COLORS: Record<
  number,
  { bg: string; text: string; border: string }
> = {
  1: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-400',
  },
  2: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-400' },
  3: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-400',
  },
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
  onDelete,
  onEdit,
  nextBelt,
  promoting,
  deleting,
  editing,
  beltOptions,
}: {
  record: ProgressionRecord;
  onStatusChange: (status: ProgressStatus) => void;
  onNotesUpdate: (notes: string) => void;
  onPromote: () => void;
  onStripeUpdate: (newCount: number) => void;
  onDelete: () => void;
  onEdit: (data: { belt_level_id?: string; stripe_count?: number; status?: ProgressStatus; coach_notes?: string | null }) => void;
  nextBelt: { id: string; color: string; rank: number } | null;
  promoting: boolean;
  deleting: boolean;
  editing: boolean;
  beltOptions: { value: string; label: string }[];
}) {
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [notes, setNotes] = useState(record.coach_notes ?? '');
  const [editBeltId, setEditBeltId] = useState(record.belt_levels?.id ?? '');
  const [editStripes, setEditStripes] = useState(String(record.stripe_count ?? 0));
  const [editStatus, setEditStatus] = useState<ProgressStatus>(record.status);
  const [editNotes, setEditNotes] = useState(record.coach_notes ?? '');
  const { isBeltBased: checkBelt, hasStripes: checkStripes, getDiscipline } = useDisciplines();
  const student = record.students;
  const belt = record.belt_levels;
  // Use belt's discipline (not comma-separated student.program) for type detection
  const beltDiscipline = belt?.discipline ?? '';
  const isBeltBased = beltDiscipline ? checkBelt(beltDiscipline) : true;
  const showStripes = beltDiscipline ? checkStripes(beltDiscipline) : false;
  const beltStyle = getBeltStyle(belt?.color ?? 'white');

  const handleSaveNotes = () => {
    onNotesUpdate(notes);
    setNotesDialogOpen(false);
  };

  const StatusIcon = STATUS_CONFIG[record.status].icon;

  const getProgressionDisplay = () => {
    if (isBeltBased) {
      const stripeCount = record.stripe_count ?? 0;
      return (
        <div className="flex items-center gap-2 mt-1.5">
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${beltStyle.bg} ${beltStyle.text} ${beltStyle.border} border`}
          >
            <Award className="h-3 w-3" />
            {belt?.color ?? 'White'} Belt
            {showStripes && stripeCount > 0 && (
              <span className="ml-1">• {stripeCount} stripes</span>
            )}
          </div>
          {beltDiscipline && (
            <span className="text-[10px] text-muted-foreground capitalize">{beltDiscipline}</span>
          )}
        </div>
      );
    } else {
      const disc = getDiscipline(beltDiscipline);
      return (
        <div className="flex items-center gap-2 mt-1.5">
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20"
          >
            <Layers className="h-3 w-3" />
            {disc?.type === 'level' ? 'Level-based' : 'Training'}
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <Card className="group hover:shadow-md transition-all duration-300 overflow-hidden">
        <div
          className={`h-1.5 ${isBeltBased ? beltStyle.bg : 'bg-gradient-to-r from-primary/30 to-primary/10'} ${isBeltBased ? beltStyle.border : ''} border-b`}
        />

        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-primary/10">
              {student?.profile_image_url ? (
                <AvatarImage
                  src={student.profile_image_url}
                  alt={student?.name}
                />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                  {student?.name?.slice(0, 2).toUpperCase() ?? 'ST'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {student?.name ?? 'Unassigned'}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {student?.program || 'N/A'}
              </p>
              {getProgressionDisplay()}
            </div>
            {/* Delete button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setDeleteDialogOpen(true)}
              title="Delete progression"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Current Status */}
          <div
            className={`flex items-center gap-2 p-2.5 rounded-lg mb-3 ${STATUS_CONFIG[record.status].bgColor}`}
          >
            <StatusIcon
              className={`h-4 w-4 ${STATUS_CONFIG[record.status].textColor}`}
            />
            <span
              className={`text-sm font-medium ${STATUS_CONFIG[record.status].textColor}`}
            >
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
              <p className="line-clamp-2 text-muted-foreground">
                {record.coach_notes}
              </p>
            </div>
          )}

          {/* Status Actions */}
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {(
              ['needs_work', 'ready', 'passed', 'deferred'] as ProgressStatus[]
            ).map((status) => {
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
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Stripes
              </p>
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
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => {
                setEditBeltId(record.belt_levels?.id ?? '');
                setEditStripes(String(record.stripe_count ?? 0));
                setEditStatus(record.status);
                setEditNotes(record.coach_notes ?? '');
                setEditDialogOpen(true);
              }}
              title="Edit progression"
            >
              <Pencil className="h-4 w-4" />
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
            <DialogDescription>
              {student?.name} - {belt?.color ?? 'N/A'} Belt
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add assessment notes, feedback, or areas for improvement..."
              rows={5}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Progression Record</AlertDialogTitle>
            <AlertDialogDescription>
              Remove {student?.name}'s {belt?.color ?? ''} belt progression record and its related promotion history? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete();
                setDeleteDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Progression Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Progression</DialogTitle>
            <DialogDescription>
              {student?.name} — Update belt, status, stripes, or notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isBeltBased && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Belt Level</label>
                <Select value={editBeltId} onValueChange={setEditBeltId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select belt" />
                  </SelectTrigger>
                  <SelectContent>
                    {beltOptions
                      .filter((b) => {
                        // Only show belts for same discipline
                        return true; // belt options are already filtered by caller if needed
                      })
                      .map((b) => (
                        <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Status</label>
              <Select value={editStatus} onValueChange={(v) => setEditStatus(v as ProgressStatus)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="needs_work">Needs Work</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="deferred">Deferred</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {showStripes && isBeltBased && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Stripe Count</label>
                <Select value={editStripes} onValueChange={setEditStripes}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} stripe{n !== 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Coach Notes</label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Assessment notes..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  onEdit({
                    belt_level_id: editBeltId !== record.belt_levels?.id ? editBeltId : undefined,
                    stripe_count: Number(editStripes) !== (record.stripe_count ?? 0) ? Number(editStripes) : undefined,
                    status: editStatus !== record.status ? editStatus : undefined,
                    coach_notes: editNotes !== (record.coach_notes ?? '') ? editNotes : undefined,
                  });
                  setEditDialogOpen(false);
                }}
                disabled={editing}
              >
                {editing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
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
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border bg-card ${color}`}
    >
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

function LevelProgressCard({
  lp,
  student,
  onUpdate,
  onDelete,
  updating,
  deleting,
}: {
  lp: any;
  student: { id: string; name: string; program: string; profile_image_url: string | null };
  onUpdate: (status: string) => void;
  onDelete: () => void;
  updating: boolean;
  deleting: boolean;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Card className="group hover:shadow-md transition-all duration-300 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-primary/30 to-primary/10 border-b" />
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-primary/10">
              {student.profile_image_url ? (
                <AvatarImage src={student.profile_image_url} alt={student.name} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-sm">
                  {student.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate">{student.name}</h3>
              <p className="text-xs text-muted-foreground">{student.program}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setDeleteOpen(true)}
              title="Delete level progression"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 mb-3">
            <Layers className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm font-medium text-foreground">{lp.discipline_levels?.level_name}</span>
            <Badge
              variant={lp.status === 'completed' ? 'default' : 'secondary'}
              className={`ml-auto text-[10px] ${lp.status === 'completed' ? 'bg-green-600' : ''}`}
            >
              {lp.status === 'completed' ? '✓ Done' : '⏳ Active'}
            </Badge>
          </div>
          {lp.coach_notes && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2 p-2 bg-muted/30 rounded-md border border-border/50">
              {lp.coach_notes}
            </p>
          )}
          <div className="flex gap-1.5">
            <Button
              variant={lp.status === 'in_progress' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => onUpdate('in_progress')}
              disabled={updating}
            >
              In Progress
            </Button>
            <Button
              variant={lp.status === 'completed' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => onUpdate('completed')}
              disabled={updating}
            >
              Complete
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Level Progress</AlertDialogTitle>
            <AlertDialogDescription>
              Remove {student.name}'s {lp.discipline_levels?.level_name} level progress? This will reset their progress for this level.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete();
                setDeleteOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
  const { levelOptions: disciplineLevelOptions, levelsByDiscipline } = useDisciplineLevels();
  const { students } = useStudents();
  const {
    history,
    addPromotion,
    isLoading: historyLoading,
  } = usePromotionHistory();

  // Fetch level-based discipline progress
  const queryClient = useQueryClient();
  const { data: levelProgressRecords = [], isLoading: levelProgressLoading } = useQuery({
    queryKey: ['discipline-progress-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_discipline_progress')
        .select('id, student_id, status, started_at, completed_at, coach_notes, discipline_levels(id, discipline, level_name, level_order)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const updateLevelProgressMutation = useMutation({
    mutationFn: async ({ id, status, coach_notes }: { id: string; status: string; coach_notes?: string | null }) => {
      const payload: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (status === 'completed') payload.completed_at = new Date().toISOString();
      if (coach_notes !== undefined) payload.coach_notes = coach_notes;
      const { error } = await supabase.from('student_discipline_progress').update(payload).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipline-progress-admin'] });
      toast.success('Level progress updated');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Update failed'),
  });

  const deleteLevelProgressMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('student_discipline_progress').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipline-progress-admin'] });
      toast.success('Level progress deleted');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Delete failed'),
  });

  // Fetch actual programs from junction table for each student
  const { data: allStudentPrograms = [] } = useQuery({
    queryKey: ['student-programs-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_programs')
        .select('student_id, program_name');
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Build a map: student_id → comma-separated program names from junction table
  const studentProgramMap = useMemo(() => {
    const map = new Map<string, string[]>();
    allStudentPrograms.forEach((sp: any) => {
      const existing = map.get(sp.student_id) || [];
      existing.push(sp.program_name);
      map.set(sp.student_id, existing);
    });
    return map;
  }, [allStudentPrograms]);

  const studentOptions = useMemo(
    () =>
      students.map((student) => {
        const programs = studentProgramMap.get(student.id);
        const programLabel = programs && programs.length > 0
          ? programs.join(', ')
          : student.program;
        return {
          label: `${student.name} • ${programLabel}`,
          value: student.id,
          program: programLabel,
        };
      }),
    [students, studentProgramMap]
  );

  const programOptions = useMemo(() => {
    // Collect all unique programs from junction table + students table
    const allProgs = new Set<string>();
    students.forEach((s) => {
      const progs = studentProgramMap.get(s.id);
      if (progs) progs.forEach((p) => allProgs.add(p));
      else if (s.program) s.program.split(',').forEach((p) => allProgs.add(p.trim()));
    });
    return Array.from(allProgs).filter(Boolean).map((p) => ({
      label: p,
      value: p,
    }));
  }, [students, studentProgramMap]);

  const {
    grouped,
    updateProgress,
    assignStudent,
    assigningStudent,
    promoteStudent,
    promotingStudent,
    isLoading,
    records,
    updateStripeCount,
    deleteProgress,
    deletingProgress,
    editProgress,
    editingProgress,
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
      updateProgress({ id, status: record.status, coach_notes: notes });
    }
  };

  const handlePromote = async (
    record: ProgressionRecord,
    nextBelt: { id: string; color: string; rank: number }
  ) => {
    try {
      await addPromotion({
        studentId: record.students?.id ?? '',
        fromBeltId: record.belt_levels?.id ?? null,
        toBeltId: nextBelt.id,
      });
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
            Student Progression
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track belt & level-based assessments across all programs
          </p>
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHistoryDialogOpen(true)}
            className="h-9"
          >
            <History className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">History</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setAssignDialogOpen(true)}
            className="h-9"
          >
            <UserPlus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Assign Student</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <StatCard
          label="Needs Work"
          value={grouped.needs_work?.length ?? 0}
          icon={AlertCircle}
          color="border-red-200 dark:border-red-900/50"
        />
        <StatCard
          label="Ready"
          value={grouped.ready?.length ?? 0}
          icon={Clock}
          color="border-amber-200 dark:border-amber-900/50"
        />
        <StatCard
          label="Passed"
          value={grouped.passed?.length ?? 0}
          icon={CheckCircle}
          color="border-green-200 dark:border-green-900/50"
        />
        <StatCard
          label="Total"
          value={totalCount}
          icon={TrendingUp}
          color="border-primary/20"
        />
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="pl-9 h-9"
              />
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
              <Select
                value={program ?? 'all'}
                onValueChange={(v) => setProgram(v === 'all' ? undefined : v)}
              >
                <SelectTrigger className="w-full sm:w-[130px] h-9">
                  <SelectValue placeholder="Program" />
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
                onValueChange={(v) =>
                  setBeltLevelId(v === 'all' ? undefined : v)
                }
              >
                <SelectTrigger className="w-full sm:w-[130px] h-9">
                  <SelectValue placeholder="Belt" />
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
                onStatusChange={(newStatus) =>
                  handleStatusChange(record.id, newStatus)
                }
                onNotesUpdate={(notes) => handleNotesUpdate(record.id, notes)}
                onPromote={() => nextBelt && handlePromote(record, nextBelt)}
                onStripeUpdate={(newCount) =>
                  updateStripeCount({ id: record.id, stripeCount: newCount })
                }
                onDelete={() => deleteProgress(record.id)}
                onEdit={(data) => editProgress({ id: record.id, ...data })}
                nextBelt={nextBelt}
                promoting={promotingStudent}
                deleting={deletingProgress}
                editing={editingProgress}
                beltOptions={beltOptions}
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
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              No Students Found
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {totalCount === 0
                ? 'Assign students to start tracking their progression.'
                : 'No students match your current filters.'}
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

      {/* Level-Based Discipline Progress Section */}
      {levelProgressRecords.length > 0 && (
        <div className="space-y-4 mt-6">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Level-Based Progression</h2>
            <Badge variant="secondary" className="text-xs">{levelProgressRecords.length} records</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {levelProgressRecords
              .filter((lp: any) => {
                if (program) {
                  const student = students.find((s) => s.id === lp.student_id);
                  if (student?.program?.toLowerCase() !== program.toLowerCase()) return false;
                }
                if (search) {
                  const student = students.find((s) => s.id === lp.student_id);
                  if (!student?.name.toLowerCase().includes(search.toLowerCase())) return false;
                }
                return true;
              })
              .map((lp: any) => {
                const student = students.find((s) => s.id === lp.student_id);
                if (!student) return null;
                return (
                  <LevelProgressCard
                    key={lp.id}
                    lp={lp}
                    student={student}
                    onUpdate={(status) => updateLevelProgressMutation.mutate({ id: lp.id, status })}
                    onDelete={() => deleteLevelProgressMutation.mutate(lp.id)}
                    updating={updateLevelProgressMutation.isPending}
                    deleting={deleteLevelProgressMutation.isPending}
                  />
                );
              })}
          </div>
        </div>
      )}


      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Promotion History
            </DialogTitle>
            <DialogDescription>
              Recent belt promotions across all programs. Promotion history is preserved even when progression records are deleted.
            </DialogDescription>
          </DialogHeader>
          <ProgressionTimeline history={history} isLoading={historyLoading} />
        </DialogContent>
      </Dialog>

      <AssignStudentBeltDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        students={studentOptions}
        belts={beltOptions}
        disciplineLevels={disciplineLevelOptions}
        onSubmit={async (payload) => {
          if (payload.isLevelBased) {
            // Write to student_discipline_progress table
            const { error: checkErr, data: existing } = await supabase
              .from('student_discipline_progress')
              .select('id')
              .eq('student_id', payload.studentId)
              .eq('discipline_level_id', payload.beltLevelId)
              .maybeSingle();

            if (existing) {
              const { error } = await supabase
                .from('student_discipline_progress')
                .update({
                  status:
                    payload.status === 'passed' ? 'completed' : 'in_progress',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', existing.id);
              if (error) throw error;
            } else {
              const { error } = await supabase
                .from('student_discipline_progress')
                .insert({
                  student_id: payload.studentId,
                  discipline_level_id: payload.beltLevelId,
                  status:
                    payload.status === 'passed' ? 'completed' : 'in_progress',
                });
              if (error) throw error;
            }
            toast.success('Student assigned to level');
            queryClient.invalidateQueries({ queryKey: ['discipline-progress-admin'] });
          } else {
            await assignStudent(payload);
          }
        }}
        loading={assigningStudent}
      />
    </div>
  );
}
