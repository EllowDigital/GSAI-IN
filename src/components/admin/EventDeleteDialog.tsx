import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import Spinner from '@/components/ui/spinner';

type EventRow = Tables<'events'>;

interface Props {
  event: EventRow | null;
  onClose: () => void;
}

const EventDeleteDialog: React.FC<Props> = ({ event, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!event) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);
      if (error) throw error;
      toast.success('Event deleted.');
      onClose();
    } catch (err: any) {
      toast.error('Delete failed', err.message);
    }
    setLoading(false);
  };

  return (
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Event</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-bold">{event?.title}</span>?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? <Spinner size={16} /> : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDeleteDialog;
