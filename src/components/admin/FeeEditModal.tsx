import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function FeeEditModal({
  open,
  onClose,
  student,
  fee,
  month,
  year,
  adminDebug, // Add adminDebug prop
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
      const { data } = await supabase
        .from("fees")
        .select("*")
        .eq("student_id", student.id)
        .eq("month", prevMonth)
        .eq("year", prevYear)
        .maybeSingle();
      const balance = data && data.status !== "paid" ? (data.balance_due || 0) : 0;
      setCarryForward(balance || 0);
    }
    fetchPrevious();
  }, [student?.id, month, year, open]);

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
  }, [fee, student, open]);

  const monthly_fee = Number(form.watch("monthly_fee") || 0);
  const paid_amount = Number(form.watch("paid_amount") || 0);

  const calcBalance = () => {
    let bal = monthly_fee + (carryForward || 0) - paid_amount;
    if (bal < 0) bal = 0;
    return bal;
  };

  async function onSubmit(values: { monthly_fee: number; paid_amount: number; notes: string }) {
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
    let result, error;

    // Always include all required fields in payload
    const basePayload = {
      student_id: student.id,
      month,
      year,
      monthly_fee,
      paid_amount,
      balance_due: calcBalance(),
      notes: values.notes || null,
      updated_at: new Date().toISOString()
    };

    let payload;
    if (fee && fee.id) {
      // For update: send all required fields!
      payload = {
        ...basePayload,
      };
      // created_at excluded/unchanged
    } else {
      // For create/upsert: need created_at and all required fields
      payload = {
        ...basePayload,
        created_at: new Date().toISOString()
      };
    }
    console.log("[DEBUG] Submitting fee payload:", payload);

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
      console.log("[DEBUG] Supabase error during fee save:", error);
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{fee ? "Edit Payment" : "Add Payment"}</DialogTitle>
        </DialogHeader>

        {/* ADD DEBUG UI */}
        <div className="mb-2">
          <span className="text-[11px] text-gray-500">
            <b>Admin Debug:</b>{" "}
            Email: <span className="font-bold">{adminDebug?.adminEmail || "N/A"}</span>
            {" | "}In admin_users: <span className="font-bold">{adminDebug?.isAdminInTable ? "✅" : "❌"}</span>
            {" | "}canSubmitFeeEdits: <span className="font-bold">{adminDebug?.canSubmitFeeEdits ? "✅" : "❌"}</span>
          </span>
        </div>

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
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Paid Amount</label>
            <Input
              type="number"
              {...form.register("paid_amount", { required: true, min: 0, valueAsNumber: true })}
            />
          </div>
          {carryForward ? (
            <div className="text-xs text-yellow-800">
              Carried forward balance: <strong>₹{carryForward}</strong>
            </div>
          ) : null}
          <div>
            <label className="text-xs font-semibold">Notes</label>
            <Input {...form.register("notes")} />
          </div>
          <div>
            <span className="font-semibold text-xs">Balance:</span>{" "}
            <span className="font-bold text-lg">{calcBalance()}</span>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || adminDebug?.canSubmitFeeEdits === false}>
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
