import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar, MapPin, ArrowRight, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function UpcomingCompetitionsSection() {
  const { data: competitions = [], isLoading } = useQuery({
    queryKey: ['public-upcoming-competitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitions')
        .select('id, name, date, end_date, location_text, description, image_url, status, max_participants')
        .in('status', ['upcoming', 'ongoing'])
        .order('date', { ascending: true })
        .limit(6);
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading || competitions.length === 0) return null;

  return (
    <section id="competitions" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs sm:text-sm font-medium mb-4">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Upcoming Tournaments
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground">
            Compete & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Excel</span>
          </h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto text-sm sm:text-base">
            Join upcoming competitions and showcase your martial arts skills. Login to Student Portal to register.
          </p>
        </div>

        {/* Competition Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {competitions.map((comp: any) => (
            <Card key={comp.id} className="group border border-border overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300">
              {comp.image_url && (
                <div className="h-36 sm:h-40 overflow-hidden">
                  <img
                    src={comp.image_url}
                    alt={comp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              )}
              <CardContent className={`p-4 space-y-3 ${!comp.image_url ? 'pt-5' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-foreground text-sm sm:text-base line-clamp-2 flex-1">{comp.name}</h3>
                  <Badge
                    variant="outline"
                    className={`shrink-0 text-[10px] ${
                      comp.status === 'ongoing'
                        ? 'bg-green-500/10 text-green-600 border-green-500/30'
                        : 'bg-orange-500/10 text-orange-600 border-orange-500/30'
                    }`}
                  >
                    {comp.status === 'ongoing' ? '🔴 Live' : 'Upcoming'}
                  </Badge>
                </div>

                {comp.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{comp.description}</p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-primary" />
                    {format(new Date(comp.date), 'MMM d, yyyy')}
                    {comp.end_date && ` - ${format(new Date(comp.end_date), 'MMM d')}`}
                  </span>
                  {comp.location_text && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary" /> {comp.location_text}
                    </span>
                  )}
                  {comp.max_participants && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-primary" /> Max {comp.max_participants}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 sm:mt-10 text-center space-y-3">
          <p className="text-xs sm:text-sm text-muted-foreground">
            🎓 Students can register for competitions via the{' '}
            <Link to="/student/login" className="text-primary font-semibold hover:underline">Student Portal</Link>
          </p>
          <Link to="/student/login">
            <Button variant="outline" className="gap-2 rounded-full">
              Go to Student Portal <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
