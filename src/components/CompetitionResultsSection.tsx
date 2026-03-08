import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

interface CompResult {
  position: string;
  students: { name: string; program: string } | null;
  competitions: { name: string; date: string } | null;
}

const MEDAL_MAP: Record<string, { emoji: string; label: string; className: string }> = {
  gold: { emoji: '🥇', label: 'Gold', className: 'bg-yellow-100 text-yellow-800 border-yellow-400' },
  silver: { emoji: '🥈', label: 'Silver', className: 'bg-gray-100 text-gray-700 border-gray-400' },
  bronze: { emoji: '🥉', label: 'Bronze', className: 'bg-orange-100 text-orange-800 border-orange-400' },
};

export default function CompetitionResultsSection() {
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['public-achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competition_registrations')
        .select('position, students(name, program), competitions(name, date)')
        .in('position', ['gold', 'silver', 'bronze'])
        .order('registered_at', { ascending: false })
        .limit(12) as any;
      if (error) throw error;
      return (data || []) as CompResult[];
    },
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading || results.length === 0) return null;

  return (
    <section id="results" className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" /> Our Champions
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground">
            Competition <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">Results</span>
          </h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto text-sm sm:text-base">
            Celebrating the achievements of our martial arts athletes
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((r, i) => {
            const medal = MEDAL_MAP[r.position] || MEDAL_MAP.gold;
            return (
              <Card key={i} className="border border-border hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="text-3xl">{medal.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-sm truncate">{r.students?.name}</p>
                    <p className="text-xs text-muted-foreground">{r.competitions?.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className={`text-[10px] ${medal.className}`}>{medal.label}</Badge>
                      <span className="text-[10px] text-muted-foreground">{r.students?.program}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
