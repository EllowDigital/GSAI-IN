import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { ArrowLeft, Filter, Shield, Search } from 'lucide-react';
import { programs } from '@/data/programsData';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import Seo from '@/components/Seo';

const containerVariants: Variants = {
  offscreen: {},
  onscreen: { transition: { staggerChildren: 0.08 } },
};

const cardVariants: Variants = {
  offscreen: { opacity: 0, y: 40 },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', bounce: 0.4, duration: 0.6 },
  },
};

export default function AllProgramsPage() {
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(programs.map((p) => p.category)))],
    []
  );
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(
    () =>
      activeCategory === 'All'
        ? programs
        : programs.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

  return (
    <>
      <Seo
        title="All Programs — Ghatak Sports Academy India"
        description="Explore all martial arts and fitness programs at GSAI. Filter by category to find the perfect training for you."
        canonical="https://ghataksportsacademy.com/programs"
      />
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0a] pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
          </div>

          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-base font-semibold text-yellow-500 tracking-wide uppercase">
                All Programs
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Our{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
                Training Programs
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Find the perfect martial arts or fitness program for your goals
            </p>
          </motion.div>

          {/* Category Filters */}
          <motion.div
            className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-yellow-500 to-red-600 text-white border-transparent shadow-lg shadow-yellow-500/20'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-yellow-500/30 hover:text-yellow-500'
                }`}
              >
                {cat === 'All' && (
                  <Filter className="w-3.5 h-3.5 inline mr-1.5" />
                )}
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            initial="offscreen"
            animate="onscreen"
            variants={containerVariants}
            key={activeCategory}
          >
            {filtered.map((prog) => (
              <motion.div
                key={prog.slug}
                variants={cardVariants}
                whileHover={{ y: -8 }}
                className="group relative bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6 lg:p-8 border border-white/10 hover:border-yellow-500/30 overflow-hidden flex flex-col h-full transition-all hover:shadow-2xl hover:shadow-yellow-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl sm:text-5xl transform group-hover:scale-110 transition-transform duration-300">
                      {prog.icon}
                    </div>
                    <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase tracking-wider rounded-full border border-yellow-500/20">
                      {prog.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-yellow-500 transition-colors mb-2">
                    {prog.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3 flex-grow">
                    {prog.desc}
                  </p>
                  <div className="text-xs text-gray-500 mb-1">
                    <span className="text-gray-300">{prog.ageGroup}</span> ·{' '}
                    <span className="text-gray-300">{prog.duration}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 font-medium mb-5 pt-3 border-t border-white/10">
                    <span>Level:</span>
                    <span className="text-gray-300 font-bold bg-white/5 px-2 py-0.5 rounded">
                      {prog.level}
                    </span>
                  </div>
                  <Link
                    to={`/programs/${prog.slug}`}
                    aria-label={`Learn more about ${prog.title}`}
                    className="btn-primary w-full justify-center gap-2 py-2.5 text-sm bg-gradient-to-r from-yellow-500 to-red-600 hover:from-yellow-400 hover:to-red-500 border-0 text-white"
                  >
                    Learn more about {prog.title} →
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <FooterSection />
      </main>
    </>
  );
}
