import React from 'react';
import { Medal, User, Sparkles, Quote } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
const founderImg = '/assets/img/founder.webp';

const containerVariants: Variants = {
  offscreen: {},
  onscreen: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  offscreen: { opacity: 0, y: 40 },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      bounce: 0.4,
      duration: 0.8,
    },
  },
};

const imageVariants: Variants = {
  offscreen: { opacity: 0, scale: 0.8 },
  onscreen: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      bounce: 0.3,
      duration: 1,
    },
  },
};

export default function FounderSection() {
  return (
    <section
      id="founder"
      className="relative px-4 py-16 sm:py-20 md:py-28 lg:py-32 bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-100 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-60 h-60 sm:w-72 sm:h-72 bg-gradient-to-r from-yellow-200/40 to-orange-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-r from-amber-200/30 to-yellow-200/30 rounded-full blur-3xl" />
      </div>

      {/* Floaters */}
      <div className="absolute top-10 right-6 sm:right-8 opacity-20 animate-float">
        <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
      </div>
      <div
        className="absolute bottom-16 left-6 sm:left-8 opacity-15 animate-float"
        style={{ animationDelay: '1s' }}
      >
        <Medal className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500" />
      </div>

      <motion.div
        className="relative z-10 max-w-7xl mx-auto"
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16 md:mb-20"
          variants={itemVariants}
        >
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-base sm:text-lg font-semibold text-yellow-600 tracking-wide">
              Leadership
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            Meet Our
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-amber-500">
              Visionary Leader
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Guiding champions with decades of martial arts mastery and
            unwavering dedication to excellence.
          </p>
        </motion.div>

        {/* Content */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          <motion.div className="flex justify-center" variants={imageVariants}>
            <div className="relative group w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96">
              <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-amber-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="absolute -top-6 -left-6 z-20">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                  <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
              </div>
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-yellow-100 to-orange-100 p-2 group-hover:scale-105 transition-transform duration-500">
                <img
                  src={founderImg}
                  alt="Mr. Nitesh Yadav - Founder & Director"
                  className="w-full h-full object-cover rounded-2xl"
                  loading="lazy"
                />
                <div className="absolute inset-2 rounded-2xl bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="absolute -bottom-4 -right-4 animate-bounce">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 opacity-80" />
              </div>
            </div>
          </motion.div>

          <motion.div className="space-y-8" variants={itemVariants}>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full border border-yellow-300/50">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs sm:text-sm font-semibold text-orange-700 uppercase tracking-wide">
                  Founder & Director
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                Mr. Nitesh Yadav{' '}
                <span className="ml-2 text-xl sm:text-2xl">🥇</span>
              </h3>
            </div>

            <div className="space-y-4 text-gray-700">
              <p className="text-base sm:text-lg leading-relaxed">
                With a lifetime devoted to martial arts excellence, Mr. Nitesh
                Yadav
                <strong className="text-gray-900">
                  {' '}
                  inspires champions
                </strong>{' '}
                and empowers individuals to unlock their hidden potential
                through disciplined training and mentorship.
              </p>
              <p className="text-base sm:text-lg leading-relaxed">
                His unwavering dedication as a mentor instills
                <strong className="text-orange-600">
                  {' '}
                  discipline, confidence, and resilience
                </strong>{' '}
                in every student who steps into the academy.
              </p>
            </div>

            <motion.div
              className="relative p-4 sm:p-6 bg-gradient-to-r from-yellow-100 via-orange-100 to-amber-100 rounded-2xl border border-yellow-300/30"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Quote className="absolute top-4 left-4 w-5 h-5 sm:w-6 sm:h-6 text-orange-400 opacity-50" />
              <blockquote className="text-base sm:text-lg font-medium text-gray-800 italic pl-8">
                "With decades of experience, I remain dedicated to the art of
                martial mastery and mentoring the champions of tomorrow."
              </blockquote>
              <cite className="block mt-3 text-sm font-semibold text-orange-600 not-italic pl-8">
                — Mr. Nitesh Yadav
              </cite>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
                <div className="text-xl sm:text-2xl font-bold text-orange-600 mb-1">
                  8+
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                  Years Experience
                </div>
              </div>
              <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
                <div className="text-xl sm:text-2xl font-bold text-yellow-600 mb-1">
                  500+
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                  Students Trained
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                <span className="font-semibold text-orange-600">
                  Champion values, lifelong growth:
                </span>{' '}
                Your journey to strength, honor, and self-mastery begins at{' '}
                <strong className="text-gray-900">
                  Ghatak Sports Academy India™
                </strong>
                .
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
