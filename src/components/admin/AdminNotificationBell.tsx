import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function AdminNotificationBell() {
  const { data } = useQuery({
    queryKey: ['admin-notification-counts'],
    queryFn: async () => {
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
    staleTime: 1000 * 30,
    refetchInterval: 60000,
  });

  const total = (data?.pendingEnrollments ?? 0) + (data?.unpaidFees ?? 0);

  const items = [
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
      color: 'bg-red-500',
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Notifications"
          aria-label="Open notifications"
        >
          <Bell className="w-4 h-4" />
          {total > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {total > 99 ? '99+' : total}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="border-b border-border/70 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          <p className="text-xs text-muted-foreground">
            Items needing attention
          </p>
        </div>
        <div className="divide-y divide-border/50">
          {items.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                'flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-muted/50',
                item.count === 0 && 'opacity-50'
              )}
            >
              <span className="text-foreground">{item.label}</span>
              <span
                className={cn(
                  'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold text-white',
                  item.count > 0 ? item.color : 'bg-muted text-muted-foreground'
                )}
              >
                {item.count}
              </span>
            </Link>
          ))}
        </div>
        {total === 0 && (
          <div className="px-4 py-4 text-center text-xs text-muted-foreground">
            All caught up! No pending items.
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
