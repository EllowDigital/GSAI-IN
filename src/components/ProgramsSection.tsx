import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Sparkles, Zap, Target, Shield } from 'lucide-react';

// Program data
const programs = [
  {
    icon: '🥋',
    title: 'Karate',
    desc: 'Traditional strikes & self-discipline',
    category: 'Traditional',
    level: 'Beginner to Advanced',
  },
  {
    icon: '🦵',
    title: 'Taekwondo',
    desc: 'Dynamic kicks & sparring',
    category: 'Olympic Sport',
    level: 'All Levels',
  },
  {
    icon: '🥊',
    title: 'Boxing',
    desc: 'Build stamina & precision',
    category: 'Combat Sport',
    level: 'Beginner to Pro',
  },
  {
    icon: '🥋',
    title: 'Kickboxing',
    desc: 'Cardio meets combat',
    category: 'Fitness',
    level: 'All Levels',
  },
  {
    icon: '🤼',
    title: 'Grappling',
    desc: 'Ground control tactics',
    category: 'Combat Sport',
    level: 'Intermediate+',
  },
  {
    icon: '🥋',
    title: 'MMA',
    desc: 'Striking & grappling combined',
    category: 'Mixed Martial Arts',
    level: 'Advanced',
  },
  {
    icon: '🕉️',
    title: 'Kalaripayattu',
    desc: "India's ancient warrior art",
    category: 'Traditional',
    level: 'All Levels',
  },
  {
    icon: '🛡️',
    title: 'Self-Defense',
    desc: 'Practical safety training',
    category: 'Life Skills',
    level: 'Beginner',
  },
  {
    icon: '🏋️',
    title: 'Fat Loss',
    desc: 'Burn fat, build agility',
    category: 'Fitness',
    level: 'All Levels',
  },
];

// Animation variants
const containerVariants: Variants = {
  offscreen: {},
  onscreen: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants: Variants = {
  offscreen: { opacity: 0, y: 40 },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      bounce: 0.4,
      duration: 0.6,
    },
  },
};

const headerVariants: Variants = {
  offscreen: { opacity: 0, y: 30 },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export default function ProgramsSection() {
  return (
    <section
      id="programs"
      className="section-shell relative bg-[#0a0a0a] overflow-hidden py-12 md:py-20 lg:py-24"
    >
      {/* Background Gradients */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 md:w-80 md:h-80 bg-yellow-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 md:w-96 md:h-96 bg-red-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      {/* Floating Icons */}
      <Sparkles className="absolute top-20 right-16 w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 opacity-30 animate-float" />
      <Zap
        className="absolute bottom-24 left-16 w-8 h-8 sm:w-10 sm:h-10 text-red-500 opacity-25 animate-float"
        style={{ animationDelay: '2s' }}
      />
      <Target
        className="absolute top-1/3 left-8 w-5 h-5 sm:w-6 sm:h-6 text-orange-500 opacity-20 animate-float"
        style={{ animationDelay: '4s' }}
      />

      <div className="section-stack relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 md:mb-16 lg:mb-20"
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.3 }}
          variants={headerVariants}
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-base sm:text-lg font-semibold text-yellow-500 tracking-wide uppercase">
              Training Excellence
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            <span className="text-white">Programs &</span>{' '}
            <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
              Training
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-2">
            Explore a diverse range of martial arts and fitness programs crafted
            to foster strength, confidence, and personal mastery for all ages
            and skill levels.
          </p>

          {/* Divider */}
          <div className="flex justify-center items-center gap-2 sm:gap-4 mt-6 sm:mt-8">
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

        {/* Program Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {programs.map((prog) => (
            <motion.div
              key={prog.title}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              className="group relative bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-5 sm:p-6 lg:p-8 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-yellow-500/10 border border-white/10 hover:border-yellow-500/30 overflow-hidden flex flex-col h-full"
            >
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl sm:text-5xl lg:text-6xl transform group-hover:scale-110 transition-transform duration-300">
                    {prog.icon}
                  </div>
                  <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full border border-yellow-500/20">
                    {prog.category}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white group-hover:text-yellow-500 transition-colors mb-2">
                  {prog.title}
                </h3>

                <p className="text-gray-400 font-medium text-sm sm:text-base leading-relaxed mb-4 flex-grow">
                  {prog.desc}
                </p>

                <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500 font-medium mb-5 pt-4 border-t border-white/10 group-hover:border-yellow-500/20 transition-colors">
                  <span>Level:</span>
                  <span className="text-gray-300 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    {prog.level}
                  </span>
                </div>

                <div className="mt-auto">
                  <a
                    href="#contact"
                    className="btn-primary w-full justify-center gap-2 py-2.5 text-sm sm:text-base bg-gradient-to-r from-yellow-500 to-red-600 hover:from-yellow-400 hover:to-red-500 border-0 text-white"
                  >
                    <span>Learn more</span>
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-12 md:mt-16 lg:mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
            <a
              href="#contact"
              className="btn-primary w-full sm:w-auto justify-center px-8 py-3 text-base sm:text-lg shadow-lg shadow-yellow-500/20 bg-gradient-to-r from-yellow-500 to-red-600 hover:from-yellow-400 hover:to-red-500 border-0 text-white"
            >
              Start Your Journey Today
            </a>
            <span className="text-gray-400 text-sm sm:text-base font-medium">
              Free consultation & trial class available
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
