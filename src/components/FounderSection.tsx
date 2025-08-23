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
      className="relative px-4 md:px-6 lg:px-8 py-20 md:py-32 bg-gradient-to-br from-white via-gray-50/30 to-yellow-50/20 overflow-hidden"
      aria-labelledby="founder-heading"
    >
      {/* Modern Background Elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-yellow-500/5 to-red-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-16 w-72 h-72 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 rounded-full blur-3xl" />

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

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          className="text-center mb-20"
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <div className="inline-flex items-center justify-center p-3 mb-8 bg-gradient-to-r from-yellow-500/10 to-red-500/10 rounded-full backdrop-blur-sm border border-yellow-200/30">
            <User className="w-6 h-6 text-yellow-600 mr-3" />
            <span className="text-sm font-semibold text-yellow-600 uppercase tracking-wider">
              Leadership
            </span>
          </div>
          
          <h2 
            id="founder-heading"
            className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-8 leading-tight"
          >
            Meet Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
              Visionary Leader
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
            Guiding champions with decades of martial arts mastery and
            unwavering dedication to excellence.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center mb-20">
          {/* Left: Founder Image */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative group">
              {/* Background Glow */}
              <div className="absolute -inset-6 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
              
              {/* Achievement Badge */}
              <div className="absolute -top-4 -left-4 z-20">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Medal className="w-8 h-8 text-white" />
                </motion.div>
              </div>
              
              {/* Main Image Container */}
              <div className="relative bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 rounded-3xl p-4 shadow-2xl group-hover:scale-105 transition-all duration-500">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
                  <img
                    src={founderImg}
                    alt="Mr. Nitesh Yadav - Founder & Director"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
              
              {/* Floating Element */}
              <div className="absolute -bottom-4 -right-4">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-8 h-8 text-yellow-500 opacity-80" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {/* Title & Badge */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-yellow-500/10 to-red-500/10 rounded-full backdrop-blur-sm border border-yellow-200/30">
                <span className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-yellow-600 uppercase tracking-wider">
                  Founder & Director
                </span>
              </div>
              
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Mr. Nitesh Yadav{' '}
                <span className="ml-2 text-2xl md:text-3xl">🥇</span>
              </h3>
            </div>

            {/* Description */}
            <div className="space-y-6">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                With a lifetime devoted to martial arts excellence, Mr. Nitesh Yadav{' '}
                <strong className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-red-600">
                  inspires champions
                </strong>{' '}
                and empowers individuals to unlock their hidden potential through 
                disciplined training and mentorship.
              </p>
              
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                His unwavering dedication as a mentor instills{' '}
                <strong className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                  discipline, confidence, and resilience
                </strong>{' '}
                in every student who steps into the academy.
              </p>
            </div>

            {/* Quote Section */}
            <motion.div
              className="relative p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Quote className="absolute top-4 left-4 w-6 h-6 text-yellow-500 opacity-50" />
              <blockquote className="text-lg font-medium text-gray-800 italic pl-10 leading-relaxed">
                "With decades of experience, I remain dedicated to the art of
                martial mastery and mentoring the champions of tomorrow."
              </blockquote>
              <cite className="block mt-4 text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-red-600 not-italic pl-10">
                — Mr. Nitesh Yadav
              </cite>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { number: '8+', label: 'Years Experience', gradient: 'from-yellow-500 to-orange-500' },
                { number: '500+', label: 'Students Trained', gradient: 'from-orange-500 to-red-500' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className={`text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${stat.gradient} mb-2`}>
                    {stat.number}
                  </div>
                  <div className="text-sm md:text-base font-semibold text-gray-700">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Call to Action */}
            <motion.div
              className="p-6 bg-gradient-to-r from-gray-900 via-yellow-900 to-red-900 rounded-2xl shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <p className="text-base md:text-lg text-gray-300 leading-relaxed">
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  Champion values, lifelong growth:
                </span>{' '}
                Your journey to strength, honor, and self-mastery begins at{' '}
                <strong className="text-white">
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
