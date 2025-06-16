
import { motion, Variants } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const programs = [
  {
    icon: '🥋',
    title: 'Karate',
    desc: 'Traditional strikes & self-discipline',
  },
  { icon: '🦵', title: 'Taekwondo', desc: 'Dynamic kicks & sparring' },
  { icon: '🥊', title: 'Boxing', desc: 'Build stamina & precision' },
  { icon: '🥋', title: 'Kickboxing', desc: 'Cardio meets combat' },
  { icon: '🤼', title: 'Grappling', desc: 'Ground control tactics' },
  { icon: '🥋', title: 'MMA', desc: 'Striking & grappling combined' },
  { icon: '🕉️', title: 'Kalaripayattu', desc: 'India's ancient warrior art' },
  { icon: '🛡️', title: 'Self-Defense', desc: 'Practical safety training' },
  { icon: '🏋️', title: 'Fat Loss', desc: 'Burn fat, build agility' },
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

export default function ProgramsSection() {
  return (
    <section
      id="programs"
      className="bg-gradient-to-br from-gray-900 via-blue-900/90 to-purple-900/80 py-10 xs:py-14 md:py-20 px-2 xs:px-3 md:px-4 relative overflow-hidden"
    >
      {/* Glassmorphism Background Elements */}
      <div className="absolute left-1 top-4 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl backdrop-blur-sm" />
      <div className="absolute right-0 bottom-5 w-48 h-48 bg-gradient-to-br from-red-400/15 to-pink-400/15 rounded-full blur-3xl backdrop-blur-sm animate-pulse" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center justify-center p-3 mb-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-neumorphic border border-white/20">
            <span className="text-4xl mr-3">🥋</span>
            <span className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">Programs & Training</span>
          </div>
          
          <h2 className="text-2xl xs:text-3xl md:text-4xl font-bold text-yellow-400 mb-3 xs:mb-7 tracking-wide text-center relative">
            <span className="inline-block">
              Elite Training Programs
              <span className="block h-1 w-16 mx-auto bg-gradient-to-r from-yellow-400 via-yellow-200 to-red-400 rounded-full mt-2" />
            </span>
          </h2>
        </div>
        
        <motion.div
          className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 xs:gap-5 md:gap-8"
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {programs.map((prog) => (
            <motion.div
              key={prog.title}
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-neumorphic p-5 xs:p-7 flex flex-col items-center justify-center transition-all duration-500 hover:bg-white/15 hover:shadow-neumorphic-hover cursor-pointer border border-white/20 hover:border-white/30 group"
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-4xl xs:text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">{prog.icon}</span>
              <h3 className="font-extrabold text-base xs:text-lg text-white mb-1 text-center group-hover:text-yellow-300 transition-colors duration-300">
                {prog.title}
              </h3>
              <p className="text-gray-300 font-medium text-center text-sm xs:text-base group-hover:text-gray-200 transition-colors duration-300">
                {prog.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
