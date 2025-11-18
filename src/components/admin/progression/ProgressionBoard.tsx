import React, { useCallback, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowUpCircle,
  BadgeHelp,
  CalendarIcon,
  Download,
  Filter,
  NotebookPen,
  PlayCircle,
  Search,
} from 'lucide-react';
import EvidenceUploadButton from './EvidenceUploadButton';
import OptimizedImage from '@/components/OptimizedImage';
import {
  ProgressionRecord,
  ProgressStatus,
  useProgressionQuery,
} from '@/hooks/useProgressionQuery';
import { useBeltLevels, BeltLevel } from '@/hooks/useBeltLevels';
import { useStudents } from '@/hooks/useStudents';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';
import AssignStudentBeltDialog from './AssignStudentBeltDialog';

const STATUS_CONFIG: Record<
  ProgressStatus,
  { label: string; color: string; accent: string }
> = {
  needs_work: {
    label: 'Needs Work',
    color: 'bg-red-50 text-red-700',
    accent: 'border-red-200',
  },
  ready: {
    label: 'Ready for Assessment',
    color: 'bg-amber-50 text-amber-700',
    accent: 'border-amber-200',
  },
  passed: {
    label: 'Passed',
    color: 'bg-emerald-50 text-emerald-700',
    accent: 'border-emerald-200',
  },
  deferred: {
    label: 'Deferred',
    color: 'bg-slate-100 text-slate-700',
    accent: 'border-slate-200',
  },
};

const STATUS_ORDER: ProgressStatus[] = [
  'needs_work',
  'ready',
  'passed',
  'deferred',
];
const ALL_OPTION = 'all';

const formatDate = (value: string | null) => {
  if (!value) return 'Not assessed';
  try {
    return format(parseISO(value), 'dd MMM yyyy');
  } catch (error) {
    return value;
  }
};

type FilterState = {
  search: string;
  program?: string;
  beltLevelId?: string;
  coachId?: string;
};

function DroppableColumn({
  status,
  children,
}: {
  status: ProgressStatus;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'space-y-3 rounded-2xl border bg-white/90 p-3 transition-all',
        STATUS_CONFIG[status].accent,
        isOver && 'border-dashed border-primary/50 shadow-lg shadow-primary/20'
      )}
    >
      {children}
    </div>
  );
}

