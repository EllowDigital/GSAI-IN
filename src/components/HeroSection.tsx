
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownCircle } from "lucide-react";

const bgImages = [
  "/assets/slider/slider6.png",
  "/assets/slider/slider.png",
  "/assets/slider/slider.webp",
  "/assets/slider/slider1.png",
  "/assets/slider/slider2.png",
  "/assets/slider/slider3.png",
  "/assets/slider/slider4.png",
  "/assets/slider/slider5.png",
];

const variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
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
    <section
      // Responsive height: always fill screen, on md+ taller for desktop hero
      className="relative min-h-[100svh] md:min-h-[78vh] flex items-center justify-center overflow-x-hidden overflow-y-hidden"
      style={{ WebkitOverflowScrolling: "touch" }} // for mobile smooth
    >
      {/* Background Image Slider */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={bgImages[imgIndex]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `linear-gradient(to top, rgba(10,10,10,0.85), rgba(10,10,10,0.2) 60%, transparent), url('${bgImages[imgIndex]}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
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
          <span className="text-yellow-400">ISO 9001:2015</span> | Martial Arts
          | Fitness | Self-Defense
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
      </div>
      {/* Scroll Down Indicator and Slider dots */}
      <div
        className="
          absolute
          left-1/2
          -translate-x-1/2
          bottom-0
          pb-4
          xs:pb-3
          sm:pb-5
          flex flex-col items-center gap-3
          z-50
          w-auto
          pointer-events-none
          select-none
        "
        style={{ width: "auto" }}
      >
        <div className="flex flex-col items-center pointer-events-auto">
          <ArrowDownCircle className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400 animate-bounce" />
          <span className="text-sm text-white/90 mt-1 mb-0.5 tracking-wider font-medium">
            Scroll
          </span>
        </div>
        <div className="flex justify-center gap-2.5 xs:gap-3 mt-1 pointer-events-auto">
          {bgImages.map((_, idx) => (
            <button
              key={idx}
              className={`w-2.5 h-2.5 xs:w-3 xs:h-3 rounded-full border border-white transition-all duration-300 focus:outline-yellow-400 ${
                imgIndex === idx ? "bg-yellow-400 shadow-lg scale-110" : "bg-white/30"
              }`}
              onClick={() => setImgIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                outline: imgIndex === idx ? "2px solid #facc15" : undefined,
                pointerEvents: "auto",
              }}
              tabIndex={0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
