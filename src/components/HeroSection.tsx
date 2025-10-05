import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ArrowDownCircle, Volume2, VolumeX } from 'lucide-react';

// Array of background images for the slider
// Using placeholder images for demonstration
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

// Path to your introductory video - using a placeholder
const videoSrc = '/assets/slider/intro.mp4'; // <-- IMPORTANT: Set your video path here

// --- Framer Motion Variants ---

const fadeVariants: Variants = {
  initial: { opacity: 0, scale: 1.05, filter: 'blur(10px)' },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: 'blur(10px)',
    transition: { duration: 1, ease: [0.43, 0.13, 0.23, 0.96] },
  },
};

const textVariants: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const staggerContainer: Variants = {
  initial: {}, // Keep initial state empty, children will use their own initial
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const scrollIndicatorVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, delay: 0.5 },
  },
};

export default function App() {
  const [imgIndex, setImgIndex] = useState(0);
  const [videoFinished, setVideoFinished] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- Effect for Image Slider Logic ---
  useEffect(() => {
    // Function to clear the existing interval
    const clearSliderInterval = () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };

    if (videoFinished) {
      // Preload images when the slider is about to start
      bgImages.forEach((src) => {
        const img = new Image();
        img.src = src;
      });

      // Start the image slider
      timeoutRef.current = setInterval(() => {
        setImgIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % bgImages.length;
          // When it loops back to the start, restart the video
          if (nextIndex === 0) {
            setVideoFinished(false);
          }
          return nextIndex;
        });
      }, 4000); // 4-second interval
    } else {
      // If we are back to the video, clear any lingering slider interval
      clearSliderInterval();
    }

    // Cleanup on unmount or when videoFinished changes
    return clearSliderInterval;
  }, [videoFinished]);

  // --- Effect for Video Playback ---
  useEffect(() => {
    const currentVideo = videoRef.current;
    if (!videoFinished && currentVideo) {
      currentVideo.currentTime = 0;
      currentVideo.play().catch((error) => {
        console.warn(
          'Video autoplay was blocked by the browser. Starting image slider as a fallback.',
          error
        );
        // If autoplay fails, immediately switch to the image slider
        setVideoFinished(true);
      });
    }
  }, [videoFinished]);

  // --- Event Handlers ---

  const goToImage = (index: number) => {
    setImgIndex(index);
    // Restart the interval from the selected image
    setVideoFinished(true); // Ensure we are in slider mode
  };

  const handleVideoEnd = () => {
    setVideoFinished(true);
  };

  // Unmute video on the first user interaction anywhere on the hero section
  const handleUserInteraction = () => {
    if (!hasInteracted) {
      setIsMuted(false);
      setHasInteracted(true);
    }
  };

  // Toggle mute state, ensuring it counts as the first interaction if it is
  const toggleMute = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent the main click handler from firing
    setIsMuted(!isMuted);
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  return (
    <section
      id="hero"
      onClick={handleUserInteraction}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white cursor-default"
    >
      {/* Background Media Container */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {!videoFinished ? (
            <motion.div
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full"
            >
              <video
                ref={videoRef}
                muted={isMuted}
                playsInline
                onEnded={handleVideoEnd}
                className="w-full h-full object-cover"
                src={videoSrc}
                preload="auto"
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
              className="absolute inset-0 w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url('${bgImages[imgIndex]}')` }}
            />
          )}
        </AnimatePresence>
        {/* Overlays for better text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Mute/Unmute Button */}
      {!videoFinished && (
        <motion.button
          onClick={toggleMute}
          className="absolute top-5 right-5 md:top-8 md:right-8 z-30 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/80 hover:bg-white/20 transition-colors"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </motion.button>
      )}

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* MODIFICATION: The 'animate' prop is now controlled by the 'videoFinished' state. */}
        {/* The text will be in its 'initial' state (hidden) until the video finishes. */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate={videoFinished ? 'animate' : 'initial'}
        >
          <motion.div
            variants={textVariants}
            className="inline-flex items-center gap-x-3 px-4 py-2 mb-4 md:mb-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-xs sm:text-sm font-medium"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Government Recognized • ISO 9001:2015
          </motion.div>

          <motion.h1
            variants={textVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-4 md:mb-6"
          >
            Unleash Your Strength
            <br className="hidden sm:block" /> with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Ghatak Sports
            </span>
          </motion.h1>

          <motion.p
            variants={textVariants}
            className="text-base sm:text-lg md:text-xl text-white/80 mb-8 md:mb-10 max-w-3xl mx-auto"
          >
            Premier training for{' '}
            <span className="font-semibold text-yellow-300">Martial Arts</span>,{' '}
            <span className="font-semibold text-orange-400">Fitness</span> &{' '}
            <span className="font-semibold text-red-400">Self-Defense</span>.
          </motion.p>

          <motion.div
            variants={textVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a
              href="#programs"
              className="group w-full sm:w-auto text-center px-8 py-3 bg-gradient-to-r from-red-600 to-red-800 rounded-full font-bold text-white text-base md:text-lg shadow-lg hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Explore Programs
            </a>
            <a
              href="https://www.instagram.com/ghatakgsai/"
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full sm:w-auto text-center inline-flex items-center justify-center gap-x-3 px-6 py-3 bg-white/10 border border-white/20 backdrop-blur-md text-white font-bold rounded-full shadow-md hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 8 0zm0 1.442c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.282.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.231 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.275-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.843-.038 1.096-.047 3.232-.047zM8 3.882a4.118 4.118 0 1 0 0 8.236 4.118 4.118 0 0 0 0-8.236zm0 6.793a2.675 2.675 0 1 1 0-5.35 2.675 2.675 0 0 1 0 5.35zM12.633 3.31a.95.95 0 1 0 0 1.9.95.95 0 0 0 0-1.9z" />
              </svg>
              Follow on Instagram
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Controls: Scroll Indicator and Slider Navigation */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-6 sm:bottom-8 flex flex-col items-center gap-4 z-20 w-full px-4">
        <AnimatePresence>
          {videoFinished && (
            <motion.div
              className="flex gap-2.5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              {bgImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToImage(idx)}
                  className={`w-2 h-2 rounded-full border transition-all duration-300 ${
                    imgIndex === idx
                      ? 'bg-yellow-400 border-yellow-400 scale-125'
                      : 'bg-transparent border-white/50 hover:border-white hover:bg-white/30'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <a href="#about" aria-label="Scroll down">
          {/* MODIFICATION: This animation is now also controlled by 'videoFinished'. */}
          {/* It will stay hidden and only animate to 'visible' when the video ends. */}
          <motion.div
            className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors"
            variants={scrollIndicatorVariants}
            initial="hidden"
            animate={videoFinished ? 'visible' : 'hidden'}
          >
            <ArrowDownCircle className="w-6 h-6 animate-bounce" />
            <span className="text-xs font-medium tracking-wider uppercase">
              Scroll
            </span>
          </motion.div>
        </a>
      </div>
    </section>
  );
}
