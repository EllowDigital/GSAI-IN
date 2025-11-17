import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProgressStatus } from '@/hooks/useProgressionQuery';

interface Option {
  label: string;
  value: string;
  description?: string;
}

interface AssignStudentBeltDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Option[];
  belts: Option[];
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

  const studentPlaceholder = useMemo(() => {
    if (students.length === 0) {
      return 'No students found';
    }
    return 'Select student';
  }, [students.length]);

  const beltPlaceholder = useMemo(() => {
    if (belts.length === 0) {
      return 'No belts configured';
    }
    return 'Select belt';
  }, [belts.length]);

  const resetForm = () => {
    setStudentId('');
    setBeltId('');
    setStatus('needs_work');
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!studentId || !beltId) {
      setError('Choose both a student and a belt level.');
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
          <DialogTitle>Assign student to a belt</DialogTitle>
          <DialogDescription>
            Pick any rostered student, choose their current belt, and optionally
            set their initial status before they appear on the progression board.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Student
            </label>
            <Select value={studentId} onValueChange={setStudentId}>
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Belt level
            </label>
            <Select value={beltId} onValueChange={setBeltId}>
              <SelectTrigger disabled={belts.length === 0}>
                <SelectValue placeholder={beltPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {belts.map((belt) => (
                  <SelectItem key={belt.value} value={belt.value}>
                    {belt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Status
            </label>
            <Select value={status} onValueChange={(value) => setStatus(value as ProgressStatus)}>
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Assign' }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
