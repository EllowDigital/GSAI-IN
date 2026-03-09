import React, { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Award, Calendar, X, Bell, CheckCheck } from 'lucide-react';
import Spinner from '@/components/ui/spinner';

interface BeltExamNotification {
  id: string;
  title: string;
  message: string;
  exam_date: string;
  discipline: string | null;
  is_read: boolean;
  created_at: string;
}

export default function StudentBeltExamNotifications({
  studentId,
}: {
  studentId: string;
}) {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['belt-exam-notifications', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('belt_exam_notifications')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as BeltExamNotification[];
    },
    enabled: !!studentId,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('belt_exam_notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['belt-exam-notifications', studentId],
      });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unreadIds = notifications
        .filter((n) => !n.is_read)
        .map((n) => n.id);
      if (unreadIds.length === 0) return;
      const { error } = await supabase
        .from('belt_exam_notifications')
        .update({ is_read: true })
        .in('id', unreadIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['belt-exam-notifications', studentId],
      });
    },
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-4">
        <Spinner size={20} />
      </div>
    );

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  if (notifications.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          Belt Exam Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-[10px] px-1.5">
              {unreadCount}
            </Badge>
          )}
        </h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCheck className="h-3 w-3" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.map((n) => (
        <Card
          key={n.id}
          className={`border transition-colors ${n.is_read ? 'opacity-60 bg-muted/10' : 'bg-primary/5 border-primary/20'}`}
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg shrink-0 ${n.is_read ? 'bg-muted' : 'bg-primary/10'}`}
              >
                <Award
                  className={`w-4 h-4 ${n.is_read ? 'text-muted-foreground' : 'text-primary'}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground">
                    {n.title}
                  </h4>
                  {n.discipline && (
                    <Badge variant="outline" className="text-[10px]">
                      {n.discipline}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {n.message}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Exam: {format(new Date(n.exam_date), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
              {!n.is_read && (
                <button
                  onClick={() => markReadMutation.mutate(n.id)}
                  className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground/50 hover:text-muted-foreground shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
