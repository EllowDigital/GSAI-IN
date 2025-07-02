import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type EventRow = Tables<'events'>;

interface Props {
  event: EventRow;
  onEdit: () => void;
  onDelete: () => void;
}
function formatDateRange(from?: string | null, to?: string | null) {
  if (!from) return '';
  const start = new Date(from);
  const end = to ? new Date(to) : null;
  if (end && start.getTime() !== end.getTime()) {
    return (
      start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) +
      '–' +
      end.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    );
  }
  return start.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
const EventCard: React.FC<Props> = ({ event, onEdit, onDelete }) => (
  <Card className="rounded-xl lg:rounded-2xl shadow-sm hover:shadow-lg overflow-hidden flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-1 border border-border bg-card">
    {event.image_url && (
      <div className="relative overflow-hidden">
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-36 sm:h-40 lg:h-48 object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    )}
    <CardHeader className="py-3 sm:py-4">
      <div className="space-y-2">
        <div className="font-bold text-base sm:text-lg text-foreground line-clamp-2">{event.title}</div>
        <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
          {formatDateRange(event.from_date, event.end_date)}
        </div>
      </div>
    </CardHeader>
    <CardContent className="flex-1 pb-4">
      <div className="space-y-3 sm:space-y-4">
        {event.description && (
          <div className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {event.description}
          </div>
        )}
        {event.tag && (
          <span className="inline-block text-xs bg-primary/10 text-primary rounded-full px-3 py-1 font-medium">
            {event.tag}
          </span>
        )}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEdit}
            className="flex-1 gap-1.5 text-xs sm:text-sm"
          >
            <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onDelete}
            className="flex-1 gap-1.5 text-xs sm:text-sm"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default EventCard;
