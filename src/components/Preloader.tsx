import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Award } from 'lucide-react';

export default function Preloader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }

        // Simulate a more realistic loading process:
        // It starts fast, then slows down significantly towards the end.
        let increment = 1;
        if (prev < 50) {
          increment = 5; // Fast in the first half
        } else if (prev < 80) {
          increment = 2; // Slower in the second half
        } else if (prev < 95) {
          increment = 1; // Slower as it gets close
        } else {
          increment = 0.5; // Crawls to the finish
        }

        return Math.min(prev + increment, 100); // Ensure it doesn't go over 100
      });
    }, 80); // Interval set to 80ms for a smooth, visible progression

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-red-50"
      >
        {/* Animated Background Circles */}
        <motion.div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-yellow-200/30 to-red-200/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-red-200/30 to-yellow-200/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />
        </motion.div>

        <div className="flex flex-col items-center space-y-8 text-center relative z-10">
          {/* Logo with Scale Animation (No Rotation or circular bg) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative w-32 h-32" // Set size on the container
          >
            {/* Removed the circular background div */}
            <img
              src="/assets/img/logo.webp" // Restored your original logo path
              alt="Ghatak Sports Academy India"
              className="w-full h-full object-contain" // Use object-contain to fit, removed rounded-full
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/120x120/FFF/333?text=Logo'; }} // Fallback to placeholder
            />
          </motion.div>

          {/* Spinner and Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-3">
              {/* This spinner rotation is good, it indicates active loading */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-7 h-7 text-yellow-600" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">
                Loading...
              </span>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-64 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'linear' }} // Use linear for smooth bar fill
              />
            </div>

            {/* Progress Percentage - animates with each new number */}
            <motion.span
              key={Math.round(progress)} // Use rounded progress for the key
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-semibold text-gray-600"
            >
              {Math.round(progress)}%
            </motion.span>
          </motion.div>

          {/* Footer with Icon */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Award className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-gray-700 font-semibold tracking-wide">
              Ghatak Sports Academy India
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

