
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TablesInsert, Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "../AdminAuthProvider";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import EventCard from "@/components/admin/EventCard";
import AdminEventFormModal from "@/components/admin/AdminEventFormModal";
import EventDeleteDialog from "@/components/admin/EventDeleteDialog";
import { Card, CardHeader } from "@/components/ui/card";
import Spinner from "@/components/ui/spinner";

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
    <div className="p-4 sm:p-8 mx-auto max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-3">
        <h1 className="text-3xl font-bold">Event Manager</h1>
        <Button variant="default" className="rounded-2xl shadow-lg gap-2" onClick={handleCreate}>
          <Plus className="w-5 h-5" />
          Add Event
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-8">
              No events found.
            </div>
          )}
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={() => handleEdit(event)}
              onDelete={() => handleDelete(event)}
            />
          ))}
        </div>
      )}
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
