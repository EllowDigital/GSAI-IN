import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownCircle } from "lucide-react";

const bgImages = [
  "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?auto=format&fit=crop&w=1500&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1500&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1500&q=80",
  "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=1500&q=80",
];

const variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1] as [number,number,number,number] },
  },
};

export default function HeroSection() {
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setImgIndex((idx) => (idx + 1) % bgImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[68vh] md:min-h-[78vh] flex items-center justify-center overflow-hidden">
      {/* Background Image Slider */}
      <div className="absolute inset-0 w-full h-full z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={bgImages[imgIndex]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `linear-gradient(rgba(23,23,23,0.76),rgba(30,16,28,0.62)),url('${bgImages[imgIndex]}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transition: "background-image 1s linear",
            }}
            aria-hidden="true"
          />
        </AnimatePresence>
      </div>
      {/* Content */}
      <div className="relative w-full flex flex-col items-center justify-center px-2 xs:px-4 py-14 xs:py-16 md:py-28 z-10">
        <motion.h1
          className="text-2xl xs:text-3xl sm:text-4xl md:text-6xl font-black text-white drop-shadow-lg text-center leading-tight max-w-3xl"
          initial="initial"
          animate="animate"
          variants={variants}
        >
          Unleash Your Strength with{" "}
          <span className="text-yellow-400">Ghatak Sports Academy India™</span>
        </motion.h1>
        <motion.p
          className="mt-3 xs:mt-4 text-sm xs:text-lg md:text-2xl font-semibold text-white/90 text-center max-w-2xl"
          initial="initial"
          animate="animate"
          variants={variants}
          transition={{ delay: 0.3 }}
        >
          Government-Recognized |{" "}
          <span className="text-yellow-400">ISO 9001:2015</span> | Martial Arts | Fitness | Self-Defense
        </motion.p>
        <motion.a
          href="#programs"
          className="mt-8 md:mt-10 px-6 xs:px-7 py-3 xs:py-4 text-sm xs:text-base md:text-lg bg-red-600 hover:bg-red-700 rounded-full font-bold uppercase text-white shadow-lg transition-colors duration-200 hover-scale"
          whileHover={{ scale: 1.06 }}
          initial="initial"
          animate="animate"
          variants={variants}
          transition={{ delay: 0.6 }}
        >
          Join Now
        </motion.a>
        {/* Scroll Down Indicator and Slider dots (wrapped in a mobile-safe flex col at the bottom) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-3 xs:bottom-5 w-full flex flex-col items-center gap-2 z-20 pointer-events-none">
          <motion.div
            className="flex flex-col items-center pointer-events-auto"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, type: "spring" }}
          >
            <ArrowDownCircle className="w-8 h-8 sm:w-11 sm:h-11 text-yellow-400 animate-bounce" />
            <span className="text-xs text-white mt-1 tracking-widest font-medium">Scroll</span>
          </motion.div>
          {/* Slider dots */}
          <div className="flex justify-center gap-2 mt-2 pointer-events-auto">
            {bgImages.map((_, idx) => (
              <button
                key={idx}
                className={`w-3 h-3 xs:w-4 xs:h-4 rounded-full border-2 border-white transition focus:outline-yellow-400 ${imgIndex === idx ? "bg-yellow-400 shadow-lg" : "bg-white/30"}`}
                onClick={() => setImgIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                style={{ outline: imgIndex === idx ? "2px solid #facc15" : undefined }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
