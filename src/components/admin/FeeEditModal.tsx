import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

import { FeeForm } from './FeeForm';
import { getFeeStatus } from '@/utils/feeStatusUtils';

export default function FeeEditModal({
  open,
  onClose,
  student,
  fee,
  month,
  year,
  adminDebug,
}: {
  open: boolean;
  onClose: () => void;
  student: any;
  fee: any | null;
  month: number;
  year: number;
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
        .maybeSingle();
      const shouldCarry = data && getFeeStatus(data) !== 'paid';
      const balance = shouldCarry ? data.balance_due || 0 : 0;
      setCarryForward(balance || 0);
    }
    fetchPrevious();
  }, [student?.id, month, year, open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{fee ? 'Edit Payment' : 'Add Payment'}</DialogTitle>
        </DialogHeader>

        <FeeForm
          student={student}
          fee={fee}
          carryForward={carryForward}
          month={month}
          year={year}
          adminDebug={adminDebug}
          loading={loading}
          setLoading={setLoading}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
