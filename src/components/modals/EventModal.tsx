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
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-white/10">
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
            <h2 className="text-2xl font-bold text-white">
              {event.title}
            </h2>
            {event.tag && (
              <Badge variant="secondary" className="shrink-0 bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                {event.tag}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">
              {formatDateRange(event.from_date, event.end_date, event.date)}
            </span>
          </div>
        </div>

        {event.description && (
          <div className="space-y-3">
            <h3 className="font-semibold text-white">Event Details</h3>
            <div className="prose prose-sm max-w-none prose-invert">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          </div>
        )}

        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-yellow-500" />
            <span className="font-medium text-white">Location</span>
          </div>
          <p className="text-sm text-gray-400">
            Ghatak Sports Academy India, Lucknow, UP
          </p>
        </div>

        <div className="pt-4 border-t border-white/10">
          <Button
            onClick={() => onViewFullPage(event.id)}
            className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-red-600 text-white border-0 hover:from-yellow-600 hover:to-red-700"
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
        <DrawerContent className="max-h-[90vh] bg-[#0a0a0a] border-white/10 text-white">
          <DrawerHeader className="text-left">
            <DrawerClose className="absolute right-4 top-4 text-gray-400 hover:text-white">
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-white/10 text-white">
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
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
        {content}
      </DialogContent>
    </Dialog>
  );
}
