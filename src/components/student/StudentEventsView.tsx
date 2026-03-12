import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isPast, isFuture, isToday } from 'date-fns';
import { Calendar, MapPin } from 'lucide-react';
import Spinner from '@/components/ui/spinner';

export default function StudentEventsView() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['student-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-8">
        <Spinner size={20} />
      </div>
    );
  if (events.length === 0)
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        No events available.
      </p>
    );

  const upcoming = events.filter(
    (e) => isFuture(new Date(e.date)) || isToday(new Date(e.date))
  );
  const past = events.filter(
    (e) => isPast(new Date(e.date)) && !isToday(new Date(e.date))
  );

  const renderEvent = (event: any) => (
    <Card key={event.id} className="border border-border overflow-hidden">
      {event.image_url && (
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-32 object-cover"
          loading="lazy"
        />
      )}
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground text-sm">
            {event.title}
          </h3>
          {event.tag && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {event.tag}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(event.date), 'MMM d, yyyy')}
            {event.end_date &&
              ` – ${format(new Date(event.end_date), 'MMM d, yyyy')}`}
          </span>
          {event.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {event.location}
            </span>
          )}
        </div>
        {event.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Upcoming Events
          </h3>
          <div className="space-y-3">{upcoming.map(renderEvent)}</div>
        </div>
      )}
      {past.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Past Events
          </h3>
          <div className="space-y-3 opacity-70">{past.map(renderEvent)}</div>
        </div>
      )}
    </div>
  );
}
