import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

/* ── Student Card Skeleton ── */
export function StudentCardSkeleton() {
  return (
    <Card className="rounded-2xl border-border/60 overflow-hidden shadow-sm">
      <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shrink-0" />
          <div className="flex-1 min-w-0 space-y-2.5 pt-1">
            <Skeleton className="h-5 w-3/4 rounded-md" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>
          <div className="flex gap-2 shrink-0">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
        <div className="p-3 sm:p-4 bg-muted/30 rounded-xl space-y-2.5 border border-border/40">
          <Skeleton className="h-3.5 w-full rounded-md" />
          <Skeleton className="h-3.5 w-5/6 rounded-md" />
          <Skeleton className="h-3.5 w-4/6 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export function StudentCardsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <StudentCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ── Student Table Skeleton ── */
export function StudentTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <div className="border-b border-border/50 bg-muted/40 px-5 py-3.5 flex gap-4 items-center hidden sm:flex">
        {[40, 140, 100, 80, 80, 100, 80].map((w, i) => (
          <Skeleton key={i} className="h-3 rounded-sm" style={{ width: w }} />
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/40">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4"
          >
            <div className="flex items-center gap-4 flex-1">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md sm:hidden" />
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-4 flex-1">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              <Skeleton className="h-4 w-24 rounded-md sm:hidden" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Fee Card Skeleton ── */
export function FeeCardSkeleton() {
  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-28 rounded-md" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded-full shrink-0" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
        </div>

        <div className="flex gap-2 pt-1">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <Skeleton className="h-9 w-12 rounded-lg shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

export function FeeCardsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <FeeCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ── Fee Table Skeleton ── */
export function FeeTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <div className="border-b border-border/50 bg-muted/40 px-5 py-3.5 flex gap-4 items-center hidden sm:flex">
        {[100, 80, 80, 80, 80, 60, 80].map((w, i) => (
          <Skeleton key={i} className="h-3 rounded-sm" style={{ width: w }} />
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/40">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between sm:justify-start gap-4 px-5 py-4"
          >
            <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-4 flex-1">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-3 w-20 rounded-md sm:hidden" />
            </div>

            <div className="hidden sm:flex items-center gap-6 flex-1">
              <Skeleton className="h-4 w-16 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>

            <div className="flex gap-2 shrink-0">
              <Skeleton className="h-8 w-20 rounded-lg hidden sm:block" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Summary Stat Skeleton ── */
export function AdminStatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 flex flex-col gap-3 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="space-y-1.5 mt-1">
            <Skeleton className="h-7 w-20 rounded-md" />
            <Skeleton className="h-3 w-32 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
