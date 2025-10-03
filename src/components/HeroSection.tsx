import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ArrowDownCircle } from 'lucide-react';

// Array of background images for the slider
const bgImages = [
  '/assets/slider/slider.webp',
  '/assets/slider/slider0.webp',
  '/assets/slider/slider1.webp',
  '/assets/slider/slider2.webp',
  '/assets/slider/slider3.webp',
  '/assets/slider/slider4.webp',
  '/assets/slider/slider5.webp',
  '/assets/slider/slider6.webp',
  '/assets/slider/slider7.webp',
  '/assets/slider/slider8.webp',
  '/assets/slider/slider9.webp',
  '/assets/slider/slider10.webp',
];

// Path to your introductory video
const videoSrc = '/assets/slider/intro.mp4'; // <-- IMPORTANT: Set your video path here

// Framer Motion variants for animations
const fadeVariants: Variants = {
  initial: { opacity: 0, scale: 1.05 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 1, ease: 'easeOut' },
  },
};

const textVariants: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: 'easeOut' },
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
  const [videoFinished, setVideoFinished] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Starts the image slider interval *after* the video has finished
  useEffect(() => {
    if (videoFinished) {
      timeoutRef.current = setInterval(() => {
        setImgIndex((prev) => (prev + 1) % bgImages.length);
      }, 4000);
    }
    // Cleanup function to clear the interval when the component unmounts
    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, [videoFinished]);

  // **IMPROVEMENT**: Preloads slider images in the background after the video finishes.
  // This prevents lag when the slider starts, as images are already in the browser cache.
  useEffect(() => {
    if (videoFinished) {
      bgImages.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [videoFinished]);

  // Function to manually navigate to a specific image in the slider
  const goToImage = (index: number) => {
    setImgIndex(index);
    // Reset the interval timer to avoid a quick double-change
    if (timeoutRef.current) {
      clearInterval(timeoutRef.current);
      timeoutRef.current = setInterval(() => {
        setImgIndex((prev) => (prev + 1) % bgImages.length);
      }, 4000);
    }
  };

  // Sets the state to switch from video to image slider
  const handleVideoEnd = () => {
    setVideoFinished(true);
  };

  // **IMPROVEMENT**: Robustly handles video playback on all devices.
  // It attempts to play the video and includes a `.catch()` block. If a browser
  // (especially on mobile) blocks autoplay, it gracefully skips to the image slider
  // instead of showing a blank/stuck screen.
  useEffect(() => {
    // Ensure the video element exists before trying to play it
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.warn(
          'Video autoplay was blocked by the browser. Starting slider immediately.',
          error
        );
        setVideoFinished(true);
      });
    }
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pb-24 sm:pb-32"
    >
      {/* Background Media Container */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <AnimatePresence mode="wait">
          {!videoFinished ? (
            <motion.div
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <video
                ref={videoRef}
                muted
                playsInline
                onEnded={handleVideoEnd}
                className="absolute top-0 left-0 w-full h-full object-cover"
                src={videoSrc}
                preload="auto" // Hint to the browser to load the video early
              >
                Your browser does not support the video tag.
              </video>
            </motion.div>
          ) : (
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
                willChange: 'opacity, transform', // Performance hint for smoother animations
              }}
            />
          )}
        </AnimatePresence>
        {/* Overlays for text readability */}
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
          {/* ... (Your existing header content remains unchanged) ... */}
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
              onClick={() =>
                window.open('https://www.instagram.com/ghatakgsai/', '_blank')
              }
              className="group inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-400"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 8 0zm0 1.442c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.282.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.231 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.275-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.843-.038 1.096-.047 3.232-.047zM8 3.882a4.118 4.118 0 1 0 0 8.236 4.118 4.118 0 0 0 0-8.236zm0 6.793a2.675 2.675 0 1 1 0-5.35 2.675 2.675 0 0 1 0 5.35zM12.633 3.31a.95.95 0 1 0 0 1.9.95.95 0 0 0 0-1.9z" />
              </svg>
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
          <span className="text-sm text-white/70 font-medium tracking-wider">
            Scroll
          </span>
        </motion.div>
        {videoFinished && (
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
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
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-xl animate-pulse" />
      <div
        className="absolute bottom-32 right-16 w-32 h-32 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full blur-xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />
    </section>
  );
}
