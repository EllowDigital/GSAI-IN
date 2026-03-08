import React from 'react';
import { useStudentAuth } from '@/pages/student/StudentAuthProvider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Award, ArrowRight, Star } from 'lucide-react';
import Spinner from '@/components/ui/spinner';

const BELT_COLORS: Record<string, string> = {
  white: '#e5e7eb',
  yellow: '#fbbf24',
  orange: '#f97316',
  green: '#22c55e',
  blue: '#3b82f6',
  purple: '#a855f7',
  brown: '#92400e',
  red: '#ef4444',
  black: '#1f2937',
};

export default function StudentProgressionTracker() {
  const { profile } = useStudentAuth();

  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ['student-promotions', profile?.studentId],
    queryFn: async () => {
      const { data, error } = (await supabase
        .from('promotion_history')
        .select(
          `
          id, promoted_at, notes,
          from_belt:belt_levels!promotion_history_from_belt_id_fkey(color, rank),
          to_belt:belt_levels!promotion_history_to_belt_id_fkey(color, rank)
        `
        )
        .eq('student_id', profile!.studentId)
        .order('promoted_at', { ascending: true })) as any;
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.studentId,
  });

  const { data: currentProgress } = useQuery({
    queryKey: ['student-current-progress', profile?.studentId],
    queryFn: async () => {
      const { data, error } = (await supabase
        .from('student_progress')
        .select('stripe_count, status, belt_levels(color, rank)')
        .eq('student_id', profile!.studentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()) as any;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.studentId,
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-8">
        <Spinner size={20} />
      </div>
    );

  const currentBelt =
    currentProgress?.belt_levels?.color?.toLowerCase() || 'white';
  const stripes = currentProgress?.stripe_count || 0;

  return (
    <div className="space-y-4">
      {/* Current Belt Display */}
      <Card className="border border-border overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-6 rounded-sm border border-border shadow-sm"
              style={{
                backgroundColor: BELT_COLORS[currentBelt] || BELT_COLORS.white,
              }}
            />
            <div>
              <h3 className="font-semibold text-foreground capitalize">
                {currentBelt} Belt
              </h3>
              {stripes > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: stripes }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">
                    {stripes} stripe{stripes > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promotion Timeline */}
      {promotions.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-6">
          No promotions recorded yet. Keep training! 💪
        </p>
      ) : (
        <div className="relative pl-6 space-y-4">
          <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-border" />
          {(promotions as any[]).map((p: any, i: number) => (
            <div key={p.id} className="relative flex gap-3">
              <div className="absolute -left-3.5 top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
              <Card className="flex-1 border border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="capitalize text-xs">
                      <span
                        className="w-2.5 h-2.5 rounded-full mr-1.5 inline-block"
                        style={{
                          backgroundColor:
                            BELT_COLORS[p.from_belt?.color?.toLowerCase()] ||
                            '#ccc',
                        }}
                      />
                      {p.from_belt?.color || '—'}
                    </Badge>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <Badge variant="outline" className="capitalize text-xs">
                      <span
                        className="w-2.5 h-2.5 rounded-full mr-1.5 inline-block"
                        style={{
                          backgroundColor:
                            BELT_COLORS[p.to_belt?.color?.toLowerCase()] ||
                            '#ccc',
                        }}
                      />
                      {p.to_belt?.color || '—'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {format(new Date(p.promoted_at), 'MMM d, yyyy')}
                  </p>
                  {p.notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      "{p.notes}"
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
