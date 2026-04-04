import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Megaphone, AlertTriangle, Info, X } from 'lucide-react';
import Spinner from '@/components/ui/spinner';

const PRIORITY_CONFIG: Record<
  string,
  { icon: React.ElementType; className: string; label: string }
> = {
  urgent: {
    icon: AlertTriangle,
    className: 'bg-red-500/10 text-red-600 border-red-200',
    label: 'Urgent',
  },
  important: {
    icon: Megaphone,
    className: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
    label: 'Important',
  },
  normal: {
    icon: Info,
    className: 'bg-blue-500/10 text-blue-600 border-blue-200',
    label: 'Info',
  },
};

const DISMISSED_KEY = 'gsai-dismissed-announcements';

function getDismissedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveDismissedIds(ids: Set<string>) {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

export default function StudentAnnouncements() {
  const [dismissedIds, setDismissedIds] =
    useState<Set<string>>(getDismissedIds);

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['student-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 20,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
    placeholderData: (previousData) => previousData,
  });

  const handleDismiss = useCallback((id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveDismissedIds(next);
      return next;
    });
  }, []);

  if (isLoading)
    return (
      <div className="flex justify-center py-4">
        <Spinner size={20} />
      </div>
    );

  const visible = announcements.filter((a) => !dismissedIds.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-3">
      {visible.map((a) => {
        const config = PRIORITY_CONFIG[a.priority] || PRIORITY_CONFIG.normal;
        const Icon = config.icon;
        return (
          <Card
            key={a.id}
            className={`border ${config.className} relative group`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg shrink-0 ${config.className}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-foreground">
                      {a.title}
                    </h4>
                    {a.priority !== 'normal' && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${config.className}`}
                      >
                        {config.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {a.content}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    {format(new Date(a.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <button
                  onClick={() => handleDismiss(a.id)}
                  className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground/50 hover:text-muted-foreground transition-colors shrink-0"
                  aria-label="Dismiss announcement"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
