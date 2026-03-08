import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Trophy, Award, Sparkles } from 'lucide-react';

interface CompResult {
  position: string;
  students: { name: string; program: string } | null;
  competitions: { name: string; date: string } | null;
}

const MEDAL_MAP: Record<
  string,
  { emoji: string; label: string; glow: string; border: string }
> = {
  gold: {
    emoji: '🥇',
    label: 'Gold',
    glow: 'shadow-yellow-500/20',
    border: 'border-yellow-500/30',
  },
  silver: {
    emoji: '🥈',
    label: 'Silver',
    glow: 'shadow-gray-400/20',
    border: 'border-gray-400/30',
  },
  bronze: {
    emoji: '🥉',
    label: 'Bronze',
    glow: 'shadow-orange-500/20',
    border: 'border-orange-500/30',
  },
};

const variants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  },
  card: {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  },
  header: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  },
};

export default function CompetitionResultsSection() {
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['public-achievements'],
    queryFn: async () => {
      const { data, error } = (await supabase
        .from('competition_registrations')
        .select('position, students(name, program), competitions(name, date)')
        .in('position', ['gold', 'silver', 'bronze'])
        .order('registered_at', { ascending: false })
        .limit(12)) as any;
      if (error) throw error;
      return (data || []) as CompResult[];
    },
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading || results.length === 0) return null;

  return (
    <section
      id="results"
      className="section-shell relative bg-[#0a0a0a] overflow-hidden py-12 md:py-20 lg:py-24"
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 md:w-80 md:h-80 bg-yellow-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-72 h-72 md:w-96 md:h-96 bg-orange-500/15 rounded-full blur-3xl" />
      </div>

      {/* Floating Icons */}
      <Trophy className="absolute top-14 left-8 w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 opacity-25 animate-float" />
      <Sparkles
        className="absolute bottom-16 right-8 w-7 h-7 sm:w-9 sm:h-9 text-orange-500 opacity-20 animate-float"
        style={{ animationDelay: '3s' }}
      />

      <div className="section-stack relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12 md:mb-16 lg:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={variants.header}
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-base sm:text-lg font-semibold text-yellow-500 tracking-wide uppercase">
              Our Champions
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Competition{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
              Results
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
            Celebrating the achievements of our martial arts athletes on the
            national and international stage.
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

        {/* Results Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={variants.container}
        >
          {results.map((r, i) => {
            const medal = MEDAL_MAP[r.position] || MEDAL_MAP.gold;
            return (
              <motion.div
                key={i}
                variants={variants.card}
                className={`group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden hover:${medal.border} transition-all duration-500 hover:shadow-lg ${medal.glow}`}
              >
                <div className="p-5 flex items-center gap-4">
                  {/* Medal */}
                  <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">
                    {medal.emoji}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-bold text-white text-sm sm:text-base truncate group-hover:text-yellow-400 transition-colors duration-300">
                      {r.students?.name}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 truncate">
                      {r.competitions?.name}
                    </p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border ${
                          r.position === 'gold'
                            ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                            : r.position === 'silver'
                              ? 'bg-gray-400/15 text-gray-300 border-gray-400/30'
                              : 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                        }`}
                      >
                        {medal.label}
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-500">
                        {r.students?.program}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom accent */}
                <div className="h-0.5 w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            );
          })}
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
            <a href="#competitions">
              <button className="btn-primary w-full sm:w-auto justify-center px-8 py-3 text-base sm:text-lg shadow-lg shadow-yellow-500/20 bg-gradient-to-r from-yellow-500 to-red-600 border-0 text-white gap-2">
                View Upcoming Competitions <Trophy className="w-4 h-4" />
              </button>
            </a>
            <span className="text-gray-400 text-sm sm:text-base font-medium">
              See what's coming next and compete with the best
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
