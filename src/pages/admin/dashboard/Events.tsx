
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "../AdminAuthProvider";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import EventCard from "@/components/admin/EventCard";
import AdminEventFormModal from "@/components/admin/AdminEventFormModal";
import EventDeleteDialog from "@/components/admin/EventDeleteDialog";
import { Card, CardHeader } from "@/components/ui/card";
import Spinner from "@/components/ui/spinner";

// EventRow typing stays the same
type EventRow = Tables<"events">;

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
        .from("events")
        .select("*")
        .order("from_date", { ascending: true });
      if (error) throw error;
      setEvents(data ?? []);
    } catch (err: any) {
      toast.error("Failed to load events", err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
    // Real-time sync
    const channel = supabase
      .channel("events-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
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

  if (!isAdmin) {
    return (
      <Card className="max-w-md mx-auto mt-16 p-8 text-center">
        <CardHeader>
          <h1 className="text-2xl font-bold mb-2">Not Authorized</h1>
          <p className="text-muted-foreground">You must be an admin to view this page.</p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="p-2 xs:p-3 sm:p-4 md:p-8 mx-auto max-w-[1350px] w-full min-h-[70vh] flex flex-col">
      {/* Header & Add Event */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-yellow-800 tracking-tight leading-snug mb-1">Event Manager</h1>
          <div className="hidden sm:block text-muted-foreground text-sm">View, add, update, or delete events. Optimized for all devices.</div>
        </div>
        <Button
          variant="default"
          className="rounded-full shadow-lg gap-2 px-5 py-2 text-sm sm:text-base w-full sm:w-auto"
          onClick={handleCreate}
        >
          <Plus className="w-5 h-5" />
          <span className="hidden xs:inline">Add Event</span>
        </Button>
      </div>
      {/* Loader or events grid */}
      <div className="flex-1 w-full">
        {loading ? (
          <div className="flex justify-center items-center min-h-[40vh]">
            <Spinner />
          </div>
        ) : (
          <div
            className="
              grid
              gap-y-7 gap-x-4
              grid-cols-1
              xs:grid-cols-2
              md:grid-cols-3
              xl:grid-cols-4
              2xl:grid-cols-5
              w-full
              mt-2
            "
          >
            {events.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-8 text-base">
                No events found.
              </div>
            )}
            {events.map((event) => (
              <div
                key={event.id}
                className="
                  flex
                  flex-col
                  min-w-0
                  max-w-full
                  animate-fade-in
                "
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
        onOpenChange={setModalOpen}
        editingEvent={editingEvent}
      />
      <EventDeleteDialog
        event={deleteEvent}
        onClose={() => setDeleteEvent(null)}
      />
    </div>
  );
};

export default Events;
