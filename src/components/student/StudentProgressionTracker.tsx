import React, { useState } from 'react';
import { useStudentAuth } from '@/pages/student/StudentAuthProvider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Award, ArrowRight, Star, Layers, ChevronRight } from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { useDisciplines } from '@/hooks/useDisciplines';

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

  // Fetch all enrolled programs
  const { data: enrolledPrograms = [] } = useQuery({
    queryKey: ['student-enrolled-programs', profile?.studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_programs')
        .select('program_name, is_primary')
        .eq('student_id', profile!.studentId)
        .order('is_primary', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.studentId,
  });

  // Fetch student's primary program from students table as fallback
  const { data: studentRecord } = useQuery({
    queryKey: ['student-record', profile?.studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('program')
        .eq('id', profile!.studentId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.studentId,
  });

  // Fetch ALL belt-based progress records for this student
  const { data: allProgress = [], isLoading: progressLoading } = useQuery({
    queryKey: ['student-all-progress', profile?.studentId],
    queryFn: async () => {
      const { data, error } = (await supabase
        .from('student_progress')
        .select('id, stripe_count, status, belt_levels(id, color, rank, discipline)')
        .eq('student_id', profile!.studentId)
        .order('created_at', { ascending: false })) as any;
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.studentId,
  });

  // Fetch ALL level-based progress
  const { data: levelProgress = [], isLoading: levelLoading } = useQuery({
    queryKey: ['student-level-progress', profile?.studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_discipline_progress')
        .select('id, status, started_at, completed_at, coach_notes, discipline_levels(id, discipline, level_name, level_order)')
        .eq('student_id', profile!.studentId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!profile?.studentId,
  });

  // Fetch promotion history
  const { data: promotions = [], isLoading: promoLoading } = useQuery({
    queryKey: ['student-promotions', profile?.studentId],
    queryFn: async () => {
      const { data, error } = (await supabase
        .from('promotion_history')
        .select(
          `id, promoted_at, notes,
          from_belt:belt_levels!promotion_history_from_belt_id_fkey(color, rank, discipline),
          to_belt:belt_levels!promotion_history_to_belt_id_fkey(color, rank, discipline)`
        )
        .eq('student_id', profile!.studentId)
        .order('promoted_at', { ascending: true })) as any;
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.studentId,
  });

  const isLoading = progressLoading || levelLoading || promoLoading;

  if (isLoading)
    return (
      <div className="flex justify-center py-8">
        <Spinner size={20} />
      </div>
    );

  // Build list of programs the student is in
  const programs =
    enrolledPrograms.length > 0
      ? enrolledPrograms.map((p: any) => p.program_name)
      : studentRecord?.program
        ? [studentRecord.program]
        : [];

  // If only one program, don't show tabs
  if (programs.length <= 1) {
    const programName = programs[0] || profile?.program || 'General';
    return (
      <ProgramProgressionView
        program={programName}
        beltProgress={allProgress}
        levelProgress={levelProgress}
        promotions={promotions}
      />
    );
  }

  return (
    <Tabs defaultValue={programs[0]} className="w-full">
      <TabsList className="w-full flex flex-wrap h-auto gap-1">
        {programs.map((prog: string) => (
          <TabsTrigger key={prog} value={prog} className="text-xs sm:text-sm py-1.5 px-3">
            {prog}
          </TabsTrigger>
        ))}
      </TabsList>
      {programs.map((prog: string) => (
        <TabsContent key={prog} value={prog} className="mt-4">
          <ProgramProgressionView
            program={prog}
            beltProgress={allProgress}
            levelProgress={levelProgress}
            promotions={promotions}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function ProgramProgressionView({
  program,
  beltProgress,
  levelProgress,
  promotions,
}: {
  program: string;
  beltProgress: any[];
  levelProgress: any[];
  promotions: any[];
}) {
  const { isBeltBased: checkBelt, getDiscipline } = useDisciplines();
  const isBeltBased = checkBelt(program);
  const disc = getDiscipline(program);

  if (isBeltBased) {
    // Filter belt progress for this program's discipline
    const programBelts = beltProgress.filter((p: any) => {
      const disc = p.belt_levels?.discipline?.toLowerCase();
      const prog = program.toLowerCase();
      return (
        disc === prog ||
        disc === 'general' ||
        (prog === 'grappling' && disc === 'bjj') ||
        (prog === 'bjj' && disc === 'grappling')
      );
    });

    // Get most recent/highest belt
    const currentBelt = programBelts.length > 0 ? programBelts[0] : null;
    const beltColor = currentBelt?.belt_levels?.color?.toLowerCase() || 'white';
    const stripes = currentBelt?.stripe_count || 0;

    // Filter promotions for this discipline
    const programPromotions = promotions.filter((p: any) => {
      const disc = p.to_belt?.discipline?.toLowerCase();
      const prog = program.toLowerCase();
      return (
        !disc ||
        disc === prog ||
        disc === 'general' ||
        (prog === 'grappling' && disc === 'bjj') ||
        (prog === 'bjj' && disc === 'grappling')
      );
    });

    return (
      <div className="space-y-4">
        {/* Current Belt */}
        <Card className="border border-border overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-6 rounded-sm border border-border shadow-sm"
                style={{ backgroundColor: BELT_COLORS[beltColor] || BELT_COLORS.white }}
              />
              <div>
                <h3 className="font-semibold text-foreground capitalize">{beltColor} Belt</h3>
                <p className="text-xs text-muted-foreground">{program}</p>
                {stripes > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: stripes }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">
                      {stripes} stripe{stripes > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
              {currentBelt && (
                <Badge
                  variant="outline"
                  className="ml-auto text-xs capitalize"
                >
                  {currentBelt.status?.replace('_', ' ') || 'In Progress'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Promotion Timeline */}
        {programPromotions.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">
            No promotions recorded yet. Keep training! 💪
          </p>
        ) : (
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-border" />
            {programPromotions.map((p: any) => (
              <div key={p.id} className="relative flex gap-3">
                <div className="absolute -left-3.5 top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                <Card className="flex-1 border border-border">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="capitalize text-xs">
                        <span
                          className="w-2.5 h-2.5 rounded-full mr-1.5 inline-block"
                          style={{ backgroundColor: BELT_COLORS[p.from_belt?.color?.toLowerCase()] || '#ccc' }}
                        />
                        {p.from_belt?.color || '—'}
                      </Badge>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <Badge variant="outline" className="capitalize text-xs">
                        <span
                          className="w-2.5 h-2.5 rounded-full mr-1.5 inline-block"
                          style={{ backgroundColor: BELT_COLORS[p.to_belt?.color?.toLowerCase()] || '#ccc' }}
                        />
                        {p.to_belt?.color || '—'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {format(new Date(p.promoted_at), 'MMM d, yyyy')}
                    </p>
                    {p.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">"{p.notes}"</p>
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

  // Level-based progression
  const programLevels = levelProgress.filter(
    (lp: any) => lp.discipline_levels?.discipline?.toLowerCase() === program.toLowerCase()
  );

  const configLevels = config?.levels || [];

  return (
    <div className="space-y-4">
      {/* Level Overview */}
      <Card className="border border-border overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <Layers className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">{program}</h3>
              <p className="text-xs text-muted-foreground">Level-based progression</p>
            </div>
          </div>

          {/* Level progression path */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {configLevels.map((level, i) => {
              const dbLevel = programLevels.find(
                (pl: any) => pl.discipline_levels?.level_name === level
              );
              const isCompleted = dbLevel?.status === 'completed';
              const isActive = dbLevel?.status === 'in_progress';

              return (
                <React.Fragment key={level}>
                  <Badge
                    variant={isCompleted ? 'default' : isActive ? 'secondary' : 'outline'}
                    className={`text-xs px-2.5 py-1 ${
                      isCompleted
                        ? 'bg-green-600 text-white'
                        : isActive
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {isCompleted && '✓ '}
                    {level}
                  </Badge>
                  {i < configLevels.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Level details */}
      {programLevels.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-6">
          No level progression recorded yet. Keep training! 💪
        </p>
      ) : (
        <div className="space-y-2">
          {programLevels
            .sort((a: any, b: any) => (a.discipline_levels?.level_order ?? 0) - (b.discipline_levels?.level_order ?? 0))
            .map((lp: any) => (
              <Card key={lp.id} className="border border-border">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {lp.discipline_levels?.level_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Started {format(new Date(lp.started_at), 'MMM d, yyyy')}
                        {lp.completed_at && ` • Completed ${format(new Date(lp.completed_at), 'MMM d, yyyy')}`}
                      </p>
                    </div>
                    <Badge
                      variant={lp.status === 'completed' ? 'default' : 'secondary'}
                      className={`text-xs ${lp.status === 'completed' ? 'bg-green-600' : ''}`}
                    >
                      {lp.status === 'completed' ? '✓ Completed' : 'In Progress'}
                    </Badge>
                  </div>
                  {lp.coach_notes && (
                    <p className="text-xs text-muted-foreground mt-2 italic">"{lp.coach_notes}"</p>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
