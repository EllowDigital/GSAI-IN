import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/useToast';
import { supabase } from '@/services/supabase/client';
import { Tables } from '@/services/supabase/types';
import Spinner from '@/components/ui/spinner';
import { mapSupabaseErrorToFriendly } from '@/utils/errorHandling';

type EventRow = Tables<'events'>;

interface Props {
  event: EventRow | null;
  onClose: () => void;
}

const EventDeleteDialog: React.FC<Props> = ({ event, onClose }) => {
  const [loading, setLoading] = useState(false);

  const getFriendlySupabaseMessage = (error: unknown, fallback: string) => {
    const friendly = mapSupabaseErrorToFriendly(error);
    if (friendly?.message) return friendly.message;
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  };

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
      toast.error(
        `Delete failed: ${getFriendlySupabaseMessage(err, 'Unexpected error')}`
      );
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
