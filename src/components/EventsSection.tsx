
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import Spinner from "@/components/ui/spinner";

type EventRow = Tables<"events">;

const EventsSection: React.FC = () => {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("from_date", { ascending: false })
        .limit(6);
      if (error) {
        console.error("Error fetching events:", error);
      }
      setEvents(data ?? []);
      setLoading(false);
    };

    fetchEvents();
  }, []);

  return (
    <section className="w-full py-12 px-4 md:px-8 bg-white" id="events">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-5 text-center">Events</h2>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : events.length === 0 ? (
          <div className="text-center text-muted-foreground">No events available.</div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {events.map(event => (
              <div
                key={event.id}
                className="rounded-xl shadow-lg border bg-background overflow-hidden flex flex-col"
              >
                {event.image_url && (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-44 object-cover"
                  />
                )}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                  <div className="text-xs text-muted-foreground mb-1">
                    {event.from_date
                      ? new Date(event.from_date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })
                      : ""}
                    {event.end_date && event.end_date !== event.from_date ? (
                      <> - {new Date(event.end_date).toLocaleDateString(undefined, {
                        month: "short", day: "numeric", year: "numeric"
                      })}</>
                    ) : null}
                  </div>
                  <div className="text-gray-800 text-sm mb-2 flex-1">{event.description}</div>
                  {event.tag && (
                    <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-800 rounded px-2">
                      {event.tag}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsSection;
