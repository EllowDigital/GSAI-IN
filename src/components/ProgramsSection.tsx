
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const programs = [
  { icon: "🥋", title: "Karate", desc: "Traditional strikes & self-discipline" },
  { icon: "🦵", title: "Taekwondo", desc: "Dynamic kicks & sparring" },
  { icon: "🥊", title: "Boxing", desc: "Build stamina & precision" },
  { icon: "🥋", title: "Kickboxing", desc: "Cardio meets combat" },
  { icon: "🤼", title: "Grappling", desc: "Ground control tactics" },
  { icon: "🥋", title: "MMA", desc: "Striking & grappling combined" },
  { icon: "🕉️", title: "Kalaripayattu", desc: "India’s ancient warrior art" },
  { icon: "🛡️", title: "Self-Defense", desc: "Practical safety training" },
  { icon: "🏋️", title: "Fat Loss", desc: "Burn fat, build agility" },
];

const containerVariants = {
  offscreen: {},
  onscreen: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  offscreen: { opacity: 0, y: 40 },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      bounce: 0.4,
      duration: 0.6,
    },
  },
};

export default function ProgramsSection() {
  return (
    <section id="programs" className="bg-gray-900 py-10 xs:py-14 md:py-20 px-2 xs:px-3 md:px-4 relative overflow-hidden">
      {/* Decorative spark left top */}
      <Sparkles className="absolute left-1 top-4 w-14 h-14 text-yellow-400 opacity-10 z-0 pointer-events-none" />
      {/* Spark right bottom */}
      <Sparkles className="absolute right-0 bottom-5 w-14 h-14 text-red-400 opacity-20 z-0 pointer-events-none animate-pulse" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col items-center">
          <h2 className="text-2xl xs:text-3xl md:text-4xl font-bold text-yellow-400 mb-3 xs:mb-7 tracking-wide text-center relative">
            <span className="inline-block">
              🥋 Programs &amp; Training
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
              className="bg-white rounded-2xl shadow-lg p-5 xs:p-7 flex flex-col items-center justify-center transition-transform hover:scale-105 hover:shadow-xl cursor-pointer border-t-4 border-yellow-200/50 hover:border-yellow-400 duration-200"
              variants={cardVariants}
            >
              <span className="text-4xl xs:text-5xl mb-3">{prog.icon}</span>
              <h3 className="font-extrabold text-base xs:text-lg text-gray-800 mb-1 text-center">{prog.title}</h3>
              <p className="text-gray-600 font-medium text-center text-sm xs:text-base">{prog.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
