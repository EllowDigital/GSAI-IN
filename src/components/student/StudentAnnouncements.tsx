import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Megaphone, AlertTriangle, Info } from 'lucide-react';
import Spinner from '@/components/ui/spinner';

const PRIORITY_CONFIG: Record<string, { icon: React.ElementType; className: string; label: string }> = {
  urgent: { icon: AlertTriangle, className: 'bg-red-500/10 text-red-600 border-red-200', label: 'Urgent' },
  important: { icon: Megaphone, className: 'bg-yellow-500/10 text-yellow-700 border-yellow-200', label: 'Important' },
  normal: { icon: Info, className: 'bg-blue-500/10 text-blue-600 border-blue-200', label: 'Info' },
};

export default function StudentAnnouncements() {
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['student-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements' as any)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10) as any;
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) return <div className="flex justify-center py-4"><Spinner size={20} /></div>;
  if (announcements.length === 0) return null;

  return (
    <div className="space-y-3">
      {(announcements as any[]).map((a: any) => {
        const config = PRIORITY_CONFIG[a.priority] || PRIORITY_CONFIG.normal;
        const Icon = config.icon;
        return (
          <Card key={a.id} className={`border ${config.className}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg shrink-0 ${config.className}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-foreground">{a.title}</h4>
                    {a.priority !== 'normal' && (
                      <Badge variant="outline" className={`text-xs ${config.className}`}>
                        {config.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{a.content}</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    {format(new Date(a.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
