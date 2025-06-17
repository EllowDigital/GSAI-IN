
import { motion, Variants } from 'framer-motion';
import { Sparkles, Zap, Target, Shield } from 'lucide-react';

const programs = [
  {
    icon: '🥋',
    title: 'Karate',
    desc: 'Traditional strikes & self-discipline',
    category: 'Traditional',
    level: 'Beginner to Advanced',
    duration: '60 min'
  },
  { 
    icon: '🦵', 
    title: 'Taekwondo', 
    desc: 'Dynamic kicks & sparring',
    category: 'Olympic Sport',
    level: 'All Levels',
    duration: '90 min'
  },
  { 
    icon: '🥊', 
    title: 'Boxing', 
    desc: 'Build stamina & precision',
    category: 'Combat Sport',
    level: 'Beginner to Pro',
    duration: '75 min'
  },
  { 
    icon: '🥋', 
    title: 'Kickboxing', 
    desc: 'Cardio meets combat',
    category: 'Fitness',
    level: 'All Levels',
    duration: '60 min'
  },
  { 
    icon: '🤼', 
    title: 'Grappling', 
    desc: 'Ground control tactics',
    category: 'Combat Sport',
    level: 'Intermediate+',
    duration: '90 min'
  },
  { 
    icon: '🥋', 
    title: 'MMA', 
    desc: 'Striking & grappling combined',
    category: 'Mixed Martial Arts',
    level: 'Advanced',
    duration: '120 min'
  },
  { 
    icon: '🕉️', 
    title: 'Kalaripayattu', 
    desc: 'India\'s ancient warrior art',
    category: 'Traditional',
    level: 'All Levels',
    duration: '90 min'
  },
  { 
    icon: '🛡️', 
    title: 'Self-Defense', 
    desc: 'Practical safety training',
    category: 'Life Skills',
    level: 'Beginner',
    duration: '45 min'
  },
  { 
    icon: '🏋️', 
    title: 'Fat Loss', 
    desc: 'Burn fat, build agility',
    category: 'Fitness',
    level: 'All Levels',
    duration: '60 min'
  },
];

const containerVariants: Variants = {
  offscreen: {},
  onscreen: {
    transition: {
      staggerChildren: 0.08,
    },
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
      ease: [0.4, 0, 0.2, 1]
    },
  },
};

export default function ProgramsSection() {
  return (
    <section
      id="programs"
      className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-slate-900 to-black overflow-hidden"
    >
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-80 h-80 bg-gradient-to-r from-yellow-400/30 to-orange-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-red-400/20 to-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-20 right-16 opacity-30 animate-float">
        <Sparkles className="w-8 h-8 text-yellow-400" />
      </div>
      <div className="absolute bottom-24 left-16 opacity-25 animate-float" style={{ animationDelay: '2s' }}>
        <Zap className="w-10 h-10 text-orange-400" />
      </div>
      <div className="absolute top-1/3 left-8 opacity-20 animate-float" style={{ animationDelay: '4s' }}>
        <Target className="w-6 h-6 text-red-400" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16 lg:mb-20"
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.3 }}
          variants={headerVariants}
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-yellow-400 tracking-wide">Training Excellence</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-white">Programs &</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
              Training
            </span>
          </h2>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Discover our comprehensive range of martial arts and fitness programs designed to build strength, 
            discipline, and character for practitioners of all levels.
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-yellow-400"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="h-px w-32 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"></div>
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="h-px w-16 bg-gradient-to-r from-red-400 to-transparent"></div>
          </div>
        </motion.div>

        {/* Programs Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {programs.map((prog, index) => (
            <motion.div
              key={prog.title}
              className="group relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer border border-gray-100/50 hover:border-yellow-200 overflow-hidden"
              variants={cardVariants}
              whileHover={{ y: -8 }}
            >
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 via-white to-orange-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Program Icon & Category */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl lg:text-6xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                    {prog.icon}
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 text-xs font-semibold rounded-full">
                      {prog.category}
                    </span>
                  </div>
                </div>

                {/* Program Title */}
                <h3 className="font-bold text-xl lg:text-2xl text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors duration-300">
                  {prog.title}
                </h3>

                {/* Program Description */}
                <p className="text-gray-600 font-medium text-base lg:text-lg leading-relaxed mb-4">
                  {prog.desc}
                </p>

                {/* Program Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">Level:</span>
                    <span className="text-gray-700 font-semibold">{prog.level}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">Duration:</span>
                    <span className="text-gray-700 font-semibold">{prog.duration}</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t border-gray-100 group-hover:border-yellow-200 transition-colors duration-300">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-xl">
                    <span>Learn More</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-orange-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16 lg:mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <button className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold text-lg rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
              Start Your Journey Today
            </button>
            <span className="text-gray-300 text-sm">
              Free consultation & trial class available
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
