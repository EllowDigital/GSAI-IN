import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '../AdminAuthProvider';
import { Plus, Grid3X3, Table2, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import EventCard from '@/components/admin/EventCard';
import AdminEventFormModal from '@/components/admin/AdminEventFormModal';
import EventDeleteDialog from '@/components/admin/EventDeleteDialog';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import Spinner from '@/components/ui/spinner';
import RefreshButton from '@/components/admin/RefreshButton';

type EventRow = Tables<'events'>;

const Events = () => {
  const { isAdmin } = useAdminAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRow | null>(null);
  const [deleteEvent, setDeleteEvent] = useState<EventRow | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

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
        title: 'Error',
        description: 'Failed to load events: ' + err.message,
        variant: 'error',
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
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
    setTimeout(() => fetchEvents(), 100);
  };

  const handleDeleteClose = () => {
    setDeleteEvent(null);
    setTimeout(() => fetchEvents(), 100);
  };

  const handleRefresh = async () => {
    try {
      await fetchEvents();
      toast({
        title: 'Success',
        description: 'Events refreshed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to refresh events',
        variant: 'error',
      });
    }
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
    <div className="w-full p-3 sm:p-4 lg:p-6 xl:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 shadow-sm rounded-none sm:rounded-2xl">
        <div className="border-b border-slate-200/60 dark:border-slate-700/60 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
                <span>Event Management</span>
              </h2>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                Create, schedule, and manage academy events and activities.
              </p>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <RefreshButton
                onRefresh={handleRefresh}
                isLoading={loading}
                className="flex-shrink-0"
              />
              <Button onClick={handleCreate} className="gap-2 shadow" size="sm">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Event</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* View Controls */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-between">
            {/* View Mode Toggle */}
            <div className="flex gap-1 border rounded-full p-1 bg-muted/50 flex-1 sm:flex-initial">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="rounded-full px-3 flex-1 sm:flex-initial"
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Cards</span>
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-full px-3 flex-1 sm:flex-initial"
              >
                <Table2 className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Table</span>
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="w-full space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <Spinner />
                <p className="text-sm sm:text-base text-muted-foreground mt-4">
                  Loading events...
                </p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 sm:py-12 space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                  No events found
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Create your first event to get started with managing academy
                  events.
                </p>
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create First Event
                </Button>
              </div>
            ) : viewMode === 'cards' ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {events.map((event) => (
                  <div key={event.id} className="animate-fade-in">
                    <EventCard
                      event={event}
                      onEdit={() => handleEdit(event)}
                      onDelete={() => handleDelete(event)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="overflow-hidden">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Events Table View
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 sm:p-4 font-semibold">
                            Event
                          </th>
                          <th className="text-left p-3 sm:p-4 font-semibold hidden sm:table-cell">
                            Date
                          </th>
                          <th className="text-left p-3 sm:p-4 font-semibold hidden md:table-cell">
                            Description
                          </th>
                          <th className="text-right p-3 sm:p-4 font-semibold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {events.map((event) => (
                          <tr
                            key={event.id}
                            className="hover:bg-muted/50 transition-colors"
                          >
                            <td className="p-3 sm:p-4">
                              <div className="space-y-1">
                                <div className="font-medium text-foreground">
                                  {event.title}
                                </div>
                                {event.tag && (
                                  <span className="inline-block text-xs bg-primary/10 text-primary rounded px-2 py-1">
                                    {event.tag}
                                  </span>
                                )}
                                <div className="text-sm text-muted-foreground sm:hidden">
                                  {new Date(event.date).toLocaleDateString()}
                                </div>
                              </div>
                            </td>
                            <td className="p-3 sm:p-4 text-muted-foreground hidden sm:table-cell">
                              {new Date(event.date).toLocaleDateString()}
                            </td>
                            <td className="p-3 sm:p-4 text-muted-foreground hidden md:table-cell max-w-xs">
                              <div className="truncate">
                                {event.description}
                              </div>
                            </td>
                            <td className="p-3 sm:p-4 text-right">
                              <div className="flex gap-1 sm:gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(event)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(event)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <AdminEventFormModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        editingEvent={editingEvent}
      />
      <EventDeleteDialog event={deleteEvent} onClose={handleDeleteClose} />
    </div>
  );
};

export default Events;
