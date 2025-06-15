
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

// Returns the status for a given fee row, based on paid amount versus monthly fee
export function getFeeStatus(fee: FeeRow): "paid" | "partial" | "unpaid" {
  const monthlyFee = Number(fee.monthly_fee ?? 0);
  const paidAmount = Number(fee.paid_amount ?? 0);

  // If fee is 0 or negative, consider it paid.
  if (monthlyFee <= 0) {
    return "paid";
  }

  if (paidAmount >= monthlyFee) {
    return "paid";
  }
  if (paidAmount > 0 && paidAmount < monthlyFee) {
    return "partial";
  }
  return "unpaid";
}

// Returns clearer and more accurate stats for paid, partial, and overdue fees
export function summarizeFees(fees: FeeRow[]) {
  let paidAmount = 0; // Total money from fully paid fees
  let partialAmount = 0; // Total money from partially paid fees
  let overdueAmount = 0; // Total money pending/due
  let paidCount = 0;
  let partialCount = 0;
  let overdueCount = 0; // Count of students with outstanding balance

  fees.forEach(fee => {
    const status = getFeeStatus(fee);
    const monthlyFee = Number(fee.monthly_fee ?? 0);
    const paid = Number(fee.paid_amount ?? 0);
    
    if (status === "paid") {
      paidAmount += paid;
      paidCount += 1;
    } else if (status === "partial") {
      partialAmount += paid;
      partialCount += 1;
      
      overdueAmount += monthlyFee - paid;
      overdueCount += 1;
    } else { // unpaid
      overdueAmount += monthlyFee;
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
