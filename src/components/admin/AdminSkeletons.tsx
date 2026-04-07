import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

/* ── Student card skeleton (matches StudentsCards layout) ── */
export function StudentCardSkeleton() {
  return (
    <Card className="rounded-xl border-border/50 overflow-hidden">
      <CardContent className="p-3 sm:p-4 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <Skeleton className="h-11 w-11 sm:h-14 sm:w-14 rounded-full flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-5 w-32" />
            <div className="flex gap-1">
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
        <div className="p-2.5 sm:p-3 bg-muted/30 rounded-lg space-y-2 border border-border/30">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function StudentCardsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <StudentCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ── Student table skeleton ── */
export function StudentTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="border-b border-border/50 bg-muted/30 px-4 py-3 flex gap-4">
        {[60, 100, 120, 80, 70, 90, 100, 100, 80].map((w, i) => (
          <Skeleton key={i} className="h-4" style={{ width: w }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 border-b border-border/30 last:border-b-0"
        >
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24 font-mono" />
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2 ml-auto">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Fee card skeleton ── */
export function FeeCardSkeleton() {
  return (
    <Card className="rounded-xl border-border/50">
      <CardContent className="p-3 sm:p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export function FeeCardsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <FeeCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ── Fee table skeleton ── */
export function FeeTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <div className="border-b border-border/50 bg-muted/30 px-4 py-3 flex gap-4">
        {[120, 80, 80, 80, 80, 60, 100].map((w, i) => (
          <Skeleton key={i} className="h-4" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 border-b border-border/30 last:border-b-0"
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <div className="flex gap-2 ml-auto">
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Summary stat skeleton ── */
export function AdminStatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-border/70 bg-card px-3 py-2 space-y-1.5"
        >
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-6 w-10" />
        </div>
      ))}
    </div>
  );
}
