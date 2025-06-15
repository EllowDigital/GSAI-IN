
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

export function FeeForm({ student, fee, carryForward, month, year, adminDebug, loading, setLoading, onClose }: Props) {
  const form = useForm<{
    monthly_fee: number;
    paid_amount: number;
    notes: string;
  }>({
    defaultValues: {
      monthly_fee: fee?.monthly_fee ?? student?.default_monthly_fee ?? 2000,
      paid_amount: fee?.paid_amount ?? 0,
      notes: fee?.notes ?? "",
    }
  });

  useEffect(() => {
    form.reset({
      monthly_fee: fee?.monthly_fee ?? student?.default_monthly_fee ?? 2000,
      paid_amount: fee?.paid_amount ?? 0,
      notes: fee?.notes ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fee, student]);

  const monthly_fee = Number(form.watch("monthly_fee") || 0);
  const paid_amount = Number(form.watch("paid_amount") || 0);

  const calcBalance = () => {
    let bal = monthly_fee + (carryForward || 0) - paid_amount;
    if (bal < 0) bal = 0;
    return bal;
  };

  async function onSubmit(values: { monthly_fee: number; paid_amount: number; notes: string }) {
    if (!adminDebug?.canSubmitFeeEdits) {
      toast({
        title: "No admin access.",
        description: "Your admin email is not authorized. Please ask a system administrator.",
        variant: "error"
      });
      return;
    }
    if (!student || typeof student.id !== "string") {
      toast({
        title: "Student data missing",
        description: "Cannot save fee record without a valid student.",
        variant: "error"
      });
      return;
    }
    if (paid_amount > (monthly_fee + carryForward)) {
      toast({
        title: "Invalid Paid Amount",
        description: "Paid cannot exceed monthly fee + carry-forward!",
        variant: "error"
      });
      return;
    }
    setLoading(true);

    const now = new Date().toISOString();

    const basePayload = {
      student_id: student.id,
      month,
      year,
      monthly_fee,
      paid_amount,
      balance_due: calcBalance(),
      notes: values.notes || null,
      updated_at: now
    };

    const payload = fee && fee.id
      ? { ...basePayload }
      : { ...basePayload, created_at: now };

    // Debug output
    console.log("[FEE DEBUG SUBMIT]", {
      adminDebug,
      payload,
      student,
      fee,
      month,
      year,
      paid_amount,
      carryForward
    });

    let result, error;

    if (fee && fee.id) {
      ({ error, data: result } = await supabase
        .from("fees")
        .update(payload)
        .eq("id", fee.id)
        .select()
        .maybeSingle());
    } else {
      ({ error, data: result } = await supabase
        .from("fees")
        .upsert([payload], { onConflict: 'student_id,month,year' })
        .select()
        .maybeSingle());
    }
    setLoading(false);

    if (error) {
      console.log("[FEE SUPABASE ERROR]", error);
      toast({
        title: "Failed to save fee",
        description: (error.message || "") + " (see console for RLS info)",
        variant: "error"
      });
    } else {
      toast({
        title: "Fee saved!",
        description: "The fee record has been saved successfully."
      });
      onClose();
    }
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <span className="block font-bold text-sm">Student: {student?.name}</span>
      </div>
      <div>
        <label className="text-xs font-semibold">Month</label>
        <Input value={month} readOnly className="bg-gray-100" />
      </div>
      <div>
        <label className="text-xs font-semibold">Year</label>
        <Input value={year} readOnly className="bg-gray-100" />
      </div>
      <div>
        <label className="text-xs font-semibold">Monthly Fee</label>
        <Input
          type="number"
          {...form.register("monthly_fee", { required: true, min: 0, valueAsNumber: true })}
          disabled={!adminDebug?.canSubmitFeeEdits}
        />
      </div>
      <div>
        <label className="text-xs font-semibold">Paid Amount</label>
        <Input
          type="number"
          {...form.register("paid_amount", { required: true, min: 0, valueAsNumber: true })}
          disabled={!adminDebug?.canSubmitFeeEdits}
        />
      </div>
      {carryForward ? (
        <div className="text-xs text-yellow-800">
          Carried forward balance: <strong>₹{carryForward}</strong>
        </div>
      ) : null}
      <div>
        <label className="text-xs font-semibold">Notes</label>
        <Input {...form.register("notes")} disabled={!adminDebug?.canSubmitFeeEdits} />
      </div>
      <div>
        <span className="font-semibold text-xs">Balance:</span>{" "}
        <span className="font-bold text-lg">{calcBalance()}</span>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={loading || !adminDebug?.canSubmitFeeEdits}>
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Save"}
        </Button>
      </div>
    </form>
  );
}
