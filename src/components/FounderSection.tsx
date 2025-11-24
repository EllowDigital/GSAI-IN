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
      className="section-shell relative bg-gradient-to-br from-white via-orange-50/30 to-yellow-50/20 overflow-hidden py-12 md:py-20 lg:py-24"
      aria-labelledby="founder-heading"
    >
      {/* Modern Background Elements */}
      <div className="absolute top-20 right-10 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-br from-yellow-500/10 to-red-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-16 w-48 h-48 md:w-72 md:h-72 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-full blur-3xl" />

      {/* Floating Elements */}
      <div className="absolute top-10 right-6 sm:right-8 opacity-20 animate-pulse">
        <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
      </div>
      <div
        className="absolute bottom-16 left-6 sm:left-8 opacity-15 animate-bounce"
        style={{ animationDelay: '1s' }}
      >
        <Medal className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
      </div>

      <div className="section-stack relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          className="text-center mb-12 md:mb-16 lg:mb-20"
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <div className="inline-flex items-center justify-center p-2 sm:p-3 mb-6 bg-gradient-to-r from-yellow-500/10 to-red-500/10 rounded-full backdrop-blur-sm border border-yellow-200/30">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 mr-2 sm:mr-3" />
            <span className="text-xs sm:text-sm font-semibold text-yellow-600 uppercase tracking-wider">
              Leadership
            </span>
          </div>

          <h2
            id="founder-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight"
          >
            Meet Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
              Visionary Leader
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium px-4">
            Guiding champions with decades of martial arts mastery and
            unwavering dedication to excellence.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-10 md:gap-16 lg:gap-20 items-center mb-12 md:mb-20">
          {/* Left: Founder Image */}
          <motion.div
            className="relative max-w-md mx-auto lg:max-w-none w-full"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative group">
              {/* Background Glow */}
              <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 rounded-[2rem] blur-2xl group-hover:blur-3xl transition-all duration-500" />

              {/* Achievement Badge */}
              <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 z-20">
                <motion.div
                  className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-xl border-2 border-white"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </motion.div>
              </div>

              {/* Main Image Container */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-[2rem] p-3 sm:p-4 shadow-xl border border-white/50 group-hover:scale-[1.02] transition-all duration-500">
                <div className="relative w-full aspect-[4/5] sm:aspect-square rounded-2xl overflow-hidden bg-gray-100">
                  <img
                    src={founderImg}
                    alt="Mr. Nitesh Yadav - Founder & Director"
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>

              {/* Floating Element */}
              <div className="absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 z-20">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="bg-white p-2 rounded-full shadow-lg"
                >
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            className="space-y-6 sm:space-y-8"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {/* Title & Badge */}
            <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-yellow-500/10 to-red-500/10 rounded-full backdrop-blur-sm border border-yellow-200/30">
                <span className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs sm:text-sm font-semibold text-yellow-600 uppercase tracking-wider">
                  Founder & Director
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Mr. Nitesh Yadav{' '}
                <span className="inline-block ml-2 text-xl sm:text-2xl md:text-3xl align-middle">🥇</span>
              </h3>
            </div>

            {/* Description */}
            <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-gray-700 leading-relaxed text-center lg:text-left">
              <p>
                With a lifetime devoted to martial arts excellence, Mr. Nitesh
                Yadav{' '}
                <strong className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-red-600 font-bold">
                  inspires champions
                </strong>{' '}
                and empowers individuals to unlock their hidden potential
                through disciplined training and mentorship.
              </p>

              <p>
                His unwavering dedication as a mentor instills{' '}
                <strong className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 font-bold">
                  discipline, confidence, and resilience
                </strong>{' '}
                in every student who steps into the academy.
              </p>
            </div>

            {/* Quote Section */}
            <motion.div
              className="relative p-5 sm:p-6 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -5, scale: 1.01 }}
            >
              <Quote className="absolute top-4 left-4 w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 opacity-50" />
              <blockquote className="text-base sm:text-lg font-medium text-gray-800 italic pl-8 sm:pl-10 leading-relaxed">
                "With decades of experience, I remain dedicated to the art of
                martial mastery and mentoring the champions of tomorrow."
              </blockquote>
              <cite className="block mt-3 sm:mt-4 text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-red-600 not-italic pl-8 sm:pl-10">
                — Mr. Nitesh Yadav
              </cite>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {[
                {
                  number: '8+',
                  label: 'Years Experience',
                  gradient: 'from-yellow-500 to-orange-500',
                },
                {
                  number: '500+',
                  label: 'Students Trained',
                  gradient: 'from-orange-500 to-red-500',
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center p-4 sm:p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 hover:border-orange-200/50 transition-colors"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.03 }}
                >
                  <div
                    className={`text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${stat.gradient} mb-1 sm:mb-2`}
                  >
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base font-semibold text-gray-600">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Call to Action */}
            <motion.div
              className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-xl border border-slate-700/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed text-center lg:text-left">
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  Champion values, lifelong growth:
                </span>{' '}
                Your journey to strength, honor, and self-mastery begins at{' '}
                <strong className="text-white block sm:inline mt-1 sm:mt-0">
                  Ghatak Sports Academy India™
                </strong>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
