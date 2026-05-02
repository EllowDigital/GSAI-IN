import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/services/supabase/client';
import { Tables } from '@/services/supabase/types';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '../AdminAuthProvider';
import {
  Plus,
  Grid3X3,
  Table2,
  Calendar,
  Sparkles,
  Search,
  CalendarDays,
  MapPin,
} from 'lucide-react';
import { toast } from '@/hooks/useToast';
import EventCard from '@/components/admin/EventCard';
import AdminEventFormModal from '@/components/admin/AdminEventFormModal';
import EventDeleteDialog from '@/components/admin/EventDeleteDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import RefreshButton from '@/components/admin/RefreshButton';
import { openManualWhatsAppBroadcast } from '@/utils/studentCommunication';
import AnnouncementDeliveryLogs from '@/components/admin/AnnouncementDeliveryLogs';
import { usePersistentState } from '@/hooks/usePersistentState';
import { mapSupabaseErrorToFriendly } from '@/utils/errorHandling';

type EventRow = Tables<'events'>;

function buildEventWhatsAppMessage(event: EventRow): string {
  const when = event.from_date || event.date;
  const endDate = event.end_date ? ` to ${event.end_date}` : '';
  const location = (event as any).location
    ? `\nLocation: ${(event as any).location}`
    : '';
  const description = event.description ? `\n${event.description}` : '';

  return [
    `*${event.title}*`,
    `Date: ${when}${endDate}`,
    location,
    description,
    '',
    'Shared by Ghatak Sports Academy India',
  ]
    .filter(Boolean)
    .join('\n');
}

const Events = () => {
  const { isAdmin } = useAdminAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRow | null>(null);
  const [deleteEvent, setDeleteEvent] = useState<EventRow | null>(null);
  const [viewMode, setViewMode] = usePersistentState<'cards' | 'table'>(
    'admin:layout:view-mode',
    'cards',
    ['cards', 'table']
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('all');

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
      const friendly = mapSupabaseErrorToFriendly(err);
      toast({
        title: 'Error',
        description:
          'Failed to load events: ' +
          (friendly?.message || err?.message || 'Unexpected error'),
        variant: 'error',
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void fetchEvents();
    });
    const channel = supabase
      .channel('events-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          void fetchEvents();
        }
      )
      .subscribe();

    return () => {
      window.cancelAnimationFrame(frame);
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

  const handleManualWhatsApp = async (event: EventRow) => {
    const message = buildEventWhatsAppMessage(event);
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      // Continue even if clipboard write fails.
    }

    const opened = openManualWhatsAppBroadcast(message);
    toast({
      title: opened ? 'WhatsApp opened' : 'Message ready',
      description: opened
        ? 'Broadcast message copied. Select recipients manually in WhatsApp.'
        : 'Copy the message and send manually in WhatsApp.',
    });
  };

  const handleModalClose = (_nextOpen: boolean) => {
    setModalOpen(false);
    setEditingEvent(null);
    void fetchEvents();
  };

  const handleDeleteClose = () => {
    setDeleteEvent(null);
    void fetchEvents();
  };

  const handleRefresh = async () => {
    try {
      await fetchEvents();
      toast({
        title: 'Success',
        description: 'Events refreshed successfully',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to refresh events',
        variant: 'error',
      });
    }
  };

  const tags = useMemo(() => {
    const set = new Set<string>();
    events.forEach((event) => {
      if (event.tag && event.tag.trim()) {
        set.add(event.tag);
      }
    });
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const searchable =
        `${event.title || ''} ${event.description || ''} ${(event as any).location || ''}`.toLowerCase();
      const matchesSearch = searchQuery.trim()
        ? searchable.includes(searchQuery.toLowerCase().trim())
        : true;
      const matchesTag = tagFilter === 'all' ? true : event.tag === tagFilter;
      return matchesSearch && matchesTag;
    });
  }, [events, searchQuery, tagFilter]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events.filter((event) => {
      const targetDate = new Date(event.from_date || event.date || '');
      if (Number.isNaN(targetDate.getTime())) return false;
      targetDate.setHours(0, 0, 0, 0);
      return targetDate >= today;
    }).length;
  }, [events]);

  const hasLocationCount = useMemo(
    () => events.filter((event) => Boolean((event as any).location)).length,
    [events]
  );

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
    <div className="admin-page space-y-5 lg:space-y-6">
      <section className="admin-panel overflow-hidden border-border/70 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-slate-100 shadow-md">
        <div className="relative p-5 sm:p-6 lg:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-52 w-52 rounded-full bg-indigo-300/20 blur-3xl" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Badge className="w-fit gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-white/10">
                <Sparkles className="h-3.5 w-3.5" />
                Event Planning Workspace
              </Badge>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Event Management
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
                  Create, schedule, and monitor academy events with a fresh,
                  focused workflow built for speed.
                </p>
              </div>
            </div>

            <div className="grid w-full gap-2 sm:grid-cols-3 lg:w-auto lg:min-w-[460px]">
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Total Events
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {loading ? '...' : events.length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Upcoming
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {loading ? '...' : upcomingEvents}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    With Location
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {loading ? '...' : hasLocationCount}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <div className="admin-panel">
        <div className="admin-panel-header">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-foreground">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Event Operations</span>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage activities, update details, and coordinate announcements.
              </p>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <RefreshButton
                onRefresh={handleRefresh}
                isLoading={loading}
                className="flex-shrink-0"
              />
              <Button onClick={handleCreate} className="gap-2" size="sm">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Event</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="admin-panel-body">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative xl:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, description, or location..."
                className="pl-9"
              />
            </div>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag === 'all' ? 'All Tags' : tag}
                </option>
              ))}
            </select>
            <div className="rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground sm:text-sm">
              Showing {filteredEvents.length} of {events.length} events
            </div>
          </div>

          <div className="admin-toolbar">
            <div className="admin-toggle flex-1 sm:flex-initial">
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

          <div className="w-full space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <Spinner />
                <p className="text-sm sm:text-base text-muted-foreground mt-4">
                  Loading events...
                </p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-8 sm:py-12 space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
                  {events.length === 0 ? (
                    <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                  ) : (
                    <Search className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                  {events.length === 0
                    ? 'No events found'
                    : 'No matching events'}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {events.length === 0
                    ? 'Create your first event to get started with managing academy events.'
                    : 'Try changing the search text or tag filter.'}
                </p>
                {events.length === 0 ? (
                  <Button onClick={handleCreate} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create First Event
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setTagFilter('all');
                    }}
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            ) : viewMode === 'cards' ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="animate-fade-in">
                    <EventCard
                      event={event}
                      onWhatsApp={() => handleManualWhatsApp(event)}
                      onEdit={() => handleEdit(event)}
                      onDelete={() => handleDelete(event)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="overflow-hidden border-border/70">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                    <CalendarDays className="w-5 h-5" />
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
                        {filteredEvents.map((event) => (
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
                                  <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded px-2 py-1">
                                    <MapPin className="w-3 h-3" />
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
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleManualWhatsApp(event)}
                                >
                                  WhatsApp
                                </Button>
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

      <AnnouncementDeliveryLogs
        typeFilter="event"
        title="Event Campaign Delivery Logs"
      />

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
