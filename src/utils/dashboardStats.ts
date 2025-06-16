/**
 * Admin Dashboard Utility Functions
 * ---------------------------------
 * Handles data aggregation, validation, and summarization for key dashboard metrics.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/* -------------------------- Types for DB Records -------------------------- */

export type Fee = {
  paid_amount?: number;
  status?: string;
  monthly_fee?: number;
  balance_due?: number;
  student_id?: string;
  [key: string]: any;
};

export type Student = {
  id?: string;
  program?: string;
  [key: string]: any;
};

export type Blog = {
  title?: string;
  published_at?: string;
};

export type News = {
  title?: string;
  date?: string;
};

export type GalleryImage = {
  id?: string;
};

export type Event = {
  title?: string;
  date?: string;
};

/* -------------------------- Fee Aggregation Logic -------------------------- */

/**
 * Aggregates fee information to calculate totals for paid, unpaid, and partial payments.
 */
export function aggregateFees(fees: Fee[] = []) {
  let totalFees = 0;
  let fullyPaidTotal = 0;
  let partiallyPaidTotal = 0;
  let unpaidCount = 0;

  for (const fee of fees) {
    if (!fee) continue;

    totalFees++;

    const paid = Number(fee.paid_amount || 0);
    const due = Number(fee.monthly_fee || 0) + Number(fee.balance_due || 0);
    const status = String(fee.status || '').toLowerCase();

    if (status === 'paid' || paid >= due) {
      fullyPaidTotal += paid;
    } else if (status === 'partial' && paid > 0) {
      partiallyPaidTotal += paid;
    } else {
      unpaidCount++;
    }
  }

  return {
    total: totalFees,
    paidSum: fullyPaidTotal,
    partialSum: partiallyPaidTotal,
    unpaidCount,
  };
}

/* ---------------------- Student Distribution by Program --------------------- */

/**
 * Counts students grouped by their program name.
 */
export function studentsByProgram(students: Student[] = []) {
  const byProgram: Record<string, number> = {};
  let total = 0;

  for (const student of students) {
    if (!student?.program) continue;

    const program = student.program;
    byProgram[program] = (byProgram[program] || 0) + 1;
    total++;
  }

  return { byProgram, total };
}

/* ------------------------ General Dashboard Helpers ------------------------ */

/**
 * Extracts the latest X titles from an array of objects with optional `title` property.
 */
export function getLatestTitlesAll<T extends { title?: string }>(
  arr: T[] = [],
  count: number = 3
): string[] {
  return (arr || [])
    .slice(0, count)
    .map((item) => item?.title || '')
    .filter(Boolean);
}

/**
 * Safely returns count of items in an array (handles null/undefined).
 */
export function safeCount(arr: any[] | null | undefined): number {
  return Array.isArray(arr) ? arr.length : 0;
}

/**
 * Returns the first upcoming event title (sorted by date), or null if none found.
 */
export function getNextEvent(events: Event[] = []): string | null {
  const now = new Date();

  for (const event of events) {
    const eventDate = event?.date ? new Date(event.date) : null;

    if (eventDate && eventDate >= now) {
      return event.title ? `${event.title} (${event.date})` : event.date;
    }
  }

  return null;
}
