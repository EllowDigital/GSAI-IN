import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  ArrowDownCircle,
  Volume2,
  VolumeX,
  Play,
  Instagram,
} from 'lucide-react';

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
const videoSrc = '/assets/slider/intro.mp4';
const IMAGE_DURATION = 4000;

// --- Framer Motion Variants ---

const fadeVariants: Variants = {
  initial: { opacity: 0, scale: 1.1 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.5, ease: [0.22, 0.61, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 1,
    transition: { duration: 1, ease: [0.22, 0.61, 0.36, 1] },
  },
};

const textVariants: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const scrollIndicatorVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 1,
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
};

export default function HeroSection() {
  const [imgIndex, setImgIndex] = useState(0);
  const [mediaMode, setMediaMode] = useState<'video' | 'images'>('video');
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const imageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideoActive = mediaMode === 'video';

  // Preload hero images
  useEffect(() => {
    bgImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // --- Effect for Image Slider Logic ---
  useEffect(() => {
    if (mediaMode !== 'images') {
      if (imageTimerRef.current) {
        clearTimeout(imageTimerRef.current);
        imageTimerRef.current = null;
      }
      // Defer resetting the index to avoid synchronous setState inside an effect
      if (imgIndex !== 0) {
        setTimeout(() => setImgIndex(0), 0);
      }
      return;
    }

    const scheduleNextFrame = () => {
      imageTimerRef.current = setTimeout(() => {
        setImgIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= bgImages.length) {
            setMediaMode('video');
            return 0;
          }
          return nextIndex;
        });
      }, IMAGE_DURATION);
    };

    scheduleNextFrame();

    return () => {
      if (imageTimerRef.current) {
        clearTimeout(imageTimerRef.current);
        imageTimerRef.current = null;
      }
    };
  }, [mediaMode, imgIndex]);

  // --- Effect for Video Playback ---
  useEffect(() => {
    const currentVideo = videoRef.current;
    if (!currentVideo) return;

    if (isVideoActive) {
      currentVideo.currentTime = 0;
      const playPromise = currentVideo.play();
      if (playPromise) {
        playPromise.catch((error) => {
          console.warn(
            'Video autoplay was blocked by the browser. Showing slideshow as fallback.',
            error
          );
          setMediaMode('images');
        });
      }
      return;
    }

    currentVideo.pause();
  }, [isVideoActive]);

  // --- Event Handlers ---

  const goToImage = (index: number) => {
    setImgIndex(index);
    if (!isVideoActive) return;
    setMediaMode('images');
  };

  const handleVideoEnd = () => {
    setMediaMode('images');
  };

  const handleUserInteraction = () => {
    if (!hasInteracted) {
      setIsMuted(false);
      setHasInteracted(true);
    }
  };

  const toggleMute = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  return (
    <section
      id="hero"
      onClick={handleUserInteraction}
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-black text-white cursor-default"
    >
      {/* Visually-hidden H1 with keywords for SEO (keeps design intact) */}
      <h1 className="sr-only">
        Martial Arts Training in Lucknow — Ghatak Sports Academy India
      </h1>
      {/* Background Media Container */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="relative h-full w-full">
          <AnimatePresence mode="wait">
            {isVideoActive ? (
              <motion.div
                key="hero-video"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0"
              >
                <video
                  ref={videoRef}
                  muted={isMuted}
                  playsInline
                  autoPlay
                  poster={bgImages[0]}
                  preload="metadata"
                  onEnded={handleVideoEnd}
                  className="h-full w-full object-cover scale-105"
                  src={videoSrc}
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

          {/* Enhanced Gradient Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />

          {/* Mute Button */}
          {isVideoActive && (
            <motion.button
              onClick={toggleMute}
              className="pointer-events-auto absolute z-30 p-3 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white hover:bg-red-600/80 hover:border-red-500 transition-all duration-300 top-28 right-4 md:top-24 md:right-8 group"
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 group-hover:scale-110 transition-transform" />
              ) : (
                <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate={!isVideoActive ? 'animate' : 'initial'}
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div
            variants={textVariants}
            className="inline-flex items-center gap-x-2 px-4 py-1.5 mb-6 md:mb-8 border border-yellow-500/30 rounded-full text-yellow-400/90 text-xs sm:text-sm font-medium bg-yellow-500/10 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
            Government Recognized • ISO 9001:2015
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={textVariants}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4 tracking-tight"
          >
            Ghatak Sports Academy India —{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600">
              Unleash Your Inner Fire
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={textVariants}
            className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Premier training for{' '}
            <span className="text-yellow-400 font-semibold">Martial Arts</span>,{' '}
            <span className="text-orange-500 font-semibold">Fitness</span> &{' '}
            <span className="text-red-500 font-semibold">Self-Defense</span>.
            Join the elite community of champions.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={textVariants}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <a
              href="#programs"
              className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white transition-all duration-200 bg-gradient-to-r from-yellow-500 to-red-600 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
              <span className="relative flex items-center gap-2">
                Explore Programs
                <ArrowDownCircle className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
              </span>
            </a>

            <a
              href="https://www.instagram.com/ghatakgsai/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white transition-all duration-200 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 hover:border-white/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50"
            >
              <span className="flex items-center gap-2">
                <Instagram className="w-5 h-5 text-pink-500 group-hover:scale-110 transition-transform" />
                Follow on Instagram
              </span>
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Controls: Scroll Indicator and Slider Navigation */}
      <div className="absolute left-0 right-0 bottom-8 flex flex-col items-center gap-6 z-20 px-4 pointer-events-none">
        <AnimatePresence>
          <motion.div
            className="pointer-events-auto hidden lg:flex flex-wrap items-center justify-center gap-2 w-auto max-w-[90vw] mx-auto px-4 py-2.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            {bgImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToImage(idx)}
                type="button"
                className={`group relative inline-flex items-center justify-center p-2 rounded-full transition-all duration-300 focus:outline-none ${
                  imgIndex === idx ? 'scale-105' : 'hover:scale-105'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              >
                <span
                  className={`inline-block rounded-full transition-all duration-300 w-3 h-3 ${
                    imgIndex === idx
                      ? 'bg-gradient-to-r from-yellow-400 to-red-500 opacity-100'
                      : 'bg-white/30 group-hover:bg-white/60'
                  }`}
                />
              </button>
            ))}
          </motion.div>
        </AnimatePresence>

        <a
          href="#about"
          aria-label="Scroll down"
          className="pointer-events-auto group"
        >
          <motion.div
            className="flex flex-col items-center gap-2 text-white/50 group-hover:text-yellow-400 transition-colors duration-300"
            variants={scrollIndicatorVariants}
            initial="hidden"
            animate="visible"
          >
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
              Scroll Down
            </span>
            <ArrowDownCircle className="w-6 h-6" />
          </motion.div>
        </a>
      </div>
    </section>
  );
}
