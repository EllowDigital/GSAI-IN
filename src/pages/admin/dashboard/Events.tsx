
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '../AdminAuthProvider';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import EventCard from '@/components/admin/EventCard';
import AdminEventFormModal from '@/components/admin/AdminEventFormModal';
import EventDeleteDialog from '@/components/admin/EventDeleteDialog';
import { Card, CardHeader } from '@/components/ui/card';
import Spinner from '@/components/ui/spinner';
import RefreshButton from '@/components/admin/RefreshButton';

// EventRow typing stays the same
type EventRow = Tables<'events'>;

const Events = () => {
  const { isAdmin } = useAdminAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRow | null>(null);
  const [deleteEvent, setDeleteEvent] = useState<EventRow | null>(null);

  // Fetch all events
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('from_date', { ascending: true });
      if (error) throw error;
      setEvents(data ?? []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: 'Failed to load events: ' + err.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
    // Real-time sync
    const channel = supabase
      .channel('events-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        fetchEvents
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEvents]);

  const handleCreate = () => {
    setEditingEvent(null);
    setModalOpen(true);
  };

  const handleEdit = (event: EventRow) => {
    setEditingEvent(event);
    setModalOpen(true);
  };

  const handleDelete = (event: EventRow) => {
    setDeleteEvent(event);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    // Auto-refresh after modal close to show changes
    setTimeout(() => {
      fetchEvents();
    }, 100);
  };

  const handleDeleteClose = () => {
    setDeleteEvent(null);
    // Auto-refresh after delete to show changes
    setTimeout(() => {
      fetchEvents();
    }, 100);
  };

  if (!isAdmin) {
    return (
      <Card className="max-w-md mx-auto mt-16 p-8 text-center">
        <CardHeader>
          <h1 className="text-2xl font-bold mb-2">Not Authorized</h1>
          <p className="text-muted-foreground">
            You must be an admin to view this page.
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8 mx-auto max-w-[1350px] w-full min-h-[70vh] flex flex-col">
      {/* Header & Controls */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-yellow-800 tracking-tight leading-snug mb-1">
            Event Manager
          </h1>
          <div className="text-sm md:text-base text-muted-foreground">
            View, add, update, or delete events. Optimized for all devices.
          </div>
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <RefreshButton 
            onRefresh={fetchEvents}
            isLoading={loading}
            className="flex-1 lg:flex-none"
          />
          <Button
            variant="default"
            className="rounded-full shadow-lg gap-2 px-4 md:px-5 py-2 text-sm md:text-base flex-1 lg:flex-none"
            onClick={handleCreate}
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Add Event</span>
            <span className="inline sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Loader or events grid */}
      <div className="flex-1 w-full">
        {loading ? (
          <div className="flex justify-center items-center min-h-[40vh]">
            <Spinner />
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 w-full mt-2">
            {events.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-8 text-sm md:text-base">
                No events found.
              </div>
            )}
            {events.map((event) => (
              <div
                key={event.id}
                className="flex flex-col min-w-0 max-w-full animate-fade-in"
              >
                <EventCard
                  event={event}
                  onEdit={() => handleEdit(event)}
                  onDelete={() => handleDelete(event)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminEventFormModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        editingEvent={editingEvent}
      />
      <EventDeleteDialog
        event={deleteEvent}
        onClose={handleDeleteClose}
      />
    </div>
  );
};

export default Events;
