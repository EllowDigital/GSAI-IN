
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
      type: 'spring' as const,
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
      type: 'spring' as const,
      bounce: 0.3,
      duration: 1,
    },
  },
};

export default function FounderSection() {
  return (
    <section
      id="founder"
      className="relative px-4 py-20 md:py-32 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 overflow-hidden"
    >
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-200/40 to-indigo-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-amber-200/30 to-orange-200/30 rounded-full blur-3xl" />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-10 right-8 opacity-20 animate-float">
        <Sparkles className="w-8 h-8 text-amber-400" />
      </div>
      <div className="absolute bottom-16 left-8 opacity-15 animate-float" style={{ animationDelay: '1s' }}>
        <Medal className="w-10 h-10 text-blue-500" />
      </div>

      <motion.div
        className="relative z-10 max-w-7xl mx-auto"
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        {/* Section Header */}
        <motion.div className="text-center mb-16 md:mb-20" variants={itemVariants}>
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-blue-600 tracking-wide">Leadership</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Meet Our
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Visionary Leader
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Guiding champions with decades of martial arts mastery and unwavering dedication to excellence
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Founder Image */}
          <motion.div
            className="relative flex justify-center lg:justify-start"
            variants={imageVariants}
          >
            <div className="relative group">
              {/* Decorative ring */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
              
              {/* Badge */}
              <div className="absolute -top-6 -left-6 z-20">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                  <Medal className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Main image container */}
              <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-100 to-indigo-100 p-2 group-hover:scale-105 transition-transform duration-500">
                <img
                  src={founderImg}
                  alt="Mr. Nitesh Yadav - Founder & Director"
                  className="w-full h-full object-cover rounded-2xl"
                  loading="lazy"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-2 rounded-2xl bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Floating sparkle */}
              <div className="absolute -bottom-4 -right-4 animate-bounce">
                <Sparkles className="w-8 h-8 text-amber-400 opacity-80" />
              </div>
            </div>
          </motion.div>

          {/* Founder Details */}
          <motion.div className="space-y-8" variants={itemVariants}>
            {/* Name and Title */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200/50">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
                  Founder & Director
                </span>
              </div>
              
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
                Mr. Nitesh Yadav
                <span className="ml-2 text-2xl">🥇</span>
              </h3>
            </div>

            {/* Description */}
            <div className="space-y-6 text-gray-700">
              <p className="text-lg leading-relaxed">
                With a lifetime devoted to martial arts excellence, Mr. Nitesh Yadav 
                <strong className="text-gray-900"> inspires champions</strong> and empowers individuals to
                unlock their hidden potential through disciplined training and mentorship.
              </p>
              
              <p className="text-lg leading-relaxed">
                His unwavering dedication as a mentor instills 
                <strong className="text-blue-600"> discipline, confidence, and resilience</strong> in 
                every student who steps into the academy.
              </p>
            </div>

            {/* Quote */}
            <motion.div 
              className="relative p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200/30"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Quote className="absolute top-4 left-4 w-6 h-6 text-blue-400 opacity-50" />
              <blockquote className="text-lg font-medium text-gray-800 italic pl-8">
                "With decades of experience, I remain dedicated to the art of martial mastery 
                and mentoring the champions of tomorrow."
              </blockquote>
              <cite className="block mt-3 text-sm font-semibold text-blue-600 not-italic pl-8">
                — Mr. Nitesh Yadav
              </cite>
            </motion.div>

            {/* Achievement highlights */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
                <div className="text-2xl font-bold text-blue-600 mb-1">25+</div>
                <div className="text-sm text-gray-600 font-medium">Years Experience</div>
              </div>
              <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
                <div className="text-2xl font-bold text-indigo-600 mb-1">500+</div>
                <div className="text-sm text-gray-600 font-medium">Students Trained</div>
              </div>
            </div>

            {/* Mission statement */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-base text-gray-600 leading-relaxed">
                <span className="font-semibold text-blue-600">Champion values, lifelong growth:</span>{' '}
                Your journey to strength, honor, and self-mastery begins at{' '}
                <strong className="text-gray-900">Ghatak Sports Academy India™</strong>.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
