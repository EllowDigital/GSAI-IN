
import { motion } from "framer-motion";

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

const cardVariants = {
  offscreen: { opacity: 0, y: 40 },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      bounce: 0.36,
      duration: 0.5,
    },
  },
};

export default function ProgramsSection() {
  return (
    <section id="programs" className="bg-gray-900 py-10 xs:py-14 md:py-20 px-2 xs:px-3 md:px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl xs:text-3xl md:text-4xl font-bold text-yellow-400 mb-5 xs:mb-8 tracking-wide text-center">
          🥋 Programs &amp; Training
        </h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 xs:gap-5 md:gap-8">
          {programs.map((prog, i) => (
            <motion.div
              key={prog.title}
              className="bg-white rounded-2xl shadow-md p-5 xs:p-7 flex flex-col items-center justify-center transition-transform hover:scale-105 hover:shadow-lg cursor-pointer"
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.35 }}
              variants={cardVariants}
            >
              <span className="text-3xl xs:text-4xl mb-2">{prog.icon}</span>
              <h3 className="font-extrabold text-base xs:text-lg text-gray-800 mb-1">{prog.title}</h3>
              <p className="text-gray-500 font-medium text-center text-xs xs:text-sm">{prog.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
