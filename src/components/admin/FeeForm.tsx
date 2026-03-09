import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, IndianRupee, Receipt, StickyNote, Tag } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FeeReceiptUploader } from './FeeReceiptUploader';
import { getFeeStatus } from '@/utils/feeStatusUtils';
import { safeAsync, formatErrorForDisplay } from '@/utils/errorHandling';

type Props = {
  student: any;
  fee: any | null;
  carryForward: number;
  month: number;
  year: number;
  adminDebug?: {
    adminEmail?: string | null;
    isAdminInTable?: boolean | null;
    canSubmitFeeEdits?: boolean;
  };
  loading: boolean;
  setLoading: (v: boolean) => void;
  onClose: () => void;
};

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function FeeForm({
  student,
  fee,
  carryForward,
  month,
  year,
  adminDebug,
  loading,
  setLoading,
  onClose,
}: Props) {
  // Fetch program-specific fee from academy_settings
  const { data: programFeeValue } = useQuery({
    queryKey: ['academy-settings', `program_fee_${student?.program}`],
    queryFn: async () => {
      if (!student?.program) return null;
      const { data } = await supabase
        .from('academy_settings')
        .select('value')
        .eq('key', `program_fee_${student.program}`)
        .maybeSingle();
      return data?.value ? Number(data.value) : null;
    },
    enabled: !!student?.program,
  });

  // Priority: student's own default_monthly_fee > program fee from settings > 2000
  const baseFee = student?.default_monthly_fee ?? programFeeValue ?? 2000;
  const programBaseFee = programFeeValue ?? 2000;
  const discountPercent = student?.discount_percent ?? 0;
  const discountedFee =
    discountPercent > 0
      ? Math.round(baseFee * (1 - discountPercent / 100))
      : baseFee;

  const form = useForm<{
    monthly_fee: number;
    paid_amount: number;
    notes: string;
    receipt_url: string | null;
    status_override: string;
  }>({
    defaultValues: {
      monthly_fee: fee?.monthly_fee ?? discountedFee,
      paid_amount: fee?.paid_amount ?? 0,
      notes: fee?.notes ?? '',
      receipt_url: fee?.receipt_url || null,
      status_override: fee?.status || 'auto',
    },
  });

  // Reset form when fee/student/programFee changes
  React.useEffect(() => {
    const effectiveFee = fee?.monthly_fee ?? discountedFee;
    form.reset({
      monthly_fee: effectiveFee,
      paid_amount: fee?.paid_amount ?? 0,
      notes: fee?.notes ?? '',
      receipt_url: fee?.receipt_url || null,
      status_override: fee?.status || 'auto',
    });
  }, [fee, student, discountedFee]);

  const receiptUrlWatched = useWatch({
    control: form.control,
    name: 'receipt_url',
    defaultValue: form.getValues('receipt_url'),
  });

  const monthlyFeeWatched = useWatch({
    control: form.control,
    name: 'monthly_fee',
    defaultValue: form.getValues('monthly_fee'),
  });
  const paidAmountWatched = useWatch({
    control: form.control,
    name: 'paid_amount',
    defaultValue: form.getValues('paid_amount'),
  });
  const statusOverrideWatched = useWatch({
    control: form.control,
    name: 'status_override',
    defaultValue: form.getValues('status_override'),
  });

  const monthly_fee = Number(monthlyFeeWatched || 0);
  const paid_amount = Number(paidAmountWatched || 0);

  const calcBalance = () => {
    let bal = monthly_fee + (carryForward || 0) - paid_amount;
    if (bal < 0) bal = 0;
    return bal;
  };

  const autoStatus = getFeeStatus({
    monthly_fee,
    paid_amount,
    balance_due: calcBalance(),
  });

  const effectiveStatus =
    statusOverrideWatched === 'auto' ? autoStatus : statusOverrideWatched;

  async function onSubmit(values: {
    monthly_fee: number;
    paid_amount: number;
    notes: string;
    receipt_url?: string | null;
    status_override: string;
  }) {
    if (!student || typeof student.id !== 'string') {
      toast({
        title: 'Student data missing',
        description: 'Cannot save fee record without a valid student.',
        variant: 'error',
      });
      return;
    }
    if (paid_amount > monthly_fee + carryForward) {
      toast({
        title: 'Invalid Paid Amount',
        description:
          'Paid amount cannot exceed monthly fee plus carry-forward balance.',
        variant: 'error',
      });
      return;
    }
    if (monthly_fee < 0 || paid_amount < 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Monthly fee and paid amount must be non-negative.',
        variant: 'error',
      });
      return;
    }

    setLoading(true);
    const { data: result, error } = await safeAsync(async () => {
      const now = new Date().toISOString();
      const basePayload = {
        student_id: student.id,
        month,
        year,
        monthly_fee,
        paid_amount,
        balance_due: calcBalance(),
        notes: values.notes?.trim() || null,
        receipt_url: values.receipt_url ?? null,
        updated_at: now,
        status:
          values.status_override === 'auto'
            ? autoStatus
            : values.status_override,
      };
      const payload =
        fee && fee.id
          ? { ...basePayload }
          : { ...basePayload, created_at: now };

      if (fee && fee.id) {
        const { data, error } = await supabase
          .from('fees')
          .update(payload)
          .eq('id', fee.id)
          .select()
          .maybeSingle();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('fees')
          .upsert([payload], { onConflict: 'student_id,month,year' })
          .select()
          .maybeSingle();
        if (error) throw error;
        return data;
      }
    }, 'Fee Form Submission');

    setLoading(false);
    if (error) {
      toast({
        title: 'Failed to save fee',
        description: formatErrorForDisplay(error),
        variant: 'error',
      });
    } else {
      toast({
        title: 'Fee saved successfully',
        description: `Fee record for ${student.name} has been ${fee?.id ? 'updated' : 'created'}.`,
      });
      onClose();
    }
  }

  const handleReceiptUploaded = (url: string | null) => {
    form.setValue('receipt_url', url ?? '');
  };

  const statusColor =
    {
      paid: 'bg-green-100 text-green-800 border-green-200',
      partial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      unpaid: 'bg-red-100 text-red-800 border-red-200',
    }[effectiveStatus] || 'bg-muted text-muted-foreground border-border';

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      {/* Student Info Header */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
        {student?.profile_image_url ? (
          <img
            src={student.profile_image_url}
            alt=""
            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {student?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">
            {student?.name}
          </p>
          <p className="text-xs text-muted-foreground">{student?.program}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-medium text-muted-foreground">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          {discountPercent > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <Tag className="w-3 h-3 text-green-600" />
              <span className="text-xs font-medium text-green-600">
                {discountPercent}% off
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Fee Breakdown Info */}
      <div className="space-y-2">
        {programFeeValue && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs">
            <IndianRupee className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span className="text-blue-800">
              {student?.program} program fee:{' '}
              <strong>₹{programBaseFee.toLocaleString('en-IN')}/month</strong>
            </span>
          </div>
        )}
        {discountPercent > 0 && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-50 border border-green-200 text-xs">
            <Tag className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            <span className="text-green-800">
              Base ₹{baseFee.toLocaleString('en-IN')} →{' '}
              <strong>₹{discountedFee.toLocaleString('en-IN')}</strong> after{' '}
              {discountPercent}% discount
            </span>
          </div>
        )}
      </div>

      {/* Fee Amounts */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-muted-foreground" />
            Monthly Fee
          </label>
          <Input
            type="number"
            {...form.register('monthly_fee', {
              required: true,
              min: 0,
              valueAsNumber: true,
            })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-green-600" />
            Paid Amount
          </label>
          <Input
            type="number"
            {...form.register('paid_amount', {
              required: true,
              min: 0,
              valueAsNumber: true,
            })}
          />
        </div>
      </div>

      {/* Carry Forward */}
      {carryForward > 0 && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-yellow-50 border border-yellow-200 text-xs">
          <span className="text-yellow-800">
            ⚠️ Carried forward from previous month:{' '}
            <strong>₹{carryForward.toLocaleString('en-IN')}</strong>
          </span>
        </div>
      )}

      {/* Balance & Status Preview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-muted/50 border border-border/50 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Balance Due
          </p>
          <p
            className={`text-xl font-bold mt-1 ${calcBalance() > 0 ? 'text-destructive' : 'text-green-600'}`}
          >
            ₹{calcBalance().toLocaleString('en-IN')}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-muted/50 border border-border/50 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Status
          </p>
          <div className="mt-1.5 flex justify-center">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor}`}
            >
              {effectiveStatus === 'paid' && '✅ '}
              {effectiveStatus === 'partial' && '⚠️ '}
              {effectiveStatus === 'unpaid' && '❌ '}
              {effectiveStatus.charAt(0).toUpperCase() +
                effectiveStatus.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Status Override */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground">
          Status Override
        </label>
        <Select
          value={form.watch('status_override')}
          onValueChange={(v) => form.setValue('status_override', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto (based on amounts)</SelectItem>
            <SelectItem value="paid">✅ Paid</SelectItem>
            <SelectItem value="partial">⚠️ Partial</SelectItem>
            <SelectItem value="unpaid">❌ Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <StickyNote className="w-3.5 h-3.5 text-muted-foreground" />
          Notes
        </label>
        <Input {...form.register('notes')} placeholder="Optional notes..." />
      </div>

      {/* Receipt */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
          Receipt File
        </label>
        <FeeReceiptUploader
          feeId={fee?.id || 'temp'}
          initialUrl={receiptUrlWatched}
          onUploaded={handleReceiptUploaded}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="min-w-[80px]">
          {loading ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : fee?.id ? (
            'Update'
          ) : (
            'Save'
          )}
        </Button>
      </div>
    </form>
  );
}
