import React, { useMemo, useState, useEffect } from 'react';
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
import {
  isBeltDiscipline,
  isLevelDiscipline,
  getDisciplineConfig,
} from '@/config/disciplineConfig';
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

interface AssignStudentBeltDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: StudentOption[];
  belts: BeltOption[];
  onSubmit: (payload: {
    studentId: string;
    beltLevelId: string;
    status: ProgressStatus;
  }) => Promise<void>;
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
  onSubmit,
  loading,
}: AssignStudentBeltDialogProps) {
  const [studentId, setStudentId] = useState('');
  const [beltId, setBeltId] = useState('');
  const [status, setStatus] = useState<ProgressStatus>('needs_work');
  const [error, setError] = useState<string | null>(null);

  // Get selected student's program/discipline
  const selectedStudent = useMemo(() => {
    return students.find((s) => s.value === studentId);
  }, [students, studentId]);

  const studentProgram = selectedStudent?.program ?? '';
  const isBeltBased = isBeltDiscipline(studentProgram);
  const isLevelBased = isLevelDiscipline(studentProgram);
  const disciplineConfig = getDisciplineConfig(studentProgram);

  // Filter belts by student's discipline
  const filteredBelts = useMemo(() => {
    if (!studentId || !studentProgram) return belts;

    // For belt-based disciplines, filter to matching discipline or general
    if (isBeltBased) {
      return belts.filter((belt) => {
        const beltDiscipline = belt.discipline?.toLowerCase();
        const program = studentProgram.toLowerCase();
        // Match exact discipline or use general fallback
        return (
          beltDiscipline === program ||
          beltDiscipline === 'general' ||
          (program === 'grappling' && beltDiscipline === 'bjj') ||
          (program === 'bjj' && beltDiscipline === 'grappling')
        );
      });
    }

    // For level-based disciplines, show general belts as fallback
    return belts.filter(
      (belt) => belt.discipline === 'general' || !belt.discipline
    );
  }, [belts, studentId, studentProgram, isBeltBased]);

  // Note: belt selection is reset when the student is changed in the handler below.

  const studentPlaceholder = useMemo(() => {
    if (students.length === 0) {
      return 'No students found';
    }
    return 'Select student';
  }, [students.length]);

  const beltPlaceholder = useMemo(() => {
    if (!studentId) {
      return 'Select a student first';
    }
    if (filteredBelts.length === 0) {
      return `No ${isBeltBased ? 'belts' : 'levels'} for ${studentProgram}`;
    }
    return isBeltBased ? 'Select belt' : 'Select level';
  }, [studentId, filteredBelts.length, isBeltBased, studentProgram]);

  const resetForm = () => {
    setStudentId('');
    setBeltId('');
    setStatus('needs_work');
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!studentId || !beltId) {
      setError(
        `Choose both a student and a ${isBeltBased ? 'belt' : 'level'}.`
      );
      return;
    }

    setError(null);
    await onSubmit({ studentId, beltLevelId: beltId, status });
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          resetForm();
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Student Progression</DialogTitle>
          <DialogDescription>
            Select a student to see their discipline-specific belts or levels.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Student
            </label>
            <Select
              value={studentId}
              onValueChange={(v) => {
                setStudentId(v);
                setBeltId('');
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

          {/* Discipline info when student is selected */}
          {studentId && disciplineConfig && (
            <Alert className="bg-muted/50 border-primary/20">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                <span className="font-medium">{disciplineConfig.name}</span>
                {' — '}
                {disciplineConfig.type === 'belt' ? (
                  <span className="text-muted-foreground">
                    Belt-based progression
                    {disciplineConfig.hasStripes && ' (with stripes)'}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Level-based progression (no belts)
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Level-based discipline warning */}
          {studentId && isLevelBased && (
            <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
              <Layers className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-700 dark:text-amber-400">
                {studentProgram} uses level-based progression.
                {disciplineConfig?.levels && (
                  <span> Levels: {disciplineConfig.levels.join(' → ')}</span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {isBeltBased ? 'Belt Level' : 'Training Level'}
            </label>
            <Select
              value={beltId}
              onValueChange={setBeltId}
              disabled={!studentId || filteredBelts.length === 0}
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
            {studentId && filteredBelts.length === 0 && isBeltBased && (
              <p className="text-xs text-muted-foreground">
                No belts configured for {studentProgram}. Using general belts.
              </p>
            )}
          </div>

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

          {error && <p className="text-sm text-red-600">{error}</p>}

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
            <Button type="submit" disabled={loading || !studentId}>
              {loading ? 'Saving…' : 'Assign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
