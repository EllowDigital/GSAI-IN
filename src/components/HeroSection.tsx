import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { MouseEvent } from 'react';
import {
  motion,
  AnimatePresence,
  Variants,
  useScroll,
  useTransform,
} from 'framer-motion';
import { Volume2, VolumeX, Instagram, ChevronDown } from 'lucide-react';

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
    size: Math.random() * 3 + 1.5,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.3 + 0.1,
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
  const particles = useMemo(() => generateParticles(15), []);

  // Parallax scroll effect
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, 100]);
  const parallaxScale = useTransform(scrollY, [0, 500], [1.02, 1.1]);
  const contentOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Word animation cycle every 2.5s
  useEffect(() => {
    const wordTimer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % animatedWords.length);
    }, 2500);
    return () => clearInterval(wordTimer);
  }, []);

  // Sanskrit quote scroll fade effect
  useEffect(() => {
    const handleScrollChange = (value: number) => {
      setShowSanskrit(value >= 20);
    };

    // Trigger handler with current value to initialize
    handleScrollChange(scrollY.get());

    const unsubscribe = scrollY.on('change', handleScrollChange);
    return () => unsubscribe();
  }, [scrollY]);

  // Preload hero images
  useEffect(() => {
    bgImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Set fetchpriority attribute via DOM
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
            'Video autoplay was blocked. Showing slideshow as fallback.',
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
  const goToImage = useCallback(
    (index: number) => {
      setImgIndex(index);
      if (mediaMode === 'video') {
        setMediaMode('images');
      }
    },
    [mediaMode]
  );

  const handleVideoEnd = useCallback(() => {
    setMediaMode('images');
  }, []);

  const handleUserInteraction = useCallback(() => {
    if (!hasInteracted) {
      setIsMuted(false);
      setHasInteracted(true);
    }
  }, [hasInteracted]);

  const toggleMute = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setIsMuted((prev) => !prev);
      if (!hasInteracted) {
        setHasInteracted(true);
      }
    },
    [hasInteracted]
  );

  const scrollToAbout = useCallback(() => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <section
      ref={heroRef}
      id="hero"
      onClick={handleUserInteraction}
      className="relative isolate flex min-h-[100dvh] items-center justify-center overflow-hidden bg-black text-white cursor-default"
    >
      {/* Visually-hidden H1 for SEO */}
      <h1 className="sr-only">
        Martial Arts Training in Lucknow — Ghatak Sports Academy India
      </h1>

      {/* Floating Particles Layer */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-br from-yellow-400/30 to-orange-500/20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [-20, -80, -20],
              x: [0, Math.sin(particle.id) * 20, 0],
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
      </div>

      {/* Background Media Container with Parallax */}
      <motion.div
        className="absolute inset-0 z-0 overflow-hidden"
        style={{ y: parallaxY, scale: parallaxScale }}
      >
        <div className="relative h-full w-full">
          {/* High-priority background image for LCP */}
          <img
            ref={heroImgRef}
            src={bgImages[0]}
            alt=""
            aria-hidden="true"
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover"
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
                  className="h-full w-full object-cover"
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
              className="pointer-events-auto absolute z-30 p-2.5 sm:p-3 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white hover:bg-red-600/80 hover:border-red-500 transition-all duration-300 top-20 right-3 sm:top-24 sm:right-6 md:right-8 group"
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              ) : (
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              )}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Gradient Overlays */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      {/* Vignette effect */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{ boxShadow: 'inset 0 0 150px 50px rgba(0,0,0,0.5)' }}
      />

      {/* Main Content */}
      <motion.div
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 text-center"
        style={{ opacity: contentOpacity }}
      >
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate={!isVideoActive ? 'animate' : 'initial'}
          className="flex flex-col items-center max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            variants={textVariants}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 mb-4 sm:mb-6 border border-yellow-500/30 rounded-full text-yellow-400/90 text-[10px] sm:text-xs md:text-sm font-medium bg-yellow-500/10 backdrop-blur-sm"
          >
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-yellow-500"></span>
            </span>
            <span className="whitespace-nowrap">
              Government Recognized • ISO 9001:2015
            </span>
          </motion.div>

          {/* Heading with Word Highlight Animation */}
          <motion.h2
            variants={textVariants}
            className="text-[1.5rem] leading-[1.2] sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold text-white tracking-tight px-2 sm:px-0"
          >
            <span className="block">Ghatak Sports Academy India</span>
            <span className="hidden sm:inline"> — </span>
            <span className="block mt-1 sm:mt-2">
              <span className="text-white">Unleash Your Inner </span>
              <span className="inline-block min-w-[90px] sm:min-w-[140px] md:min-w-[180px] lg:min-w-[240px] text-left align-bottom">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    variants={wordVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="inline-flex items-center gap-1 sm:gap-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600"
                  >
                    {animatedWords[wordIndex].text}
                    <span className="text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">
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
            className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mt-4 sm:mt-6 mb-6 sm:mb-8 max-w-lg md:max-w-2xl mx-auto leading-relaxed px-4 sm:px-0"
          >
            Premier training for{' '}
            <span className="text-yellow-400 font-semibold">Martial Arts</span>,{' '}
            <span className="text-orange-500 font-semibold">Fitness</span> &{' '}
            <span className="text-red-500 font-semibold">Self-Defense</span>.
            <span className="hidden sm:inline">
              {' '}
              Join the elite community of champions.
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={textVariants}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0"
          >
            <a
              href="#programs"
              className="group relative inline-flex items-center justify-center px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-white transition-all duration-200 bg-gradient-to-r from-yellow-500 to-red-600 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-xl opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
              <span className="relative flex items-center gap-2">
                Explore Programs
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-y-1 transition-transform" />
              </span>
            </a>

            <a
              href="https://www.instagram.com/ghataksportsacademy/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-white transition-all duration-200 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 hover:border-white/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50"
            >
              <span className="flex items-center gap-2">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Follow on Instagram</span>
                <span className="sm:hidden">Instagram</span>
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
            className="mt-6 sm:mt-8 md:mt-10 text-center px-4"
          >
            <p
              lang="sa"
              className="text-base sm:text-lg md:text-xl lg:text-2xl font-serif text-yellow-400/80 tracking-wide mb-1"
            >
              शौर्यं बलं अनुशासनम्।
            </p>
            <p className="text-xs sm:text-sm text-gray-400 italic tracking-wider">
              Strength is born from discipline.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Bottom Controls */}
      <div className="absolute left-0 right-0 bottom-4 sm:bottom-6 lg:bottom-8 flex flex-col items-center gap-4 sm:gap-6 z-20 px-4 pointer-events-none">
        {/* Desktop Slider Navigation */}
        <AnimatePresence>
          <motion.div
            className="pointer-events-auto hidden lg:flex flex-wrap items-center justify-center gap-1.5 w-auto max-w-[90vw] mx-auto px-3 py-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-md shadow-xl"
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
                className={`group relative inline-flex items-center justify-center p-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                  imgIndex === idx ? 'scale-105' : 'hover:scale-105'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              >
                <span
                  className={`inline-block rounded-full transition-all duration-300 w-2.5 h-2.5 ${
                    imgIndex === idx
                      ? 'bg-gradient-to-r from-yellow-400 to-red-500 opacity-100'
                      : 'bg-white/30 group-hover:bg-white/60'
                  }`}
                />
              </button>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Scroll Indicator */}
        <button
          type="button"
          onClick={scrollToAbout}
          aria-label="Scroll down to about section"
          className="pointer-events-auto group"
        >
          <div className="relative h-12 sm:h-14 md:h-16 w-[2px] bg-white/20 rounded-full overflow-hidden group-hover:bg-yellow-500/30 transition-colors duration-300">
            {/* Trail particles */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-400/40 rounded-full"
                animate={{
                  y: [0, 40, 0],
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
                y: [0, 40, 0],
                boxShadow: [
                  '0 0 6px 2px rgba(234, 179, 8, 0.5), 0 0 12px 4px rgba(249, 115, 22, 0.3)',
                  '0 0 10px 3px rgba(234, 179, 8, 0.7), 0 0 20px 6px rgba(249, 115, 22, 0.4)',
                  '0 0 6px 2px rgba(234, 179, 8, 0.5), 0 0 12px 4px rgba(249, 115, 22, 0.3)',
                ],
                scale: [1, 1.15, 1],
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
        </button>
      </div>
    </section>
  );
}
