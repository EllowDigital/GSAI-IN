import { useState, useEffect, useRef, useMemo } from 'react';
import {
  motion,
  AnimatePresence,
  Variants,
  useScroll,
  useTransform,
} from 'framer-motion';
import { Volume2, VolumeX, Instagram } from 'lucide-react';

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

// Animated words for the headline
const animatedWords = [
  { text: 'Fire', emoji: '🔥' },
  { text: 'Warrior', emoji: '🐯' },
  { text: 'Strength', emoji: '💪' },
  { text: 'Discipline', emoji: '⚔️' },
];

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

const wordVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.4, ease: 'easeIn' },
  },
};

// Floating particle configuration
const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.4 + 0.1,
  }));
};

export default function HeroSection() {
  const [imgIndex, setImgIndex] = useState(0);
  const [mediaMode, setMediaMode] = useState<'video' | 'images'>('video');
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [showSanskrit, setShowSanskrit] = useState(false);
  const imageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroImgRef = useRef<HTMLImageElement | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const isVideoActive = mediaMode === 'video';

  // Memoize particles to prevent regeneration on each render
  const particles = useMemo(() => generateParticles(20), []);

  // Parallax scroll effect
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, 150]);
  const parallaxScale = useTransform(scrollY, [0, 500], [1.05, 1.15]);

  // Word animation cycle every 2.5s
  useEffect(() => {
    const wordTimer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % animatedWords.length);
    }, 2500);
    return () => clearInterval(wordTimer);
  }, []);

  // Sanskrit quote scroll fade effect - using Framer Motion's scrollY value
  useEffect(() => {
    const unsubscribe = scrollY.on('change', (value) => {
      setShowSanskrit(value >= 20);
    });
    // Set initial state
    setShowSanskrit(scrollY.get() >= 20);
    return () => unsubscribe();
  }, [scrollY]);

  // Preload hero images
  useEffect(() => {
    bgImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Set fetchpriority attribute via DOM to avoid React/TS unknown prop warnings
  useEffect(() => {
    if (heroImgRef.current && 'setAttribute' in heroImgRef.current) {
      try {
        heroImgRef.current.setAttribute('fetchpriority', 'high');
      } catch (e) {
        /* ignore */
      }
    }
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
      ref={heroRef}
      id="hero"
      onClick={handleUserInteraction}
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-black text-white cursor-default"
    >
      {/* Visually-hidden H1 with keywords for SEO (keeps design intact) */}
      <h1 className="sr-only">
        Martial Arts Training in Lucknow — Ghatak Sports Academy India
      </h1>

      {/* Floating Particles Layer */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-br from-yellow-400/40 to-orange-500/30"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [-20, -100, -20],
              x: [0, Math.sin(particle.id) * 30, 0],
              opacity: [
                particle.opacity,
                particle.opacity * 1.5,
                particle.opacity,
              ],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
        {/* Larger accent particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`accent-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${15 + i * 18}%`,
              top: `${20 + (i % 3) * 25}%`,
              width: 6 + i * 2,
              height: 6 + i * 2,
              background: `radial-gradient(circle, rgba(234, 179, 8, ${0.3 - i * 0.04}) 0%, transparent 70%)`,
              boxShadow: `0 0 ${10 + i * 5}px ${3 + i}px rgba(234, 179, 8, ${0.15 - i * 0.02})`,
            }}
            animate={{
              y: [0, -60 - i * 10, 0],
              x: [0, i % 2 === 0 ? 20 : -20, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 12 + i * 3,
              repeat: Infinity,
              delay: i * 1.5,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Background Media Container with Parallax */}
      <motion.div
        className="absolute inset-0 z-0 overflow-hidden"
        style={{ y: parallaxY, scale: parallaxScale }}
      >
        <div className="relative h-full w-full">
          {/* Ensure a high-priority background image is present for LCP.
                This <img> renders immediately (eager + fetchpriority) so
                Lighthouse can pick it up as the Largest Contentful Paint. */}
          <img
            ref={heroImgRef}
            src={bgImages[0]}
            alt=""
            aria-hidden="true"
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
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
      </motion.div>

      {/* Gradient Overlays (outside parallax container for stable appearance) */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/80 via-black/40 to-black/90" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-black/50 via-transparent to-black/50" />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate={!isVideoActive ? 'animate' : 'initial'}
          className="flex flex-col items-center max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            variants={textVariants}
            className="inline-flex items-center gap-x-1.5 xs:gap-x-2 px-3 xs:px-4 py-1 xs:py-1.5 mb-4 xs:mb-6 md:mb-8 border border-yellow-500/30 rounded-full text-yellow-400/90 text-[10px] xs:text-xs sm:text-sm font-medium bg-yellow-500/10 backdrop-blur-sm"
          >
            <span className="relative flex h-1.5 w-1.5 xs:h-2 xs:w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 xs:h-2 xs:w-2 bg-yellow-500"></span>
            </span>
            <span className="whitespace-nowrap">
              Government Recognized • ISO 9001:2015
            </span>
          </motion.div>

          {/* Heading with Word Highlight Animation */}
          <motion.h2
            variants={textVariants}
            className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.15] xs:leading-tight mb-3 xs:mb-4 tracking-tight px-1"
          >
            <span className="block sm:inline">Ghatak Sports Academy India</span>
            <span className="hidden sm:inline"> — </span>
            <span className="block sm:inline mt-1 sm:mt-0">
              <span className="text-white">Unleash Your Inner </span>
              <span className="inline-block min-w-[100px] xs:min-w-[140px] sm:min-w-[180px] md:min-w-[220px] lg:min-w-[280px] text-left align-bottom">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    variants={wordVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="inline-flex items-center gap-1 xs:gap-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600"
                  >
                    {animatedWords[wordIndex].text}
                    <span className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
                      {animatedWords[wordIndex].emoji}
                    </span>
                  </motion.span>
                </AnimatePresence>
              </span>
            </span>
          </motion.h2>

          {/* Subheading */}
          <motion.p
            variants={textVariants}
            className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-300 mb-6 xs:mb-8 md:mb-10 max-w-xl md:max-w-2xl mx-auto leading-relaxed px-2"
          >
            Premier training for{' '}
            <span className="text-yellow-400 font-semibold">Martial Arts</span>,{' '}
            <span className="text-orange-500 font-semibold">Fitness</span> &{' '}
            <span className="text-red-500 font-semibold">Self-Defense</span>.
            <span className="hidden xs:inline">
              {' '}
              Join the elite community of champions.
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={textVariants}
            className="flex flex-col xs:flex-row gap-3 xs:gap-4 w-full xs:w-auto px-2 xs:px-0"
          >
            <a
              href="#programs"
              className="group relative inline-flex items-center justify-center px-5 xs:px-6 sm:px-8 py-3 xs:py-3.5 text-sm xs:text-base font-bold text-white transition-all duration-200 bg-gradient-to-r from-yellow-500 to-red-600 rounded-lg xs:rounded-xl hover:shadow-lg hover:shadow-orange-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
              <span className="relative flex items-center gap-2">
                Explore Programs
                <svg
                  className="w-4 h-4 xs:w-5 xs:h-5 group-hover:translate-y-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v8m0 0l-3-3m3 3l3-3"
                  />
                </svg>
              </span>
            </a>

            <a
              href="https://www.instagram.com/ghataksportsacademy/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center px-5 xs:px-6 sm:px-8 py-3 xs:py-3.5 text-sm xs:text-base font-bold text-white transition-all duration-200 bg-white/10 border border-white/20 rounded-lg xs:rounded-xl hover:bg-white/20 hover:border-white/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50"
            >
              <span className="flex items-center gap-2">
                <Instagram className="w-4 h-4 xs:w-5 xs:h-5 text-pink-500 group-hover:scale-110 transition-transform" />
                <span className="hidden xs:inline">Follow on Instagram</span>
                <span className="xs:hidden">Instagram</span>
              </span>
            </a>
          </motion.div>

          {/* Sanskrit Quote - Scroll Fade */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: showSanskrit ? 1 : 0,
              y: showSanskrit ? 0 : 10,
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mt-6 xs:mt-8 sm:mt-10 md:mt-12 text-center px-2"
          >
            <p
              lang="sa"
              className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif text-yellow-400/80 tracking-wide mb-1 xs:mb-2"
            >
              शौर्यं बलं अनुशासनम्।
            </p>
            <p className="text-xs xs:text-sm sm:text-base text-gray-400 italic tracking-wider">
              Strength is born from discipline.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Controls: Scroll Indicator and Slider Navigation */}
      <div className="absolute left-0 right-0 bottom-4 xs:bottom-6 lg:bottom-8 xl:bottom-12 flex flex-col items-center gap-4 xs:gap-6 z-20 px-3 xs:px-4 pointer-events-none">
        <AnimatePresence>
          <motion.div
            className="pointer-events-auto hidden lg:flex flex-wrap items-center justify-center gap-1.5 xl:gap-2 w-auto max-w-[90vw] mx-auto px-3 xl:px-4 py-2 xl:py-2.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md shadow-xl"
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
                className={`group relative inline-flex items-center justify-center p-1.5 xl:p-2 rounded-full transition-all duration-300 focus:outline-none ${
                  imgIndex === idx ? 'scale-105' : 'hover:scale-105'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              >
                <span
                  className={`inline-block rounded-full transition-all duration-300 w-2.5 h-2.5 xl:w-3 xl:h-3 ${
                    imgIndex === idx
                      ? 'bg-gradient-to-r from-yellow-400 to-red-500 opacity-100'
                      : 'bg-white/30 group-hover:bg-white/60'
                  }`}
                />
              </button>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Minimal Scroll Indicator - Line with Moving Dot & Trail Effect */}
        <a
          href="#about"
          aria-label="Scroll down"
          className="pointer-events-auto group"
        >
          <div className="relative h-14 sm:h-16 w-[2px] bg-white/20 rounded-full overflow-hidden group-hover:bg-yellow-500/30 transition-colors duration-300">
            {/* Trail particles */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-400/40 rounded-full"
                animate={{
                  y: [0, 48, 0],
                  opacity: [0, 0.6, 0],
                  scale: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.15,
                }}
              />
            ))}
            {/* Main glowing dot */}
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"
              animate={{
                y: [0, 48, 0],
                boxShadow: [
                  '0 0 8px 2px rgba(234, 179, 8, 0.6), 0 0 16px 4px rgba(249, 115, 22, 0.4)',
                  '0 0 12px 4px rgba(234, 179, 8, 0.8), 0 0 24px 8px rgba(249, 115, 22, 0.5)',
                  '0 0 8px 2px rgba(234, 179, 8, 0.6), 0 0 16px 4px rgba(249, 115, 22, 0.4)',
                ],
                scale: [1, 1.2, 1],
              }}
              transition={{
                y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                boxShadow: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
                scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
              }}
            />
          </div>
        </a>
      </div>
    </section>
  );
}
