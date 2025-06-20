
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ArrowDownCircle } from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';

const bgImages = [
  '/assets/slider/slider6.png',
  '/assets/slider/slider.png',
  '/assets/slider/slider.webp',
  '/assets/slider/slider1.png',
  '/assets/slider/slider2.png',
  '/assets/slider/slider3.png',
  '/assets/slider/slider4.png',
  '/assets/slider/slider5.png',
];

const fadeVariants: Variants = {
  initial: { opacity: 0, scale: 1.05 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 1.2, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 1, ease: "easeOut" }
  },
};

const textVariants: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: "easeOut" },
  },
};

const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.25,
    },
  },
};

export default function HeroSection() {
  const [imgIndex, setImgIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timeoutRef.current = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % bgImages.length);
    }, 6000);

    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, []);

  const goToImage = (index: number) => {
    setImgIndex(index);
    if (timeoutRef.current) {
      clearInterval(timeoutRef.current);
      timeoutRef.current = setInterval(() => {
        setImgIndex((prev) => (prev + 1) % bgImages.length);
      }, 6000);
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pb-24 sm:pb-32"
    >
      {/* Background Image Slider */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={bgImages[imgIndex]}
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url('${bgImages[imgIndex]}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
        <motion.div
          className="text-center"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div
            variants={textVariants}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-sm font-medium"
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Government Recognized • ISO 9001:2015 Certified
          </motion.div>

          <motion.h1
            variants={textVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-tight mb-6"
          >
            Unleash Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
              Strength
            </span>
            <br />
            with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-300">
              Ghatak Sports Academy
            </span>
          </motion.h1>

          <motion.p
            variants={textVariants}
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white/90 mb-8 max-w-4xl mx-auto"
          >
            Premier destination for{' '}
            <span className="text-yellow-400">Martial Arts</span> •{' '}
            <span className="text-orange-400">Fitness</span> •{' '}
            <span className="text-red-400">Self-Defense</span>
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={textVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <a
              href="#programs"
              className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-full font-bold text-white text-lg shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Join Now
              <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity" />
            </a>

            <button
              onClick={() => window.open('https://www.instagram.com/ghatakgsai/', '_blank')}
              className="group inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-400"
            >
              <FaInstagram className="w-5 h-5" />
              Follow Us
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator and Navigation Dots */}
      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-8 sm:bottom-12 flex flex-col items-center gap-6 z-30">
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <ArrowDownCircle className="w-8 h-8 text-white/80 animate-bounce" />
          <span className="text-sm text-white/70 font-medium tracking-wider">Scroll</span>
        </motion.div>

        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          {bgImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToImage(idx)}
              className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                imgIndex === idx
                  ? 'bg-yellow-400 border-yellow-400 scale-110 shadow-md shadow-yellow-400/50'
                  : 'bg-transparent border-white/60 hover:border-white hover:bg-white/20'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </motion.div>
      </div>

      {/* Background Decorations */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-32 right-16 w-32 h-32 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
    </section>
  );
}
