
import React from 'react';
import Spinner from '@/components/ui/spinner';
import { motion, AnimatePresence } from 'framer-motion';
import { useEventsQuery } from '@/hooks/useEventsQuery';
import { Calendar, Clock, MapPin, Tag, ArrowRight, Sparkles } from 'lucide-react';

const EventsSection: React.FC = () => {
  const { data: events, isLoading, error, isFetching } = useEventsQuery();
  // Make sure we always deal with an array
  const eventList = events ?? [];

  function formatDateRange(from?: string | null, to?: string | null) {
    if (!from) return '';
    const start = new Date(from);
    const end = to ? new Date(to) : null;
    
    if (end && start.getTime() !== end.getTime()) {
      return {
        start: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        end: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        single: false
      };
    }
    
    return {
      start: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      end: null,
      single: true
    };
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <section
      className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-amber-50/30 overflow-hidden"
      id="events"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-yellow-200/40 to-amber-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-orange-200/30 to-red-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-amber-200/20 to-yellow-200/20 rounded-full blur-3xl" />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-16 right-8 opacity-30 animate-float">
        <Sparkles className="w-8 h-8 text-yellow-400" />
      </div>
      <div className="absolute bottom-20 left-8 opacity-25 animate-float" style={{ animationDelay: '2s' }}>
        <Calendar className="w-10 h-10 text-amber-500" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16 lg:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={headerVariants}
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-yellow-600 tracking-wide">Upcoming & Highlights</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Events &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600">
              Tournaments
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Join us for exciting tournaments, workshops, and special events that bring our martial arts community together
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-yellow-400"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="h-px w-32 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400"></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="h-px w-16 bg-gradient-to-r from-orange-400 to-transparent"></div>
          </div>
        </motion.div>

        {/* Events Content */}
        {isLoading || isFetching ? (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <Spinner />
              <span className="text-gray-500 font-medium">Loading events...</span>
            </div>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Unable to Load Events</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span>Try Again</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ) : eventList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-yellow-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Events Scheduled</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              We're planning exciting events and tournaments. Stay tuned for updates!
            </p>
            <div className="inline-flex items-center gap-2 text-yellow-600 font-semibold">
              <Sparkles className="w-5 h-5" />
              <span>Coming Soon</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <AnimatePresence>
              {eventList.map((event, idx) => {
                const dateInfo = formatDateRange(event.from_date, event.end_date);
                
                return (
                  <motion.div
                    key={event.id}
                    className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-yellow-200 transition-all duration-500 transform hover:-translate-y-2"
                    variants={cardVariants}
                    whileHover={{ y: -8 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: idx * 0.07 }}
                  >
                    {/* Event Image */}
                    <div className="relative h-48 overflow-hidden">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center">
                          <div className="text-center">
                            <Calendar className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                            <span className="text-yellow-600 text-sm font-medium">Event Image</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Date Badge */}
                      <div className="absolute top-4 left-4">
                        <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4" />
                            <div className="text-sm font-semibold">
                              {dateInfo.single ? (
                                dateInfo.start
                              ) : (
                                <>
                                  {dateInfo.start} - {dateInfo.end}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tag Badge */}
                      {event.tag && (
                        <div className="absolute top-4 right-4">
                          <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                            {event.tag}
                          </div>
                        </div>
                      )}

                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Event Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                        <Clock className="w-4 h-4" />
                        <span>Upcoming Event</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-600 group-hover:to-amber-600 transition-all duration-300">
                        {event.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                        {event.description}
                      </p>
                      
                      {/* Event Details */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 group-hover:border-yellow-200 transition-colors duration-300">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>Ghatak Academy</span>
                        </div>
                        
                        {/* Learn More Button */}
                        <div className="flex items-center gap-2 text-yellow-600 font-semibold text-sm group-hover:gap-3 transition-all duration-300 cursor-pointer">
                          <span>Learn More</span>
                          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>

                      {/* Hover effect particles */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                      </div>
                    </div>

                    {/* Animated border effect */}
                    <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ padding: '2px' }}>
                      <div className="w-full h-full bg-white rounded-xl"></div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Call to Action */}
        {eventList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-16"
          >
            <div className="inline-flex flex-col sm:flex-row items-center gap-4">
              <button className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold text-lg rounded-xl hover:from-yellow-600 hover:to-amber-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
                View All Events
              </button>
              <span className="text-gray-600 text-sm">
                Stay updated with our latest events and tournaments
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default EventsSection;
