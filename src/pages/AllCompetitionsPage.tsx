import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import Seo from '@/components/Seo';
import { useEnhancedQuery } from '@/hooks/useEnhancedQuery';
import { supabase } from '@/integrations/supabase/client';
import Spinner from '@/components/ui/spinner';

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
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  },
};

const AllCompetitionsPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: competitions = [],
    isLoading,
    error,
  } = useEnhancedQuery({
    queryKey: ['competitions', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitions')
        .select(
          'id, name, date, end_date, location_text, description, image_url, status, max_participants'
        )
        .order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enableRealtime: true,
    realtimeTable: 'competitions',
    staleTime: 1000 * 60 * 2,
    retryAttempts: 3,
  });

  const upcoming = competitions.filter(
    (c: any) => c.status === 'upcoming' || c.status === 'ongoing'
  );
  const past = competitions.filter((c: any) => c.status === 'completed');

  const renderCard = (comp: any) => (
    <motion.div
      key={comp.id}
      variants={variants.card}
      className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden hover:border-yellow-500/30 transition-all duration-500 hover:shadow-[0_8px_32px_rgba(234,179,8,0.15)] flex flex-col"
    >
      {comp.image_url && (
        <div className="h-44 sm:h-52 overflow-hidden relative">
          <img
            src={comp.image_url}
            alt={comp.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${
                comp.status === 'ongoing'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : comp.status === 'completed'
                    ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}
            >
              {comp.status === 'ongoing' ? (
                <>
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />{' '}
                  Live Now
                </>
              ) : comp.status === 'completed' ? (
                'Completed'
              ) : (
                'Upcoming'
              )}
            </span>
          </div>
        </div>
      )}

      <div
        className={`p-5 sm:p-6 flex flex-col flex-grow ${!comp.image_url ? 'pt-6' : ''}`}
      >
        {!comp.image_url && (
          <div className="mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                comp.status === 'ongoing'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : comp.status === 'completed'
                    ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}
            >
              {comp.status === 'ongoing'
                ? '🔴 Live'
                : comp.status === 'completed'
                  ? 'Completed'
                  : 'Upcoming'}
            </span>
          </div>
        )}

        <h3 className="font-bold text-white text-lg sm:text-xl line-clamp-2 group-hover:text-yellow-400 transition-colors duration-300 mb-2">
          {comp.name}
        </h3>

        {comp.description && (
          <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed mb-4 flex-grow">
            {comp.description}
          </p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 pt-2 border-t border-white/10 mt-auto">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-yellow-500" />
            {format(new Date(comp.date), 'MMM d, yyyy')}
            {comp.end_date && ` – ${format(new Date(comp.end_date), 'MMM d')}`}
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

      <div className="h-0.5 w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );

  return (
    <>
      <Seo
        title="All Competitions - Ghatak Sports Academy India"
        description="Browse all competitions, tournaments and championships at Ghatak Sports Academy India. Register via Student Portal to participate."
        keywords={[
          'martial arts competitions',
          'karate tournament',
          'taekwondo championship',
          'MMA competition',
          'sports tournament lucknow',
        ]}
      />

      <Navbar />

      <main className="min-h-screen bg-black relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[100px]" />
        </div>

        <Sparkles className="absolute top-32 right-12 w-8 h-8 text-yellow-500 opacity-20 animate-float" />
        <Trophy
          className="absolute bottom-40 left-10 w-10 h-10 text-red-500 opacity-15 animate-float"
          style={{ animationDelay: '2s' }}
        />

        {/* Header */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 max-w-7xl mx-auto">
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

            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-500 tracking-wide uppercase">
                  All Competitions
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Competitions &{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
                  Championships
                </span>
              </h1>

              <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Explore all our competitions. Students can register via the
                Student Portal.
              </p>

              {/* Divider */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-yellow-500" />
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <div className="h-px w-32 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500" />
                <div
                  className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
                  style={{ animationDelay: '0.5s' }}
                />
                <div className="h-px w-16 bg-gradient-to-r from-red-500 to-transparent" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20 relative z-10">
          <div className="max-w-7xl mx-auto">
            {isLoading && (
              <div className="flex justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <Spinner className="text-yellow-500" />
                  <span className="text-gray-400 font-medium">
                    Loading competitions...
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
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                  <Trophy className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Unable to Load Competitions
                </h3>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all"
                >
                  Try Again <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {!error && !isLoading && competitions.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-12 h-12 text-yellow-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  No Competitions Yet
                </h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Stay tuned for upcoming tournaments and championships!
                </p>
              </motion.div>
            )}

            {/* Upcoming / Ongoing */}
            {upcoming.length > 0 && (
              <div className="mb-16">
                <motion.h2
                  className="text-2xl sm:text-3xl font-bold text-white mb-8 flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="w-1.5 h-8 bg-gradient-to-b from-yellow-500 to-red-500 rounded-full" />
                  Upcoming & Ongoing
                </motion.h2>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
                  variants={variants.container}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                >
                  {upcoming.map(renderCard)}
                </motion.div>
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <div>
                <motion.h2
                  className="text-2xl sm:text-3xl font-bold text-white mb-8 flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="w-1.5 h-8 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full" />
                  Past Competitions
                </motion.h2>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
                  variants={variants.container}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                >
                  {past.map(renderCard)}
                </motion.div>
              </div>
            )}

            {/* Register CTA */}
            {upcoming.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center mt-16"
              >
                <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                  <Link to="/student/login">
                    <button className="btn-primary w-full sm:w-auto justify-center px-8 py-3 text-base sm:text-lg shadow-lg shadow-yellow-500/20 bg-gradient-to-r from-yellow-500 to-red-600 border-0 text-white gap-2">
                      Register via Student Portal{' '}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                  <span className="text-gray-400 text-sm sm:text-base font-medium">
                    Login to register for competitions
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <FooterSection />
    </>
  );
};

export default AllCompetitionsPage;
