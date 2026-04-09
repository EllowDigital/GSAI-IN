import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw, Trash2 } from 'lucide-react';
import Spinner from '@/components/ui/spinner';

type PushLogRow = {
  id: string;
  portal_scope: 'admin' | 'student' | null;
  title: string;
  body: string;
  total_targets: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  target_url: string | null;
};

type Props = {
  title?: string;
  cleanupLoading?: boolean;
  onCleanup?: () => void;
};

const scopeBadgeClass = (scope: PushLogRow['portal_scope']) => {
  if (scope === 'admin') return 'bg-sky-500/10 text-sky-700 border-sky-500/20';
  if (scope === 'student') return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
  return 'bg-muted text-muted-foreground';
};

export default function PushNotificationHistoryPanel({
  title,
  cleanupLoading = false,
  onCleanup,
}: Props) {
  const {
    data: logs = [],
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['push-notification-delivery-logs'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('push_notification_delivery_logs' as any)
        .select('id, portal_scope, title, body, total_targets, sent_count, failed_count, created_at, target_url')
        .order('created_at', { ascending: false })
        .limit(25) as any);

      if (error) throw error;
      return (data || []) as PushLogRow[];
    },
    staleTime: 1000 * 30,
  });

  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold">
            {title || 'Push Notification History'}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? (
                <Spinner size={14} />
              ) : (
                <RefreshCcw className="h-3.5 w-3.5" />
              )}
              Refresh
            </Button>
            {onCleanup && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={onCleanup}
                disabled={cleanupLoading}
              >
                {cleanupLoading ? <Spinner size={14} /> : <Trash2 className="h-3.5 w-3.5" />}
                Cleanup Stale
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">Loading push logs...</div>
        ) : logs.length === 0 ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">
            No push notifications sent yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">When</th>
                  <th className="text-left px-3 py-2 font-medium">Scope</th>
                  <th className="text-left px-3 py-2 font-medium">Title</th>
                  <th className="text-left px-3 py-2 font-medium">Sent</th>
                  <th className="text-left px-3 py-2 font-medium">Failed</th>
                  <th className="text-left px-3 py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-border/50 align-top">
                    <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className={scopeBadgeClass(log.portal_scope)}>
                        {log.portal_scope || 'mixed'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 min-w-[260px]">
                      <div className="font-medium text-foreground">{log.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{log.body}</div>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="secondary">{log.sent_count}</Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        variant="secondary"
                        className={log.failed_count > 0 ? 'bg-destructive/10 text-destructive' : ''}
                      >
                        {log.failed_count}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">{log.total_targets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
