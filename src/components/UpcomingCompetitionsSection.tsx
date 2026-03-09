import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import {
  Trophy,
  Calendar,
  MapPin,
  ArrowRight,
  Users,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function UpcomingCompetitionsSection() {
  const { data: competitions = [], isLoading } = useQuery({
    queryKey: ['public-upcoming-competitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitions')
        .select(
          'id, name, date, end_date, location_text, description, image_url, status, max_participants'
        )
        .in('status', ['upcoming', 'ongoing'])
        .order('date', { ascending: true })
        .limit(6);
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return null;

  // Always render section wrapper with id for navbar anchor, show empty state if no competitions
  if (competitions.length === 0) {
    return (
      <section id="competitions" className="section-shell relative bg-[#0a0a0a] overflow-hidden py-12 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-base sm:text-lg font-semibold text-yellow-500 tracking-wide uppercase">
              Competitions
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Compete & <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">Excel</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-6">
            No upcoming competitions right now. Check back soon or browse past results!
          </p>
          <Link to="/competitions" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500 to-red-600 text-white font-bold shadow-lg shadow-yellow-500/20 hover:shadow-orange-500/40 transition-all">
            View All Competitions <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    );
  }

  const variants = {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12, delayChildren: 0.2 },
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
      id="competitions"
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
      <Trophy
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
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-base sm:text-lg font-semibold text-yellow-500 tracking-wide uppercase">
              Upcoming Tournaments
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Compete &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
              Excel
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
            Join upcoming competitions and showcase your martial arts skills.
            Login to Student Portal to register.
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

        {/* Competition Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={variants.container}
        >
          {competitions.map((comp: any) => (
            <motion.div
              key={comp.id}
              variants={variants.card}
              className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden hover:border-yellow-500/30 transition-all duration-500 hover:shadow-[0_8px_32px_rgba(234,179,8,0.15)]"
            >
              {comp.image_url && (
                <div className="h-40 sm:h-44 overflow-hidden relative">
                  <img
                    src={comp.image_url}
                    alt={comp.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                  {/* Status badge on image */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${
                        comp.status === 'ongoing'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}
                    >
                      {comp.status === 'ongoing' ? (
                        <>
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                          Live Now
                        </>
                      ) : (
                        'Upcoming'
                      )}
                    </span>
                  </div>
                </div>
              )}

              <div className={`p-5 space-y-3 ${!comp.image_url ? 'pt-6' : ''}`}>
                {/* Status badge when no image */}
                {!comp.image_url && (
                  <div className="mb-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        comp.status === 'ongoing'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}
                    >
                      {comp.status === 'ongoing' ? (
                        <>
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                          Live Now
                        </>
                      ) : (
                        'Upcoming'
                      )}
                    </span>
                  </div>
                )}

                <h3 className="font-bold text-white text-base sm:text-lg line-clamp-2 group-hover:text-yellow-400 transition-colors duration-300">
                  {comp.name}
                </h3>

                {comp.description && (
                  <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                    {comp.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-yellow-500" />
                    {format(new Date(comp.date), 'MMM d, yyyy')}
                    {comp.end_date &&
                      ` – ${format(new Date(comp.end_date), 'MMM d')}`}
                  </span>
                  {comp.location_text && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />{' '}
                      {comp.location_text}
                    </span>
                  )}
                  {comp.max_participants && (
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-red-500" /> Max{' '}
                      {comp.max_participants}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom gradient accent */}
              <div className="h-0.5 w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12 md:mt-16"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-sm">
            <Link to="/competitions">
              <button className="btn-primary w-full sm:w-auto justify-center px-8 py-3 text-base sm:text-lg shadow-lg shadow-yellow-500/20 bg-gradient-to-r from-yellow-500 to-red-600 border-0 text-white gap-2">
                View All Competitions <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <span className="text-gray-400 text-sm sm:text-base font-medium">
              Browse all tournaments & register via Student Portal
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