function DraggableCard({
  record,
  onStatusClick,
  onUploadEvidence,
  onPromote,
  nextBeltLabel,
  promoting,
}: {
  record: ProgressionRecord;
  onStatusClick: (status: ProgressStatus) => void;
  onUploadEvidence: (url: string) => void;
  onPromote?: () => void;
  nextBeltLabel?: string;
  promoting?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: record.id,
      data: { record },
    });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  const student = record.students;
  const belt = record.belt_levels;

  const firstMedia = record.evidence_media_urls?.[0];
  const isVideo = firstMedia ? /\.(mp4|mov|webm)$/i.test(firstMedia) : false;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'border border-slate-200 bg-white/95 shadow-sm transition-all',
        isDragging && 'ring-2 ring-primary/50 scale-[1.01]'
      )}
      {...listeners}
      {...attributes}
    >
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 shadow-inner">
              {student?.profile_image_url ? (
                <AvatarImage
                  src={student.profile_image_url}
                  alt={student?.name ?? 'student'}
                />
              ) : (
                <AvatarFallback>
                  {student?.name?.slice(0, 2).toUpperCase() ?? 'ST'}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="font-semibold text-slate-900 leading-tight">
                {student?.name ?? 'Unassigned'}
              </p>
              <p className="text-xs text-slate-500">
                {student?.program ?? 'Program TBD'}
              </p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <Badge variant="secondary" className="bg-slate-100 text-slate-700">
              {belt?.color ?? 'No Belt'}
            </Badge>
            <p className="text-[11px] text-slate-400">
              Rank #{belt?.rank ?? '-'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>{formatDate(record.assessment_date)}</span>
          </div>
          <span className="text-[11px] uppercase tracking-wide text-slate-400">
            {STATUS_CONFIG[record.status].label}
          </span>
        </div>

        {record.coach_notes && (
          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-3">
            <p className="font-semibold flex items-center gap-2 text-slate-700">
              <NotebookPen className="h-3.5 w-3.5 text-amber-500" /> Coach Notes
            </p>
            <p className="mt-1 line-clamp-3">{record.coach_notes}</p>
          </div>
        )}

        {record.evidence_media_urls?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-600">Evidence</p>
            <div className="grid grid-cols-2 gap-2">
              {record.evidence_media_urls.slice(0, 2).map((url) => {
                const video = /\.(mp4|mov|webm)$/i.test(url);
                return (
                  <div key={url} className="rounded-lg overflow-hidden border">
                    {video ? (
                      <video
                        src={url}
                        className="h-24 w-full object-cover"
                        muted
                        loop
                        controls={false}
                      />
                    ) : (
                      <OptimizedImage
                        src={url}
                        alt="Evidence"
                        className="h-24 w-full object-cover"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <EvidenceUploadButton
            progressId={record.id}
            onUploaded={onUploadEvidence}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => toast.info('Certificate export coming soon')}
          >
            <Download className="h-4 w-4" /> Certificate
          </Button>
          {onPromote && nextBeltLabel && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={onPromote}
              disabled={promoting}
            >
              <ArrowUpCircle className="h-4 w-4" />
              {promoting ? 'Promoting…' : `Promote to ${nextBeltLabel}`}
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_ORDER.map((status) => (
            <Button
              key={status}
              size="sm"
              className="px-2 text-xs"
              variant={status === record.status ? 'default' : 'outline'}
              onClick={() => onStatusClick(status)}
            >
              {STATUS_CONFIG[status].label.split(' ')[0]}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <BadgeHelp className="h-3 w-3" /> Drag card into another column to
          update status
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProgressionBoard() {
  const [filters, setFilters] = useState<FilterState>({ search: '' });
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

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
    return Array.from(new Set(students.map((student) => student.program))).map(
      (program) => ({ label: program, value: program })
    );
  }, [students]);

  const {
    data: rawRecords,
    grouped,
    isLoading,
    error,
    updateProgress,
    appendEvidence,
    assignStudent,
    assigningStudent,
    promoteStudent,
    promotingStudent,
  } = useProgressionQuery({
    search: filters.search,
    program: filters.program,
    beltLevelId: filters.beltLevelId,
    coachId: filters.coachId,
  });

  const coachOptions = useMemo(() => {
    const map = new Map<string, string>();
    (rawRecords ?? []).forEach((record) => {
      if (record.assessed_by && !map.has(record.assessed_by)) {
        map.set(
          record.assessed_by,
          `Coach ${record.assessed_by.slice(0, 6).toUpperCase()}`
        );
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [rawRecords]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { over, active } = event;
      if (!over) return;
      const nextStatus = over.id as ProgressStatus;
      const record = active.data.current?.record as
        | ProgressionRecord
        | undefined;
      if (!record || record.status === nextStatus) return;

      updateProgress({
        id: record.id,
        status: nextStatus,
        assessment_date: new Date().toISOString().slice(0, 10),
      });
    },
    [updateProgress]
  );

  const resetFilters = () => {
    setFilters({ search: '' });
  };

  const handleAssignSubmit = useCallback(
    async ({
      studentId,
      beltLevelId,
      status,
    }: {
      studentId: string;
      beltLevelId: string;
      status: ProgressStatus;
    }) => {
      await assignStudent({ studentId, beltLevelId, status });
    },
    [assignStudent]
  );

  const sortedBelts = useMemo(() => {
    return beltOptions
      .map((belt) => beltMap.get(belt.value))
      .filter(Boolean)
      .map((belt) => belt as BeltLevel)
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
  }, [beltOptions, beltMap]);

  const getNextBeltDetails = useCallback(
    (currentBeltId?: string | null) => {
      if (!currentBeltId) return null;
      const current = beltMap.get(currentBeltId);
      if (!current) return null;
      if (current.next_level_id) {
        const next = beltMap.get(current.next_level_id);
        if (next) return next;
      }
      const orderedIndex = sortedBelts.findIndex(
        (belt) => belt?.id === currentBeltId
      );
      if (orderedIndex >= 0 && orderedIndex < sortedBelts.length - 1) {
        return sortedBelts[orderedIndex + 1] ?? null;
      }
      return null;
    },
    [beltMap, sortedBelts]
  );

  const handlePromote = useCallback(
    async (record: ProgressionRecord) => {
      const nextBelt = getNextBeltDetails(record.belt_levels?.id);
      if (!nextBelt) {
        toast.info('Already at the highest belt.');
        return;
      }

      await promoteStudent({
        id: record.id,
        nextBelt: {
          id: nextBelt.id,
          color: nextBelt.color,
          rank: nextBelt.rank,
          requirements:
            (nextBelt.requirements as Record<string, unknown>[] | null) ?? null,
        },
      });
    },
    [getNextBeltDetails, promoteStudent]
  );

  return (
    <>
      <Card className="border border-slate-200 bg-gradient-to-b from-white to-slate-50 shadow-sm">
        <CardHeader className="gap-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-900">
                Progression Board
              </CardTitle>
              <p className="text-sm text-slate-500">
                Drag athletes between columns, attach sparring clips, and keep
                coaches aligned.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                className="gap-2"
                onClick={() => setAssignDialogOpen(true)}
              >
                <PlayCircle className="h-4 w-4" /> Assign student
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={resetFilters}
              >
                <Filter className="h-4 w-4" /> Reset filters
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 pt-4">
            <div className="col-span-1 flex gap-2 items-center rounded-xl border bg-white px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <Input
                value={filters.search}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: event.target.value,
                  }))
                }
                placeholder="Search athlete, belt, notes"
                className="border-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <Select
              value={filters.program ?? ALL_OPTION}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  program: value === ALL_OPTION ? undefined : value,
                }))
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_OPTION}>All Programs</SelectItem>
                {programOptions.map((program) => (
                  <SelectItem key={program.value} value={program.value}>
                    {program.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.beltLevelId ?? ALL_OPTION}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  beltLevelId: value === ALL_OPTION ? undefined : value,
                }))
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Belt color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_OPTION}>All Belts</SelectItem>
                {beltOptions.map((belt) => (
                  <SelectItem key={belt.value} value={belt.value}>
                    {belt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.coachId ?? ALL_OPTION}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  coachId: value === ALL_OPTION ? undefined : value,
                }))
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Coach" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_OPTION}>All Coaches</SelectItem>
                {coachOptions.map((coach) => (
                  <SelectItem key={coach.value} value={coach.value}>
                    {coach.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              Failed to load progression data: {error.message}
            </div>
          )}

          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
              {STATUS_ORDER.map((status) => {
                const list = grouped[status] ?? [];
                const config = STATUS_CONFIG[status];
                return (
                  <DroppableColumn status={status} key={status}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {config.label}
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                          {list.length}
                        </p>
                      </div>
                      <Badge className={config.color}>
                        {status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <ScrollArea className="h-[540px] pr-2">
                      <div className="space-y-3">
                        {isLoading && list.length === 0 ? (
                          <p className="text-xs text-slate-500">Loading…</p>
                        ) : list.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                            Drop students here
                          </div>
                        ) : (
                          list.map((record) => {
                            const nextBelt = getNextBeltDetails(
                              record.belt_levels?.id
                            );
                            return (
                              <DraggableCard
                                key={record.id}
                                record={record}
                                onStatusClick={(nextStatus) =>
                                  updateProgress({
                                    id: record.id,
                                    status: nextStatus,
                                  })
                                }
                                onUploadEvidence={(url) =>
                                  appendEvidence({
                                    id: record.id,
                                    mediaUrl: url,
                                  })
                                }
                                onPromote={
                                  nextBelt
                                    ? () => handlePromote(record)
                                    : undefined
                                }
                                nextBeltLabel={nextBelt?.color}
                                promoting={promotingStudent}
                              />
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </DroppableColumn>
                );
              })}
            </div>
          </DndContext>
        </CardContent>
      </Card>
      <AssignStudentBeltDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        students={studentOptions}
        belts={beltOptions.map((belt) => ({
          label: belt.label,
          value: belt.value,
        }))}
        onSubmit={handleAssignSubmit}
        loading={assigningStudent}
      />
    </>
  );
}
