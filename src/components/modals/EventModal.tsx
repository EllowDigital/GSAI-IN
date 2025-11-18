import React from 'react';
import { X, Calendar, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerClose,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  from_date: string | null;
  end_date: string | null;
  image_url: string | null;
  tag: string | null;
}

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onViewFullPage: (id: string) => void;
}

export function EventModal({
  event,
  isOpen,
  onClose,
  onViewFullPage,
}: EventModalProps) {
  const isMobile = useIsMobile();

  if (!event) return null;

  const formatDateRange = (
    fromDate: string | null,
    endDate: string | null,
    fallbackDate: string
  ) => {
    const startDate = fromDate || fallbackDate;
    const start = new Date(startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    if (endDate && endDate !== startDate) {
      const end = new Date(endDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      return `${start} - ${end}`;
    }

    return start;
  };

  const content = (
    <div className="space-y-6">
      {event.image_url && (
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <div className="flex items-start justify-between gap-4 mb-3">
            <h2 className="text-2xl font-bold text-foreground">
              {event.title}
            </h2>
            {event.tag && (
              <Badge variant="secondary" className="shrink-0">
                {event.tag}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              {formatDateRange(event.from_date, event.end_date, event.date)}
            </span>
          </div>
        </div>

        {event.description && (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Event Details</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          </div>
        )}

        <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">Location</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Ghatak Sports Academy India, Lucknow, UP
          </p>
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={() => onViewFullPage(event.id)}
            className="w-full sm:w-auto"
            variant="default"
          >
            View Full Event Details
          </Button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerClose className="absolute right-4 top-4">
              <X className="h-4 w-4" />
            </DrawerClose>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>
            Event runs{' '}
            {formatDateRange(event.from_date, event.end_date, event.date)} at
            Ghatak Sports Academy India.
          </DialogDescription>
        </DialogHeader>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
        </button>
        {content}
      </DialogContent>
    </Dialog>
  );
}
