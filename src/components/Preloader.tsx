import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
      >
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-yellow-200/20 rounded-full blur-[100px]"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-red-200/20 rounded-full blur-[100px]"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Logo Container with Pulse */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative mb-8"
          >
            {/* Logo */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 z-10">
              <img
                src="/assets/img/logo.webp"
                alt="GSAI Logo"
                className="w-full h-full object-contain drop-shadow-xl"
              />
            </div>

            {/* Pulsing Rings */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-orange-500/20 z-0"
              animate={{ scale: [1, 1.6], opacity: [0.8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-yellow-500/20 z-0"
              animate={{ scale: [1, 1.6], opacity: [0.8, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.6,
              }}
            />
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center space-y-2"
          >
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
              GSAI
            </h1>
            <p className="text-sm sm:text-base font-medium text-slate-500 tracking-widest uppercase">
              Ghatak Sports Academy India
            </p>
          </motion.div>

          {/* Minimal Loading Indicator - Bouncing Dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10"
          >
            <div className="flex gap-2.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 shadow-sm"
                  animate={{ y: [0, -12, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
