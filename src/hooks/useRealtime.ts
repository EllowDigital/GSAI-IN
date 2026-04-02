import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';

export const useRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channels = [
      supabase
        .channel('rt-students')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'students' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          }
        )
        .subscribe(),

      supabase
        .channel('rt-fees')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'fees' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['fees'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          }
        )
        .subscribe(),

      supabase
        .channel('rt-events')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'events' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          }
        )
        .subscribe(),

      supabase
        .channel('rt-blogs')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'blogs' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          }
        )
        .subscribe(),

      supabase
        .channel('rt-news')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'news' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['news'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          }
        )
        .subscribe(),

      supabase
        .channel('rt-gallery')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'gallery_images' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
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
            queryClient.invalidateQueries({ queryKey: ['student-programs'] });
            queryClient.invalidateQueries({
              queryKey: ['all-student-programs'],
            });
            queryClient.invalidateQueries({
              queryKey: ['student-programs-all'],
            });
            queryClient.invalidateQueries({ queryKey: ['students'] });
          }
        )
        .subscribe(),

      supabase
        .channel('rt-promotion-history')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'promotion_history' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['promotion-history'] });
          }
        )
        .subscribe(),

      supabase
        .channel('rt-student-progress')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'student_progress' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['student-progress'] });
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
            queryClient.invalidateQueries({
              queryKey: ['discipline-progress-admin'],
            });
          }
        )
        .subscribe(),

      supabase
        .channel('rt-announcements')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'announcements' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
          }
        )
        .subscribe(),

      supabase
        .channel('rt-belt-levels')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'belt_levels' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['belt-levels'] });
          }
        )
        .subscribe(),
    ];

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [queryClient]);
};
