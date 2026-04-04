import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DeliveryLogRow {
  id: string;
  announcement_type: 'event' | 'competition';
  announcement_title: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  triggered_by: string | null;
  created_at: string;
}

interface Props {
  typeFilter: 'event' | 'competition';
  title?: string;
}

function shortId(value: string | null): string {
  if (!value) return 'N/A';
  return `${value.slice(0, 8)}...`;
}

export default function AnnouncementDeliveryLogs({ typeFilter, title }: Props) {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['announcement-delivery-logs', typeFilter],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('announcement_delivery_logs' as any)
        .select('*')
        .eq('announcement_type', typeFilter)
        .order('created_at', { ascending: false })
        .limit(20) as any);

      if (error) throw error;
      return (data || []) as DeliveryLogRow[];
    },
  });

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {title || 'Announcement Delivery Logs'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="px-4 py-5 text-sm text-muted-foreground">
            Loading logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="px-4 py-5 text-sm text-muted-foreground">
            No delivery logs found yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">When</th>
                  <th className="text-left px-3 py-2 font-medium">Title</th>
                  <th className="text-left px-3 py-2 font-medium">Sent</th>
                  <th className="text-left px-3 py-2 font-medium">Failed</th>
                  <th className="text-left px-3 py-2 font-medium">Total</th>
                  <th className="text-left px-3 py-2 font-medium">Admin</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-border/50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 max-w-[340px] truncate">
                      {log.announcement_title}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="secondary">{log.sent_count}</Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        variant="secondary"
                        className={
                          log.failed_count > 0
                            ? 'bg-destructive/10 text-destructive'
                            : ''
                        }
                      >
                        {log.failed_count}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">{log.total_recipients}</td>
                    <td className="px-3 py-2">{shortId(log.triggered_by)}</td>
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
