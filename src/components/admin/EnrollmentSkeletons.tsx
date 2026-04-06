import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function EnrollmentStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:max-w-3xl">
      {Array.from({ length: 4 }).map((_, i) => (
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

export function EnrollmentCardSkeleton() {
  return (
    <Card className="border-border/70">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-1.5">
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EnrollmentListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <EnrollmentCardSkeleton key={i} />
      ))}
    </div>
  );
}
