import React from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '@/components/ui/spinner';
import { motion, AnimatePresence } from 'framer-motion';
import { useEventsQuery } from '@/hooks/useEventsQuery';
import { Calendar, Clock, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { EventModal } from '@/components/modals/EventModal';
import type { EventRow } from '@/hooks/useEventsQuery';

const EventsSection: React.FC = () => {
  const navigate = useNavigate();
  const { data: events, isLoading, error, isFetching } = useEventsQuery();
  const eventList = events ?? [];
  const [selectedEvent, setSelectedEvent] = React.useState<EventRow | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const formatDateRange = (from?: string | null, to?: string | null) => {
    if (!from) return { start: '', end: null, single: true };

    const start = new Date(from);
    const end = to ? new Date(to) : null;

    const format = (date: Date, withYear = false) =>
      date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        ...(withYear && { year: 'numeric' }),
      });

    return end && start.getTime() !== end.getTime()
      ? { start: format(start), end: format(end, true), single: false }
      : { start: format(start, true), end: null, single: true };
  };

  const handleReadMore = (event: EventRow) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleViewFullPage = (id: string) => {
    setIsModalOpen(false);
    navigate(`/event/${id}`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const variants = {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 },
      },
    },
    card: {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    },
    header: {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    },
  };

  return (
    <section
      id="events"
      className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-amber-50/30 overflow-hidden"
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl" />
      </div>

      {/* Floating Icons */}
      <Sparkles className="absolute top-16 right-8 w-8 h-8 text-yellow-400 opacity-30 animate-float" />
      <Calendar
        className="absolute bottom-20 left-8 w-10 h-10 text-amber-500 opacity-25 animate-float"
        style={{ animationDelay: '2s' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Heading */}
        <motion.div
          className="text-center mb-16 lg:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={variants.header}
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-yellow-600 tracking-wide">
              Upcoming & Highlights
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Events &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600">
              Tournaments
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Join us for exciting tournaments, workshops, and special events that
            bring our martial arts community together.
          </p>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-yellow-400" />
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <div className="h-px w-32 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400" />
            <div
              className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
            <div className="h-px w-16 bg-gradient-to-r from-orange-400 to-transparent" />
          </div>
        </motion.div>

        {/* States */}
        {(isLoading || isFetching) && (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <Spinner />
              <span className="text-gray-500 font-medium">
                Loading events...
              </span>
            </div>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Unable to Load Events
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {error.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Try Again
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {!error && !isLoading && eventList.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Events Scheduled
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              We're planning exciting events and tournaments. Stay tuned for
              updates!
            </p>
            <div className="inline-flex items-center gap-2 text-yellow-600 font-semibold">
              <Sparkles className="w-5 h-5" />
              <span>Coming Soon</span>
            </div>
          </motion.div>
        )}

        {/* Events Grid */}
        {eventList.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={variants.container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <AnimatePresence>
              {eventList.map((event, idx) => {
                const date = formatDateRange(event.from_date, event.end_date);
                return (
                  <motion.div
                    key={event.id}
                    className="group relative bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden hover:shadow-2xl hover:border-yellow-200 transition-all transform hover:-translate-y-2"
                    variants={variants.card}
                    whileHover={{ y: -8 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: idx * 0.07 }}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-yellow-100">
                          <Calendar className="w-12 h-12 text-yellow-400" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-white/90 rounded-lg px-3 py-1 text-sm font-medium shadow">
                        <Calendar className="w-4 h-4 inline-block mr-1" />
                        {date.single
                          ? date.start
                          : `${date.start} - ${date.end}`}
                      </div>
                      {event.tag && (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          {event.tag}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Clock className="w-4 h-4 mr-1" />
                        Upcoming Event
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-yellow-700 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between text-sm border-t pt-4 text-gray-500 group-hover:text-yellow-600 transition-colors">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          Ghatak Sports Academy India
                        </div>
                        <button
                          onClick={() => handleReadMore(event)}
                          className="flex items-center gap-1 cursor-pointer font-medium"
                        >
                          Read More
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* CTA */}
        {eventList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-16"
          >
            <div className="inline-flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => navigate('/events')}
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold text-lg rounded-xl hover:from-yellow-600 hover:to-amber-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                View All Events
              </button>
              <span className="text-gray-600 text-sm">
                Stay updated with our latest events and tournaments
              </span>
            </div>
          </motion.div>
        )}
      </div>

      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onViewFullPage={handleViewFullPage}
      />
    </section>
  );
};

export default EventsSection;
