
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import Spinner from "@/components/ui/spinner";
import { motion, AnimatePresence } from "framer-motion";

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
    <section className="w-full py-14 px-4 md:px-8 bg-gradient-to-br from-yellow-50 via-white to-red-50 border-b border-yellow-100" id="events">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-7 text-yellow-500 text-center font-montserrat tracking-tight drop-shadow">
          Upcoming Events & Highlights
        </h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10 mb-6 text-lg font-semibold py-12">
            No events available at the moment.<br />
            <span className="text-yellow-400">Stay tuned for new updates!</span>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            <AnimatePresence>
              {events.map((event, idx) => (
                <motion.div
                  key={event.id}
                  className="rounded-2xl shadow-xl border bg-white overflow-hidden flex flex-col hover:scale-[1.03] transition-transform duration-200 group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.07 }}
                >
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-44 object-cover group-hover:brightness-95 transition-all"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-44 bg-yellow-100 flex items-center justify-center text-yellow-300 font-bold text-2xl">No Image</div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-lg mb-1.5 text-gray-800 group-hover:text-yellow-600 transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      {event.from_date
                        ? new Date(event.from_date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })
                        : ""}
                      {event.end_date && event.end_date !== event.from_date ? (
                        <> &ndash; {new Date(event.end_date).toLocaleDateString(undefined, {
                          month: "short", day: "numeric", year: "numeric"
                        })}</>
                      ) : null}
                    </div>
                    <div className="text-gray-700 text-sm mb-2 flex-1 line-clamp-4">{event.description}</div>
                    {event.tag && (
                      <span className="inline-block mt-2 text-xs font-semibold uppercase bg-yellow-100 text-yellow-700 rounded px-2 py-0.5 tracking-wide shadow-sm">
                        {event.tag}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsSection;

