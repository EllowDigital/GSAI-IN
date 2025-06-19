import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const variants = {
  initial: { opacity: 0, y: 50 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.2 },
  },
};

export default function HeroSection() {
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image Slider */}
      <div className="absolute inset-0 w-full h-full z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={bgImages[imgIndex]}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.6 } }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url('${bgImages[imgIndex]}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            aria-hidden="true"
          />
        </AnimatePresence>

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 z-10">
        <motion.div
          className="text-center"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Badge */}
          <motion.div
            variants={variants}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-sm font-medium"
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Government Recognized • ISO 9001:2015 Certified
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={variants}
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

          {/* Subtitle */}
          <motion.p
            variants={variants}
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed"
          >
            Premier destination for{' '}
            <span className="text-yellow-400">Martial Arts</span> •{' '}
            <span className="text-orange-400">Fitness</span> •{' '}
            <span className="text-red-400">Self-Defense</span>
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={variants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <motion.a
              href="#programs"
              className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-full font-bold text-white text-lg shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-red-500/25"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Join Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </motion.a>

            <motion.button
              onClick={() =>
                window.open('https://www.instagram.com/ghatakgsai/', '_blank')
              }
              className="group inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Follow us on Instagram"
            >
              <FaInstagram className="w-5 h-5" />
              Follow Us
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator & Dots */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-8 flex flex-col items-center gap-6 z-50">
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <ArrowDownCircle className="w-8 h-8 text-white/80 animate-bounce" />
          <span className="text-sm text-white/70 font-medium tracking-wider">
            Scroll
          </span>
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
              className={`w-3 h-3 rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-transparent ${
                imgIndex === idx
                  ? 'bg-yellow-400 border-yellow-400 scale-125 shadow-lg shadow-yellow-400/50'
                  : 'bg-transparent border-white/60 hover:border-white hover:bg-white/20'
              }`}
              onClick={() => setImgIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </motion.div>
      </div>

      {/* Floating Gradient Circles */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-xl animate-pulse" />
      <div
        className="absolute bottom-32 right-16 w-32 h-32 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full blur-xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />
    </section>
  );
}
