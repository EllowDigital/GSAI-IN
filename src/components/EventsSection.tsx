import React from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from './ui/spinner';
import { motion, AnimatePresence } from 'framer-motion';
import { useEventsQuery } from '@/hooks/useEventsQuery';
import { Calendar, Clock, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { EventModal } from '@/components/modals/EventModal';
import type { EventRow } from '@/hooks/useEventsQuery';

export default function EventsSection() {
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
      className="section-shell relative bg-[#0a0a0a] overflow-hidden py-12 md:py-20 lg:py-24"
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 md:w-72 md:h-72 bg-yellow-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 md:w-80 md:h-80 bg-red-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      {/* Floating Icons */}
      <Sparkles className="absolute top-16 right-8 w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 opacity-30 animate-float" />
      <Calendar
        className="absolute bottom-20 left-8 w-8 h-8 sm:w-10 sm:h-10 text-red-500 opacity-25 animate-float"
        style={{ animationDelay: '2s' }}
      />

      <div className="section-stack relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          className="text-center mb-12 md:mb-16 lg:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={variants.header}
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-base sm:text-lg font-semibold text-yellow-500 tracking-wide uppercase">
              Upcoming & Highlights
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Events &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
              Tournaments
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
            Join us for exciting tournaments, workshops, and special events that
            bring our martial arts community together.
          </p>

          {/* Divider */}
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-yellow-500" />
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-full animate-pulse" />
            <div className="h-px w-20 sm:w-32 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500" />
            <div
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
            <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-red-500 to-transparent" />
          </div>
        </motion.div>

        {/* States */}
        {(isLoading || isFetching) && (
          <div className="flex justify-center py-12 sm:py-16">
            <div className="flex flex-col items-center gap-4">
              <Spinner />
              <span className="text-gray-400 font-medium text-sm sm:text-base">
                Loading events...
              </span>
            </div>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 sm:py-16"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
              Unable to Load Events
            </h3>
            <p className="text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
              {error.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary justify-center gap-2 bg-gradient-to-r from-yellow-500 to-red-600 border-0"
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
            className="text-center py-12 sm:py-16"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
              No Events Scheduled
            </h3>
            <p className="text-gray-400 max-w-md mx-auto mb-4 sm:mb-6 text-sm sm:text-base">
              We're planning exciting events and tournaments. Stay tuned for
              updates!
            </p>
            <div className="inline-flex items-center gap-2 text-yellow-500 font-semibold text-sm sm:text-base">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Coming Soon</span>
            </div>
          </motion.div>
        )}

        {/* Events Grid */}
        {eventList.length > 0 && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
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
                    className="group relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-lg overflow-hidden hover:shadow-xl hover:shadow-yellow-500/10 hover:border-yellow-500/30 transition-all transform hover:-translate-y-2 flex flex-col h-full"
                    variants={variants.card}
                    whileHover={{ y: -8 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: idx * 0.07 }}
                  >
                    {/* Image */}
                    <div className="relative h-48 sm:h-56 overflow-hidden">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                          <Calendar className="w-12 h-12 text-yellow-500/50" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold shadow-md text-white">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline-block mr-1.5 text-yellow-500" />
                        {date.single
                          ? date.start
                          : `${date.start} - ${date.end}`}
                      </div>
                      {event.tag && (
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-gradient-to-r from-yellow-500 to-red-600 text-white px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-lg uppercase tracking-wide">
                          {event.tag}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 sm:p-6 flex flex-col flex-grow">
                      <div className="flex items-center text-xs sm:text-sm text-gray-400 mb-2 font-medium">
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 text-yellow-500" />
                        Upcoming Event
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-yellow-500 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between text-xs sm:text-sm border-t border-white/10 pt-4 text-gray-500 group-hover:text-yellow-500/80 transition-colors mt-auto">
                        <div className="flex items-center font-medium">
                          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                          <span className="truncate max-w-[120px] sm:max-w-none">
                            Ghatak Sports Academy
                          </span>
                        </div>
                        <button
                          onClick={() => handleReadMore(event)}
                          className="flex items-center gap-1 cursor-pointer font-bold text-yellow-500 hover:text-red-500 transition-colors"
                        >
                          Read More
                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
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
            className="text-center mt-12 md:mt-16"
          >
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-sm">
              <button
                onClick={() => navigate('/events')}
                className="btn-primary w-full sm:w-auto justify-center px-8 py-3 text-base sm:text-lg shadow-lg shadow-yellow-500/20 bg-gradient-to-r from-yellow-500 to-red-600 border-0 text-white"
              >
                View All Events
              </button>
              <span className="text-gray-400 text-sm sm:text-base font-medium">
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
}
