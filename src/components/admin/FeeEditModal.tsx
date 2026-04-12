import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/services/supabase/client';

import { FeeForm } from './FeeForm';
import { getFeeStatus } from '@/utils/feeStatusUtils';

export default function FeeEditModal({
  open,
  onClose,
  student,
  fee,
  month,
  year,
  programName,
  adminDebug,
}: {
  open: boolean;
  onClose: () => void;
  student: any;
  fee: any | null;
  month: number;
  year: number;
  programName?: string;
  adminDebug?: {
    adminEmail?: string | null;
    isAdminInTable?: boolean | null;
    canSubmitFeeEdits?: boolean;
  };
}) {
  const [carryForward, setCarryForward] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    async function fetchPrevious() {
      if (!student?.id) return;
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const { data, error } = await supabase
        .from('fees')
        .select('*')
        .eq('student_id', student.id)
        .eq('month', prevMonth)
        .eq('year', prevYear)
        .eq('program_name', fee?.program_name || programName || student.program || 'General')
        .maybeSingle();
      const shouldCarry = data && getFeeStatus(data) !== 'paid';
      const balance = shouldCarry ? data.balance_due || 0 : 0;
      setCarryForward(balance || 0);
    }
    fetchPrevious();
  }, [student?.id, month, year, open, fee?.program_name, programName, student?.program]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {fee ? '✏️ Edit Payment' : '➕ Add Payment'}
          </DialogTitle>
          <DialogDescription>
            Record fee payment for {student?.name || 'this student'}.
          </DialogDescription>
        </DialogHeader>

        <FeeForm
          student={student}
          fee={fee}
          carryForward={carryForward}
          month={month}
          year={year}
          initialProgramName={fee?.program_name || programName || student?.program || 'General'}
          adminDebug={adminDebug}
          loading={loading}
          setLoading={setLoading}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
