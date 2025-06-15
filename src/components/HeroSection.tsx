
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownCircle } from "lucide-react";

const bgImages = [
  // You can replace these with your own images in the public folder or wherever you want.
  "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?auto=format&fit=crop&w=1500&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1500&q=80", // Fitness group
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80", // Athlete training
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1500&q=80", // Karate
  "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=1500&q=80", // Outdoor martial art
];

const variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  },
};

export default function HeroSection() {
  const [imgIndex, setImgIndex] = useState(0);

  // Slide between images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setImgIndex((idx) => (idx + 1) % bgImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[65vh] md:min-h-[75vh] flex items-center justify-center overflow-hidden">
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
              backgroundImage: `linear-gradient(rgba(23,23,23,0.62),rgba(35,27,36,0.60)),url('${bgImages[imgIndex]}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transition: "background-image 1s linear",
            }}
            aria-hidden="true"
          />
        </AnimatePresence>
      </div>
      {/* Content */}
      <div className="relative w-full flex flex-col items-center justify-center px-2 xs:px-4 py-16 xs:py-20 z-10">
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
        {/* Slider controls/dots (optional) */}
        <div className="absolute bottom-6 right-4 flex gap-2 z-20">
          {bgImages.map((_, idx) => (
            <button
              key={idx}
              className={`w-3 h-3 rounded-full border-2 border-white transition ${imgIndex === idx ? "bg-yellow-400" : "bg-white/40"}`}
              onClick={() => setImgIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{ outline: imgIndex === idx ? "2px solid #facc15" : undefined }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
