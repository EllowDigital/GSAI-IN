import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { Bell, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function AdminNotificationBell() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-notification-counts'],
    queryFn: async () => {
      // Fetch exact counts without downloading the actual rows
      const [enrollRes, feesRes] = await Promise.all([
        supabase
          .from('enrollment_requests')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('fees')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'unpaid'),
      ]);

      if (enrollRes.error) throw enrollRes.error;
      if (feesRes.error) throw feesRes.error;

      return {
        pendingEnrollments: enrollRes.count ?? 0,
        unpaidFees: feesRes.count ?? 0,
      };
    },
    staleTime: 1000 * 30, // Data is fresh for 30 seconds
    refetchInterval: 60000, // Background refetch every minute
  });

  const total = (data?.pendingEnrollments ?? 0) + (data?.unpaidFees ?? 0);
  const hasNotifications = total > 0;

  const items = useMemo(
    () => [
      {
        label: 'Pending Enrollments',
        count: data?.pendingEnrollments ?? 0,
        path: '/admin/dashboard/enrollments',
        color: 'bg-amber-500',
      },
      {
        label: 'Unpaid Fees',
        count: data?.unpaidFees ?? 0,
        path: '/admin/dashboard/fees',
        color: 'bg-destructive',
      },
    ],
    [data]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          title="Notifications"
          aria-label={
            hasNotifications
              ? `You have ${total} unread notifications`
              : 'No new notifications'
          }
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/50" />
          ) : isError ? (
            <AlertCircle className="w-4 h-4 text-destructive/70" />
          ) : (
            <Bell
              className={cn(
                'w-[18px] h-[18px] transition-transform',
                hasNotifications &&
                  'text-foreground animate-[ring_4s_ease-in-out_infinite] origin-top'
              )}
            />
          )}

          {hasNotifications && !isLoading && !isError && (
            <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-background bg-destructive px-1 text-[9px] font-bold text-destructive-foreground shadow-sm">
              {total > 99 ? '99+' : total}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-72 p-0 rounded-2xl overflow-hidden border-border/60 shadow-lg shadow-black/5"
      >
        {/* Header */}
        <div className="bg-muted/30 px-4 py-3.5 border-b border-border/50 backdrop-blur-sm">
          <p className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
            Notifications
            {hasNotifications && (
              <span className="inline-flex h-5 items-center rounded-full bg-primary/10 px-2 text-[10px] font-bold uppercase tracking-wider text-primary">
                {total} New
              </span>
            )}
          </p>
          <p className="text-xs font-medium text-muted-foreground mt-0.5">
            Items requiring your attention
          </p>
        </div>

        {/* List */}
        <div className="p-2 space-y-1">
          {items.map((item) => {
            const isZero = item.count === 0;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={cn(
                  'group flex items-center justify-between rounded-xl px-3 py-2.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                  isZero
                    ? 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0'
                    : 'hover:bg-muted/50 hover:shadow-sm'
                )}
              >
                <span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                  {item.label}
                </span>
                <span
                  className={cn(
                    'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white shadow-sm transition-transform group-hover:scale-110',
                    !isZero
                      ? item.color
                      : 'bg-muted-foreground/30 text-foreground shadow-none'
                  )}
                >
                  {item.count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {!hasNotifications && !isLoading && !isError && (
          <div className="px-4 pb-5 pt-2 text-center">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
              <Bell className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              All caught up!
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              No pending tasks found.
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
