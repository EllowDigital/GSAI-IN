/**
 * Utilities for robustly determining and aggregating fee statuses and financial stats
 */

export type FeeRow = {
  monthly_fee?: number;
  paid_amount?: number;
  balance_due?: number;
  status?: string | null;
  [key: string]: any;
};

/**
 * Normalize fee values to ensure safe numeric operations
 */
function normalizeFee(fee: FeeRow) {
  return {
    monthly: Number(fee.monthly_fee ?? 0),
    paid: Number(fee.paid_amount ?? 0),
    balance: Number(fee.balance_due ?? 0),
    status: (fee.status ?? '').toLowerCase(),
  };
}

/**
 * Determines the fee payment status for a single fee record
 */
export function getFeeStatus(fee: FeeRow): 'paid' | 'partial' | 'unpaid' {
  const { monthly, paid } = normalizeFee(fee);

  if (monthly <= 0) return 'paid'; // No fee due
  if (paid >= monthly) return 'paid';
  if (paid > 0 && paid < monthly) return 'partial';
  return 'unpaid';
}

/**
 * Aggregates fee statistics: paid, partial, and overdue amounts and counts
 */
export function summarizeFees(fees: FeeRow[]) {
  let paidAmount = 0;
  let partialAmount = 0;
  let overdueAmount = 0;
  let paidCount = 0;
  let partialCount = 0;
  let overdueCount = 0;

  for (const fee of fees) {
    const status = getFeeStatus(fee);
    const { monthly, paid } = normalizeFee(fee);

    switch (status) {
      case 'paid':
        paidAmount += paid;
        paidCount++;
        break;

      case 'partial':
        partialAmount += paid;
        overdueAmount += monthly - paid;
        partialCount++;
        overdueCount++;
        break;

      case 'unpaid':
      default:
        overdueAmount += monthly;
        overdueCount++;
        break;
    }
  }

  return {
    paidAmount,
    partialAmount,
    overdueAmount,
    paidCount,
    partialCount,
    overdueCount,
  };
}

/**
 * Returns human-readable status with associated Tailwind CSS class
 */
export function getStatusTextAndColor(status: string): [string, string] {
  const normalized = status?.toLowerCase();

  switch (normalized) {
    case 'paid':
      return ['Paid', 'bg-green-100 text-green-700'];
    case 'partial':
      return ['Partial', 'bg-yellow-100 text-yellow-700'];
    case 'unpaid':
    default:
      return ['Unpaid', 'bg-red-100 text-red-700'];
  }
}
