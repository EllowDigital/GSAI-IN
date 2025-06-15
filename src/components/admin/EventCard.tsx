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
  <Card className="rounded-2xl shadow-lg overflow-hidden flex flex-col justify-between h-full">
    {event.image_url && (
      <img
        src={event.image_url}
        alt={event.title}
        className="w-full h-48 object-cover"
      />
    )}
    <CardHeader className="py-3">
      <div className="font-bold text-lg">{event.title}</div>
      <div className="text-sm text-muted-foreground">
        {formatDateRange(event.from_date, event.end_date)}
      </div>
    </CardHeader>
    <CardContent className="flex-1">
      <div className="text-gray-800 mb-2">{event.description}</div>
      {event.tag && (
        <span className="text-xs bg-yellow-100 text-yellow-800 rounded px-2">
          {event.tag}
        </span>
      )}
      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="w-4 h-4 mr-1" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-1" /> Delete
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default EventCard;
