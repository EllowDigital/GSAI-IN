
import { Award, Medal, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const achievements = [
  {
    icon: (
      <Trophy
        className="text-yellow-500 w-10 h-10 md:w-12 md:h-12"
        aria-hidden="true"
      />
    ),
    title: 'National Championship Gold',
    description:
      'Anant Sahu secured gold with exceptional skill and dedication.',
  },
  {
    icon: (
      <Award
        className="text-red-500 w-10 h-10 md:w-12 md:h-12"
        aria-hidden="true"
      />
    ),
    title: 'Best Technique Award',
    description: 'Awarded for innovative technique and flawless execution.',
  },
  {
    icon: (
      <Medal
        className="text-blue-500 w-10 h-10 md:w-12 md:h-12"
        aria-hidden="true"
      />
    ),
    title: 'International Recognition',
    description:
      'Nitesh Yadav received global acclaim at a prestigious competition.',
  },
];

export default function AchievementSection() {
  return (
    <section
      id="achievements"
      className="py-12 md:py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50/30 border-b border-blue-100/50 relative overflow-hidden"
      aria-labelledby="achievements-heading"
    >
      {/* Glassmorphism Background Elements */}
      <div className="absolute top-10 left-16 w-40 h-40 bg-gradient-to-br from-yellow-400/15 to-orange-400/15 rounded-full blur-3xl backdrop-blur-sm" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-blue-400/15 to-purple-400/15 rounded-full blur-3xl backdrop-blur-sm" />
      
      <div className="max-w-5xl mx-auto px-3 relative z-10">
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="inline-flex items-center justify-center p-3 mb-4 bg-white/70 backdrop-blur-md rounded-2xl shadow-neumorphic border border-white/30">
            <Trophy className="w-6 h-6 text-red-500 mr-2" />
            <span className="text-sm font-semibold text-red-500 uppercase tracking-wider">Achievements</span>
          </div>
          
          <h2
            id="achievements-heading"
            className="text-2xl xs:text-3xl md:text-4xl font-bold text-red-500 tracking-tight text-center mb-2"
          >
            Our Pride & Glory
          </h2>
          <p className="text-base md:text-lg font-medium text-gray-600 text-center max-w-2xl">
            Proud moments and milestones achieved by our athletes.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {achievements.map((a, i) => (
            <motion.div
              key={a.title}
              className="bg-white/60 backdrop-blur-md rounded-2xl shadow-neumorphic p-6 flex flex-col items-center hover:shadow-neumorphic-hover hover:bg-white/70 border border-white/30 transition-all duration-500 group"
              aria-label={a.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className="mb-3 p-3 bg-white/50 backdrop-blur-sm rounded-full shadow-neumorphic-soft group-hover:shadow-neumorphic transition-all duration-300 group-hover:scale-110">
                {a.icon}
              </div>
              <h3 className="text-lg md:text-xl font-black text-gray-800 text-center mb-2 group-hover:text-red-600 transition-colors duration-300">
                {a.title}
              </h3>
              <p className="text-gray-600 text-center font-medium group-hover:text-gray-700 transition-colors duration-300">
                {a.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
