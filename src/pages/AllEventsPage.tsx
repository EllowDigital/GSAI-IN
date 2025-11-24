import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import { Seo } from '@/components/Seo';
import { EventModal } from '@/components/modals/EventModal';
import { useEnhancedQuery } from '@/hooks/useEnhancedQuery';
import { supabase } from '@/integrations/supabase/client';
import { formatErrorForDisplay } from '@/utils/errorHandling';
import Spinner from '@/components/ui/spinner';

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  from_date: string | null;
  end_date: string | null;
  date: string;
  image_url: string | null;
  tag: string | null;
};

const AllEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = React.useState<EventRow | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const {
    data: events = [],
    isLoading,
    error,
  } = useEnhancedQuery({
    queryKey: ['events', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('from_date', { ascending: false });

      if (error) throw error;
      return (data as EventRow[]) || [];
    },
    enableRealtime: true,
    realtimeTable: 'events',
    staleTime: 1000 * 60 * 2,
    retryAttempts: 3,
  });

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

  return (
    <>
      <Seo
        title="All Events - Ghatak Sports Academy India"
        description="Browse all upcoming events, tournaments, and workshops at Ghatak Sports Academy India. Join our martial arts community for exciting competitions and training sessions."
        keywords={[
          'martial arts events',
          'tournaments',
          'karate competitions',
          'taekwondo tournaments',
          'sports academy events',
        ]}
      />

      <Navbar />

      <main className="min-h-screen bg-black relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[100px]" />
        </div>

        {/* Header Section */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 max-w-7xl mx-auto">
            {/* Back Button */}
            <motion.button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 mb-8 px-4 py-2 text-gray-400 hover:text-yellow-500 transition-colors rounded-full hover:bg-white/5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </motion.button>

            {/* Page Header */}
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <Calendar className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-500 tracking-wide uppercase">
                  All Events
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Events &{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
                  Tournaments
                </span>
              </h1>

              <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Discover all our exciting tournaments, workshops, and special
                events. Join our martial arts community and be part of something
                amazing.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Events Content */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <Spinner className="text-yellow-500" />
                  <span className="text-gray-400 font-medium">
                    Loading all events...
                  </span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                  <Calendar className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Unable to Load Events
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  {formatErrorForDisplay(error)}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 shadow-lg shadow-red-600/20"
                >
                  Try Again
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* No Events State */}
            {!error && !isLoading && events.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <Calendar className="w-12 h-12 text-yellow-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  No Events Scheduled
                </h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  We're planning exciting events and tournaments. Stay tuned for
                  updates!
                </p>
                <div className="inline-flex items-center gap-2 text-yellow-500 font-semibold bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20">
                  <Sparkles className="w-5 h-5" />
                  <span>Coming Soon</span>
                </div>
              </motion.div>
            )}

            {/* Events Grid */}
            {events.length > 0 && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, staggerChildren: 0.1 }}
              >
                {events.map((event, idx) => {
                  const date = formatDateRange(event.from_date, event.end_date);
                  return (
                    <motion.div
                      key={event.id}
                      className="group relative bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden hover:border-yellow-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/10"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      whileHover={{ y: -8 }}
                    >
                      {/* Image */}
                      <div className="relative h-56 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                        {event.image_url ? (
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#111]">
                            <Calendar className="w-12 h-12 text-white/20" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md border border-white/10 text-white rounded-lg px-3 py-1 text-sm font-medium">
                          <Calendar className="w-4 h-4 inline-block mr-2 text-yellow-500" />
                          {date.single
                            ? date.start
                            : `${date.start} - ${date.end}`}
                        </div>
                        {event.tag && (
                          <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-yellow-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            {event.tag}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 relative z-20">
                        <div className="flex items-center text-sm text-yellow-500 mb-3 font-medium">
                          <Clock className="w-4 h-4 mr-2" />
                          Upcoming Event
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-yellow-500 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-3 mb-6 leading-relaxed">
                          {event.description}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <div className="flex items-center text-gray-400 text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="truncate max-w-[140px]">Ghatak Sports Academy</span>
                          </div>
                          <button
                            onClick={() => handleReadMore(event)}
                            className="flex items-center gap-2 text-white font-medium group/btn hover:text-yellow-500 transition-colors"
                          >
                            Read More
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <FooterSection />

      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onViewFullPage={handleViewFullPage}
      />
    </>
  );
};

export default AllEventsPage;
