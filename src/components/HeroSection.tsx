import { motion } from "framer-motion";
import { ArrowDownCircle } from "lucide-react";

const bgUrl =
  "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?auto=format&fit=crop&w=1500&q=80";

// Use a cubic-bezier array for the 'ease' transition prop
const variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  },
};

export default function HeroSection() {
  return (
    <section
      className="relative min-h-[65vh] md:min-h-[75vh] flex items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(rgba(23,23,23,0.62),rgba(35,27,36,0.60)),url('${bgUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full flex flex-col items-center justify-center px-2 xs:px-4 py-16 xs:py-20">
        <motion.h1
          className="text-2xl xs:text-3xl sm:text-4xl md:text-6xl font-black text-white drop-shadow-lg text-center leading-tight"
          initial="initial"
          animate="animate"
          variants={variants}
        >
          Unleash Your Strength with{" "}
          <span className="text-yellow-400">Ghatak Sports Academy India™</span>
        </motion.h1>
        <motion.p
          className="mt-4 text-base xs:text-lg md:text-2xl font-semibold text-white/90 text-center max-w-2xl"
          initial="initial"
          animate="animate"
          variants={variants}
          transition={{ delay: 0.3 }}
        >
          Government-Recognized | <span className="text-yellow-400">ISO 9001:2015</span> | Martial Arts | Fitness | Self-Defense
        </motion.p>
        <motion.a
          href="#programs"
          className="mt-10 px-7 py-4 text-base md:text-lg bg-red-600 hover:bg-red-700 rounded-full font-bold uppercase text-white shadow-lg transition-colors duration-200 hover-scale"
          whileHover={{ scale: 1.06 }}
          initial="initial"
          animate="animate"
          variants={variants}
          transition={{ delay: 0.6 }}
        >
          Join Now
        </motion.a>
        {/* Scroll Down Indicator */}
        <motion.div
          className="absolute left-1/2 transform -translate-x-1/2 bottom-6 flex flex-col items-center"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, type: "spring" }}
        >
          <ArrowDownCircle className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 animate-bounce" />
          <span className="text-xs text-white mt-2 tracking-widest font-medium">Scroll</span>
        </motion.div>
      </div>
    </section>
  );
}
