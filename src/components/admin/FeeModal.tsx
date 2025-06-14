
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUpsertFee } from "@/hooks/useFees";
import { toast } from "@/components/ui/sonner";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

type FeeModalProps = {
  open: boolean;
  onClose: () => void;
  fee?: any;
  student?: any;
  month?: number | string;
  year?: number | string;
};

export default function FeeModal({ open, onClose, fee, student, month, year }: FeeModalProps) {
  const upsert = useUpsertFee();
  const { register, setValue, handleSubmit, reset, watch, formState } = useForm({
    defaultValues: {
      month: month ?? fee?.month ?? new Date().getMonth() + 1,
      year: year ?? fee?.year ?? new Date().getFullYear(),
      monthly_fee: fee?.monthly_fee ?? student?.default_monthly_fee ?? 2000,
      paid_amount: fee?.paid_amount ?? "",
      notes: fee?.notes ?? "",
    },
  });

  useEffect(() => {
    reset({
      month: month ?? fee?.month ?? new Date().getMonth() + 1,
      year: year ?? fee?.year ?? new Date().getFullYear(),
      monthly_fee: fee?.monthly_fee ?? student?.default_monthly_fee ?? 2000,
      paid_amount: fee?.paid_amount ?? "",
      notes: fee?.notes ?? "",
    });
  }, [open, fee, student, month, year, reset]);

  const calcBalance = () => {
    // If editing, carry forward previous balance here if needed via prop
    const mf = Number(watch("monthly_fee") || 0);
    const paid = Number(watch("paid_amount") || 0);
    let balance = mf - paid;
    if (balance < 0) balance = 0;
    return balance;
  };

  const onSubmit = async (values) => {
    if (values.paid_amount > values.monthly_fee) {
      toast.error("Paid amount cannot exceed the monthly fee.");
      return;
    }
    upsert.mutate(
      {
        ...values,
        student_id: student.id,
        balance_due: calcBalance(),
        id: fee?.id,
      },
      {
        onSuccess: () => {
          toast.success("Fee saved!");
          onClose();
        },
        onError: (e: any) => toast.error(e?.message || "Failed to save fee."),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{fee ? "Edit Payment" : "Add Payment"}</DialogTitle>
          <DialogDescription>
            Student: <span className="font-bold">{student?.name}</span>
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex gap-2">
            <div>
              <label className="text-xs font-semibold">Month</label>
              <Input
                {...register("month", { required: true, min: 1, max: 12 })}
                type="number"
                min={1}
                max={12}
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Year</label>
              <Input
                {...register("year", { required: true, min: 2023, max: 2100 })}
                type="number"
                min={2023}
                max={2100}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold">Monthly Fee</label>
            <Input
              {...register("monthly_fee", { required: true, min: 0 })}
              type="number"
              min={0}
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Paid Amount</label>
            <Input
              {...register("paid_amount", { required: true, min: 0 })}
              type="number"
              min={0}
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Notes</label>
            <Input {...register("notes")} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700 text-xs">Balance:</span>
              <span className="font-bold text-lg">{calcBalance()}</span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={upsert.isPending}>
              {upsert.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
