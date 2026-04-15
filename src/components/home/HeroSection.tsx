import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { MouseEvent } from 'react';
import {
  motion,
  AnimatePresence,
  Variants,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from 'framer-motion';
import { Volume2, VolumeX, Instagram, ChevronDown } from 'lucide-react';

const bgImages = [
  '/assets/hero/slider0.webp',
  '/assets/hero/slider1.webp',
  '/assets/hero/slider2.webp',
  '/assets/hero/slider3.webp',
  '/assets/hero/slider4.webp',
  '/assets/hero/slider5.webp',
  '/assets/hero/slider6.webp',
  '/assets/hero/slider8.webp',
  '/assets/hero/slider9.webp',
  '/assets/hero/slider10.webp',
];

const videoSrc = '/assets/hero/intro.mp4';
const IMAGE_DURATION = 4000;

const animatedWords = [
  { text: 'Fire', emoji: '🔥' },
  { text: 'Warrior', emoji: '🐯' },
  { text: 'Strength', emoji: '💪' },
  { text: 'Discipline', emoji: '⚔️' },
];

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

// Reduced particle count for performance
const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1.5,
  duration: Math.random() * 15 + 10,
  delay: Math.random() * 5,
  opacity: Math.random() * 0.3 + 0.1,
}));

export default function HeroSection() {
  const [imgIndex, setImgIndex] = useState(0);
  const [mediaMode, setMediaMode] = useState<'video' | 'images'>('video');
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [showSanskrit, setShowSanskrit] = useState(false);
  const imageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const isVideoActive = mediaMode === 'video';

  // Use CSS custom properties for mouse position instead of state (no re-renders)
  const handleMouseMove = useCallback((e: MouseEvent<HTMLElement>) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--mouse-x', `${x}%`);
    el.style.setProperty('--mouse-y', `${y}%`);
  }, []);

  // Parallax — use will-change and GPU-friendly transforms only
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, 100]);
  const parallaxScale = useTransform(scrollY, [0, 500], [1.02, 1.1]);
  const contentOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Sanskrit quote — use useMotionValueEvent instead of subscribing + setState on every frame
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const shouldShow = latest >= 20;
    // Only update state when value actually changes
    setShowSanskrit((prev) => (prev !== shouldShow ? shouldShow : prev));
  });

  // Word animation cycle
  useEffect(() => {
    const wordTimer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % animatedWords.length);
    }, 2500);
    return () => clearInterval(wordTimer);
  }, []);

  // Preload only the first fallback image to avoid front-loading extra bytes.
  useEffect(() => {
    bgImages.slice(0, 1).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Image Slider Logic
  useEffect(() => {
    if (mediaMode !== 'images') {
      if (imageTimerRef.current) {
        clearTimeout(imageTimerRef.current);
        imageTimerRef.current = null;
      }
      return;
    }

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

    return () => {
      if (imageTimerRef.current) {
        clearTimeout(imageTimerRef.current);
        imageTimerRef.current = null;
      }
    };
  }, [mediaMode, imgIndex]);

  // Video Playback
  useEffect(() => {
    const currentVideo = videoRef.current;
    if (!currentVideo) return;

    if (isVideoActive) {
      currentVideo.currentTime = 0;
      const playPromise = currentVideo.play();
      if (playPromise) {
        playPromise.catch(() => setMediaMode('images'));
      }
      return;
    }
    currentVideo.pause();
  }, [isVideoActive]);

  const goToImage = useCallback(
    (index: number) => {
      setImgIndex(index);
      if (mediaMode === 'video') setMediaMode('images');
    },
    [mediaMode]
  );

  const handleVideoEnd = useCallback(() => setMediaMode('images'), []);

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
      if (!hasInteracted) setHasInteracted(true);
    },
    [hasInteracted]
  );

  const scrollToAbout = useCallback(() => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <section
      ref={heroRef}
      id="hero"
      onClick={handleUserInteraction}
      onMouseMove={handleMouseMove}
      className="relative isolate flex min-h-[100dvh] items-center justify-center overflow-hidden bg-black text-white cursor-default"
      style={
        {
          '--mouse-x': '50%',
          '--mouse-y': '50%',
        } as React.CSSProperties
      }
    >
      {/* Mouse-following spotlight — pure CSS, no re-renders */}
      <div
        className="pointer-events-none absolute inset-0 z-[3] hidden md:block"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(234,179,8,0.06), transparent 60%)`,
        }}
      />

      <h1 className="sr-only">
        Martial Arts Training in Lucknow — Ghatak Sports Academy India
      </h1>

      {/* Floating Particles — reduced count, CSS animations where possible */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        {PARTICLES.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-br from-yellow-400/30 to-orange-500/20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              willChange: 'transform, opacity',
            }}
            animate={{
              y: [-20, -80, -20],
              opacity: [
                particle.opacity,
                particle.opacity * 1.5,
                particle.opacity,
              ],
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

      {/* Background Media with Parallax */}
      <motion.div
        className="absolute inset-0 z-0 overflow-hidden"
        style={{ y: parallaxY, scale: parallaxScale, willChange: 'transform' }}
      >
        <div className="relative h-full w-full">
          <img
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
                />
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

          {/* Heading */}
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
              href="/enroll"
              className="group relative inline-flex items-center justify-center px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-white transition-all duration-200 bg-gradient-to-r from-yellow-500 to-red-600 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 overflow-hidden hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-xl opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
              <span className="relative flex items-center gap-2">
                🥋 Enroll at Ghatak Sports Academy
              </span>
            </a>

            <a
              href="#programs"
              className="group inline-flex items-center justify-center px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-white transition-all duration-200 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 hover:border-white/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50"
            >
              <span className="flex items-center gap-2">
                Explore Programs
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-y-1 transition-transform" />
              </span>
            </a>
          </motion.div>

          {/* Sanskrit Quote */}
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
        <div className="pointer-events-auto hidden lg:flex flex-wrap items-center justify-center gap-1.5 w-auto max-w-[90vw] mx-auto px-3 py-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-md shadow-xl">
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
        </div>

        {/* Scroll Indicator — simplified, CSS animation instead of framer-motion */}
        <button
          type="button"
          onClick={scrollToAbout}
          aria-label="Scroll down to about section"
          className="pointer-events-auto group"
        >
          <div className="relative h-12 sm:h-14 md:h-16 w-[2px] bg-white/20 rounded-full overflow-hidden group-hover:bg-yellow-500/30 transition-colors duration-300">
            <div className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full animate-bounce" />
          </div>
        </button>
      </div>
    </section>
  );
}
