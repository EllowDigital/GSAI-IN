
/**
 * Utilities for robustly determining/aggregating fee statuses and financial stats
 */
export type FeeRow = {
  monthly_fee: number;
  paid_amount: number;
  balance_due: number;
  status?: string | null;
  [key: string]: any;
};

// Returns the status for a given fee row, using robust logic
export function getFeeStatus(fee: FeeRow): "paid" | "partial" | "unpaid" {
  const totalDue = Number(fee.monthly_fee ?? 0) + Number(fee.balance_due ?? 0);
  const paid = Number(fee.paid_amount ?? 0);

  if (paid >= totalDue && totalDue > 0) {
    return "paid";
  }
  if (paid > 0 && paid < totalDue) {
    return "partial";
  }
  return "unpaid";
}

// Returns overall paid/partial/overdue stats (amounts and counts)
export function summarizeFees(fees: FeeRow[]) {
  let paidAmount = 0, partialAmount = 0, overdueAmount = 0;
  let paidCount = 0, partialCount = 0, overdueCount = 0;

  fees.forEach(fee => {
    const status = getFeeStatus(fee);
    if (status === "paid") {
      paidAmount += Number(fee.paid_amount ?? 0);
      paidCount += 1;
    } else if (status === "partial") {
      partialAmount += Number(fee.balance_due ?? 0);
      partialCount += 1;
    } else {
      // Overdue/unpaid
      overdueAmount += Number(fee.balance_due ?? 0);
      overdueCount += 1;
    }
  });
  return {
    paidAmount,
    partialAmount,
    overdueAmount,
    paidCount,
    partialCount,
    overdueCount,
  };
}

// Human readable status (with color)
export function getStatusTextAndColor(status: string) {
  switch (status) {
    case "paid":
    case "Paid":
      return ["Paid", "bg-green-100 text-green-700"];
    case "partial":
    case "Partial":
      return ["Partial", "bg-yellow-100 text-yellow-700"];
    case "unpaid":
    case "Unpaid":
    default:
      return ["Unpaid", "bg-red-100 text-red-700"];
  }
}
