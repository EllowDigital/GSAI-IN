import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Award, Layers, Info } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProgressStatus } from '@/hooks/useProgressionQuery';
import { useDisciplines } from '@/hooks/useDisciplines';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StudentOption {
  label: string;
  value: string;
  program?: string;
}

interface BeltOption {
  label: string;
  value: string;
  color?: string;
  discipline?: string | null;
}

interface DisciplineLevelOption {
  label: string;
  value: string;
  discipline: string;
  order: number;
}

interface AssignStudentBeltDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: StudentOption[];
  belts: BeltOption[];
  disciplineLevels?: DisciplineLevelOption[];
  onSubmit: (payload: {
    studentId: string;
    beltLevelId: string;
    status: ProgressStatus;
    selectedProgram: string;
    isLevelBased?: boolean;
  }) => Promise<void>;
  onStudentSelectionDebug?: (payload: {
    studentId: string;
    parsedPrograms: string[];
  }) => void;
  loading?: boolean;
}

const STATUS_OPTIONS: { value: ProgressStatus; label: string }[] = [
  { value: 'needs_work', label: 'Needs work' },
  { value: 'ready', label: 'Ready for assessment' },
  { value: 'passed', label: 'Passed' },
  { value: 'deferred', label: 'Deferred' },
];

export default function AssignStudentBeltDialog({
  open,
  onOpenChange,
  students,
  belts,
  disciplineLevels = [],
  onSubmit,
  onStudentSelectionDebug,
  loading,
}: AssignStudentBeltDialogProps) {
  const [studentId, setStudentId] = useState('');
  const [beltId, setBeltId] = useState('');
  const [status, setStatus] = useState<ProgressStatus>('needs_work');
  const [error, setError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState('');

  // Use DB-driven discipline data
  const {
    isBeltBased: checkBeltBased,
    isLevelBased: checkLevelBased,
    hasStripes,
    getDiscipline,
  } = useDisciplines();

  // Get selected student
  const selectedStudent = useMemo(() => {
    return students.find((s) => s.value === studentId);
  }, [students, studentId]);

  // Parse all programs from comma-separated string
  const studentPrograms = useMemo(() => {
    if (!selectedStudent?.program) return [];
    return selectedStudent.program
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
  }, [selectedStudent]);

  const hasMultiplePrograms = studentPrograms.length > 1;

  // Auto-select first program when student changes
  React.useEffect(() => {
    if (studentId && studentPrograms.length > 0) {
      const frame = window.requestAnimationFrame(() => {
        setSelectedProgram(studentPrograms[0]);
      });
      return () => window.cancelAnimationFrame(frame);
    } else {
      const frame = window.requestAnimationFrame(() => {
        setSelectedProgram('');
      });
      return () => window.cancelAnimationFrame(frame);
    }
  }, [studentId, studentPrograms]);

  const studentProgram = selectedProgram || studentPrograms[0] || '';
  const isBeltBased = checkBeltBased(studentProgram);
  const isLevelBased = checkLevelBased(studentProgram);
  const discipline = getDiscipline(studentProgram);

  // Filter belts/levels by student's SELECTED program
  const filteredBelts = useMemo(() => {
    if (!studentId || !studentProgram) return [];

    if (isBeltBased) {
      const matched = belts.filter((belt) => {
        const beltDiscipline = belt.discipline?.toLowerCase();
        const program = studentProgram.toLowerCase();
        return (
          beltDiscipline === program ||
          (program === 'grappling' && beltDiscipline === 'bjj') ||
          (program === 'bjj' && beltDiscipline === 'grappling')
        );
      });
      // If no discipline-specific belts found, try general
      if (matched.length === 0) {
        return belts.filter(
          (belt) => belt.discipline === 'general' || !belt.discipline
        );
      }
      return matched;
    }

    if (isLevelBased) {
      const matchingLevels = disciplineLevels.filter(
        (dl) => dl.discipline.toLowerCase() === studentProgram.toLowerCase()
      );
      if (matchingLevels.length > 0) {
        return matchingLevels
          .sort((a, b) => a.order - b.order)
          .map((dl) => ({
            label: dl.label,
            value: dl.value,
            color: undefined,
            discipline: dl.discipline,
          }));
      }
    }

    // Unknown discipline - show general belts as fallback
    return belts.filter(
      (belt) => belt.discipline === 'general' || !belt.discipline
    );
  }, [
    belts,
    disciplineLevels,
    studentId,
    studentProgram,
    isBeltBased,
    isLevelBased,
  ]);

  const studentPlaceholder =
    students.length === 0 ? 'No students found' : 'Select student';

  const beltPlaceholder = useMemo(() => {
    if (!studentId) return 'Select a student first';
    if (!selectedProgram) return 'Select a program first';
    if (filteredBelts.length === 0)
      return `No ${isBeltBased ? 'belts' : 'levels'} for ${studentProgram}`;
    return isBeltBased ? 'Select belt' : 'Select level';
  }, [
    studentId,
    selectedProgram,
    filteredBelts.length,
    isBeltBased,
    studentProgram,
  ]);

  const resetForm = () => {
    setStudentId('');
    setBeltId('');
    setStatus('needs_work');
    setError(null);
    setSelectedProgram('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!studentId || !beltId) {
      setError(
        `Choose both a student and a ${isBeltBased ? 'belt' : 'level'}.`
      );
      return;
    }
    if (!selectedProgram) {
      setError('Choose a program for this progression assignment.');
      return;
    }
    setError(null);
    await onSubmit({
      studentId,
      beltLevelId: beltId,
      status,
      selectedProgram,
      isLevelBased,
    });
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Student Progression</DialogTitle>
          <DialogDescription>
            Select a student, choose their program, then assign a belt or level.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Student Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Student
            </label>
            <Select
              value={studentId}
              onValueChange={(v) => {
                const selected = students.find(
                  (student) => student.value === v
                );
                const parsedPrograms = (selected?.program || '')
                  .split(',')
                  .map((programName) => programName.trim())
                  .filter(Boolean);

                setStudentId(v);
                setBeltId('');
                setSelectedProgram('');
                onStudentSelectionDebug?.({
                  studentId: v,
                  parsedPrograms,
                });
              }}
            >
              <SelectTrigger disabled={students.length === 0}>
                <SelectValue placeholder={studentPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.value} value={student.value}>
                    {student.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Program Selection - always show when student has programs */}
          {studentId && studentPrograms.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Program{' '}
                {hasMultiplePrograms && (
                  <span className="text-muted-foreground text-xs">
                    (multi-enrolled)
                  </span>
                )}
              </label>
              <Select
                value={selectedProgram}
                onValueChange={(v) => {
                  setSelectedProgram(v);
                  setBeltId('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose program" />
                </SelectTrigger>
                <SelectContent>
                  {studentPrograms.map((prog) => {
                    const disc = getDiscipline(prog);
                    return (
                      <SelectItem key={prog} value={prog}>
                        {prog}
                        {disc && (
                          <span className="text-muted-foreground ml-1">
                            ({disc.type === 'belt' ? 'Belt' : 'Level'})
                          </span>
                        )}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {hasMultiplePrograms && (
                <p className="text-xs text-muted-foreground">
                  Select the program to assign progression for.
                </p>
              )}
            </div>
          )}

          {/* Discipline info */}
          {studentId && selectedProgram && discipline && (
            <Alert className="bg-muted/50 border-primary/20">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                <span className="font-medium">{discipline.name}</span>
                {' — '}
                {discipline.type === 'belt' ? (
                  <span className="text-muted-foreground">
                    Belt-based progression
                    {discipline.has_stripes ? ' (with stripes)' : ''}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Level-based progression
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Belt / Level Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {isBeltBased ? 'Belt Level' : 'Training Level'}
            </label>
            <Select
              value={beltId}
              onValueChange={setBeltId}
              disabled={
                !studentId || !selectedProgram || filteredBelts.length === 0
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={beltPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {filteredBelts.map((belt) => (
                  <SelectItem key={belt.value} value={belt.value}>
                    <div className="flex items-center gap-2">
                      {isBeltBased ? (
                        <Award className="h-4 w-4" />
                      ) : (
                        <Layers className="h-4 w-4" />
                      )}
                      {belt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {studentId && selectedProgram && filteredBelts.length === 0 && (
              <p className="text-xs text-amber-600">
                No {isBeltBased ? 'belts' : 'levels'} configured for{' '}
                {studentProgram}. Set them up in Disciplines →{' '}
                {isBeltBased ? 'Belt Setup' : 'Levels'}.
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Status
            </label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as ProgressStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !studentId || !beltId}>
              {loading ? 'Saving…' : 'Assign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
