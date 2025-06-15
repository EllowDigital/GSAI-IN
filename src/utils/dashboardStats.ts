
/**
 * Utilities to aggregate, validate, and summarize all Admin Dashboard stats.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/** Interfaces for expected DB shape (loosely typed to allow partial results). */
export type Fee = { paid_amount?: number, status?: string, monthly_fee?: number, balance_due?: number, student_id?: string, [key: string]: any };
export type Student = { program?: string, id?: string, [key: string]: any };
export type Blog = { title?: string, published_at?: string };
export type News = { title?: string, date?: string };
export type GalleryImage = { id?: string };
export type Event = { title?: string, date?: string };

/**
 * Aggregate fee stats, robust and tolerant to errors
 */
export function aggregateFees(fees: Fee[] = []) {
  let paidSum = 0, unpaidCount = 0, partialSum = 0, total = 0;
  for (const f of fees) {
    if (!f) continue;
    total++;
    const paid = Number(f.paid_amount || 0);
    const due = Number(f.monthly_fee || 0) + Number(f.balance_due || 0);
    const status = String(f.status || "").toLowerCase();
    if (status === "paid" || paid >= due) paidSum += paid;
    else if (status === "partial" && paid > 0) partialSum += paid;
    else unpaidCount++;
  }
  return { total, paidSum, unpaidCount, partialSum };
}

/**
 * Aggregate students by program
 */
export function studentsByProgram(students: Student[] = []) {
  const counts: Record<string, number> = {};
  let total = 0;
  for (const s of students) {
    if (!s || !s.program) continue;
    counts[s.program] = (counts[s.program] || 0) + 1;
    total++;
  }
  return { byProgram: counts, total };
}

/**
 * Simplified: Get latest X items by property with fallback for empty/missing data
 */
export function getLatestTitlesAll<T extends { title?: string }>(arr: T[] = [], count: number = 3): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, count).map(b => b?.title || "").filter(t => t);
}

/**
 * Returns count safely for any array
 */
export function safeCount(arr: any[] | null | undefined): number {
  return Array.isArray(arr) ? arr.length : 0;
}

/**
 * Returns first upcoming event (from sorted array), or null
 */
export function getNextEvent(events: Event[] = []): string | null {
  const now = new Date();
  for (const e of events) {
    if (e && e.date && new Date(e.date) >= now) {
      return e.title ? `${e.title} (${e.date})` : e.date;
    }
  }
  return null;
}
