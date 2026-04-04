import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { toast } from '@/hooks/useToast';

type EnrollmentRow = {
  id: string;
  created_at?: string | null;
  [key: string]: unknown;
};

function upsertEnrollment(
  existing: EnrollmentRow[] | undefined,
  row: EnrollmentRow
): EnrollmentRow[] {
  const current = existing ?? [];
  const filtered = current.filter((item) => item.id !== row.id);
  const next = [row, ...filtered];
  return next.sort((a, b) => {
    const aTime = a.created_at ? Date.parse(a.created_at) : 0;
    const bTime = b.created_at ? Date.parse(b.created_at) : 0;
    return bTime - aTime;
  });
}

export const useRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const invalidateTimers = new Map<string, ReturnType<typeof setTimeout>>();
    let lastEnrollmentInsertToastAt = 0;

    const scheduleInvalidate = (queryKey: string[], delayMs = 350) => {
      const key = JSON.stringify(queryKey);
      const existing = invalidateTimers.get(key);
      if (existing) clearTimeout(existing);

      const timeout = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey });
        invalidateTimers.delete(key);
      }, delayMs);

      invalidateTimers.set(key, timeout);
    };

    const invalidateDashboard = () => {
      scheduleInvalidate(['dashboard-stats']);
      scheduleInvalidate(['dashboard-analytics']);
    };

    const invalidateMany = (keys: string[][]) => {
      keys.forEach((key) => scheduleInvalidate(key));
    };

    const channels = [
      supabase
        .channel('rt-students')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'students' },
          () => {
            scheduleInvalidate(['students']);
            invalidateDashboard();
          }
        )
        .subscribe(),

      supabase
        .channel('rt-fees')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'fees' },
          () => {
            scheduleInvalidate(['fees']);
            invalidateDashboard();
          }
        )
        .subscribe(),

      supabase
        .channel('rt-events')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'events' },
          () => {
            scheduleInvalidate(['events']);
            invalidateDashboard();
          }
        )
        .subscribe(),

      supabase
        .channel('rt-blogs')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'blogs' },
          () => {
            scheduleInvalidate(['blogs']);
            invalidateDashboard();
          }
        )
        .subscribe(),

      supabase
        .channel('rt-news')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'news' },
          () => {
            scheduleInvalidate(['news']);
            invalidateDashboard();
          }
        )
        .subscribe(),

      supabase
        .channel('rt-gallery')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'gallery_images' },
          () => {
            scheduleInvalidate(['gallery-images']);
            invalidateDashboard();
          }
        )
        .subscribe(),

      supabase
        .channel('rt-enrollment-requests')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'enrollment_requests' },
          (payload) => {
            if (payload.eventType === 'INSERT' && payload.new) {
              const newRow = payload.new as EnrollmentRow;
              queryClient.setQueryData(
                ['enrollment-requests'],
                (current: EnrollmentRow[] | undefined) =>
                  upsertEnrollment(current, newRow)
              );

              const now = Date.now();
              if (now - lastEnrollmentInsertToastAt > 15000) {
                toast.info(
                  'New enrollment received',
                  'A new form was submitted.'
                );
                lastEnrollmentInsertToastAt = now;
              }
            }

            scheduleInvalidate(['enrollment-requests']);
            invalidateDashboard();
          }
        )
        .subscribe(),

      // Progression-related tables
      supabase
        .channel('rt-student-programs')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'student_programs' },
          () => {
            invalidateMany([
              ['student-programs'],
              ['all-student-programs'],
              ['student-programs-all'],
              ['students'],
            ]);
          }
        )
        .subscribe(),

      supabase
        .channel('rt-promotion-history')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'promotion_history' },
          () => {
            scheduleInvalidate(['promotion-history']);
          }
        )
        .subscribe(),

      supabase
        .channel('rt-student-progress')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'student_progress' },
          () => {
            scheduleInvalidate(['student-progress']);
          }
        )
        .subscribe(),

      supabase
        .channel('rt-discipline-progress')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'student_discipline_progress',
          },
          () => {
            scheduleInvalidate(['discipline-progress-admin']);
          }
        )
        .subscribe(),

      supabase
        .channel('rt-announcements')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'announcements' },
          () => {
            scheduleInvalidate(['announcements']);
            invalidateDashboard();
          }
        )
        .subscribe(),

      supabase
        .channel('rt-belt-levels')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'belt_levels' },
          () => {
            scheduleInvalidate(['belt-levels']);
          }
        )
        .subscribe(),
    ];

    return () => {
      invalidateTimers.forEach((timer) => clearTimeout(timer));
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [queryClient]);
};
