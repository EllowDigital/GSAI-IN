import React from 'react';
import {
  Award,
  Medal,
  Trophy,
  Sparkles,
  Star,
  Target,
  Crown,
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const achievements = [
  {
    icon: <Trophy className="w-8 h-8 md:w-10 md:h-10" />,
    title: 'National Championship Gold',
    description:
      'Anant Sahu secured gold with exceptional skill and dedication at the national level competition.',
    category: 'Championship',
    year: '2024',
    color: 'from-yellow-400 to-amber-500',
    bgColor: 'from-yellow-50 to-amber-50',
    iconBg: 'bg-gradient-to-r from-yellow-500 to-amber-600',
  },
  {
    icon: <Award className="w-8 h-8 md:w-10 md:h-10" />,
    title: 'Best Technique Award',
    description:
      'Awarded for innovative technique and flawless execution in martial arts demonstration.',
    category: 'Excellence',
    year: '2025',
    color: 'from-red-400 to-rose-500',
    bgColor: 'from-red-50 to-rose-50',
    iconBg: 'bg-gradient-to-r from-red-500 to-rose-600',
  },
  {
    icon: <Medal className="w-8 h-8 md:w-10 md:h-10" />,
    title: 'International Recognition',
    description:
      'Nitesh Yadav received global acclaim at a prestigious international martial arts competition.',
    category: 'Global',
    year: '2023',
    color: 'from-blue-400 to-indigo-500',
    bgColor: 'from-blue-50 to-indigo-50',
    iconBg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
  },
  {
    icon: <Star className="w-8 h-8 md:w-10 md:h-10" />,
    title: 'Rising Star Award',
    description:
      'Outstanding young talent recognition for exceptional performance and dedication to martial arts.',
    category: 'Youth',
    year: '2025',
    color: 'from-purple-400 to-violet-500',
    bgColor: 'from-purple-50 to-violet-50',
    iconBg: 'bg-gradient-to-r from-purple-500 to-violet-600',
  },
  {
    icon: <Target className="w-8 h-8 md:w-10 md:h-10" />,
    title: 'Precision Excellence',
    description:
      'Perfect score achievement in accuracy and precision during competitive martial arts evaluation.',
    category: 'Performance',
    year: '2025',
    color: 'from-green-400 to-emerald-500',
    bgColor: 'from-green-50 to-emerald-50',
    iconBg: 'bg-gradient-to-r from-green-500 to-emerald-600',
  },
  {
    icon: <Crown className="w-8 h-8 md:w-10 md:h-10" />,
    title: 'Academy Excellence',
    description:
      'Ghatak Sports Academy recognized as the leading martial arts training center in the region.',
    category: 'Institution',
    year: '2025',
    color: 'from-orange-400 to-red-500',
    bgColor: 'from-orange-50 to-red-50',
    iconBg: 'bg-gradient-to-r from-orange-500 to-red-600',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export default function AchievementSection() {
  return (
    <section
      id="achievements"
      className="section-shell relative bg-[#0a0a0a] overflow-hidden py-12 md:py-20 lg:py-24"
      aria-labelledby="achievements-heading"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 md:w-72 md:h-72 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 md:w-80 md:h-80 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 bg-gradient-to-r from-yellow-500/10 to-red-500/10 rounded-full blur-3xl" />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-16 right-8 opacity-30 animate-float">
        <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
      </div>
      <div
        className="absolute bottom-20 left-8 opacity-25 animate-float"
        style={{ animationDelay: '2s' }}
      >
        <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
      </div>

      <div className="section-stack relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 md:mb-16 lg:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={headerVariants}
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-base sm:text-lg font-semibold text-yellow-500 tracking-wide uppercase">
              Excellence & Recognition
            </span>
          </div>

          <h2
            id="achievements-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight"
          >
            Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
              Achievements
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
            Celebrating proud moments and milestones achieved by our dedicated
            athletes and academy, showcasing excellence in martial arts and
            character development.
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-yellow-500"></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <div className="h-px w-20 sm:w-32 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500"></div>
            <div
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"
              style={{ animationDelay: '0.5s' }}
            ></div>
            <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-red-500 to-transparent"></div>
          </div>
        </motion.div>

        {/* Achievements Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              className="group relative bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 overflow-hidden hover:shadow-2xl hover:shadow-yellow-500/10 hover:border-yellow-500/30 transition-all duration-500 transform hover:-translate-y-2 flex flex-col h-full"
              variants={cardVariants}
              whileHover={{ y: -8 }}
            >
              {/* Background gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${achievement.bgColor} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
              ></div>

              {/* Content */}
              <div className="relative z-10 p-5 sm:p-6 lg:p-8 flex flex-col h-full">
                {/* Header with icon and category */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${achievement.iconBg} rounded-xl flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
                  >
                    {React.cloneElement(
                      achievement.icon as React.ReactElement,
                      {
                        className: 'w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9',
                      }
                    )}
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-white/10 text-gray-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full mb-1 border border-white/5">
                      {achievement.category}
                    </span>
                    <div className="text-xs sm:text-sm font-bold text-gray-400">
                      {achievement.year}
                    </div>
                  </div>
                </div>

                {/* Achievement Title */}
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3 group-hover:text-yellow-500 transition-all duration-300">
                  {achievement.title}
                </h3>

                {/* Achievement Description */}
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 flex-grow">
                  {achievement.description}
                </p>

                {/* Achievement Highlight */}
                <div className="flex items-center gap-2 pt-4 border-t border-white/10 group-hover:border-yellow-500/20 transition-colors duration-300 mt-auto">
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current"
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-300 ml-2">
                    Excellence Rating
                  </span>
                </div>

                {/* Hover effect particles */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 animate-pulse" />
                </div>
              </div>

              {/* Animated border effect */}
              <div
                className={`absolute inset-0 border-2 border-transparent bg-gradient-to-r ${achievement.color} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none`}
                style={{ padding: '2px' }}
              >
                <div className="w-full h-full bg-transparent rounded-xl"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="mt-12 md:mt-16 lg:mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-sm hover:shadow-md hover:shadow-yellow-500/10 transition-all">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-500 mb-1 sm:mb-2">
                50+
              </div>
              <div className="text-xs sm:text-sm text-gray-400 font-medium">
                Awards Won
              </div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-sm hover:shadow-md hover:shadow-red-500/10 transition-all">
              <div className="text-2xl sm:text-3xl font-bold text-red-500 mb-1 sm:mb-2">
                15+
              </div>
              <div className="text-xs sm:text-sm text-gray-400 font-medium">
                Championships
              </div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-sm hover:shadow-md hover:shadow-blue-500/10 transition-all">
              <div className="text-2xl sm:text-3xl font-bold text-blue-500 mb-1 sm:mb-2">
                200+
              </div>
              <div className="text-xs sm:text-sm text-gray-400 font-medium">
                Competitions
              </div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-sm hover:shadow-md hover:shadow-green-500/10 transition-all">
              <div className="text-2xl sm:text-3xl font-bold text-green-500 mb-1 sm:mb-2">
                95%
              </div>
              <div className="text-xs sm:text-sm text-gray-400 font-medium">
                Success Rate
              </div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-12 md:mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-sm">
            <a
              href="#contact"
              className="btn-primary w-full sm:w-auto justify-center px-8 py-3 text-base sm:text-lg shadow-lg shadow-yellow-500/20 bg-gradient-to-r from-yellow-500 to-red-600 hover:from-yellow-400 hover:to-red-500 border-0 text-white"
            >
              Join Our Champions
            </a>
            <span className="text-gray-400 text-sm sm:text-base font-medium">
              Start your journey to excellence today
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
