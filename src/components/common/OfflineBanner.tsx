import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function OfflineBanner() {
  // Initialize state safely checking for SSR environments
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          // We use x: "-50%" to keep it perfectly centered while animating Y and Scale
          initial={{ opacity: 0, y: 40, scale: 0.95, x: '-50%' }}
          animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
          exit={{ opacity: 0, y: 20, scale: 0.95, x: '-50%' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 left-1/2 z-[9999] flex w-[calc(100vw-2rem)] max-w-sm items-center gap-3 rounded-full border border-destructive/30 bg-background/95 px-4 py-3 shadow-2xl shadow-destructive/20 backdrop-blur-xl sm:bottom-10 sm:w-auto sm:px-5"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <WifiOff className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-foreground">
              Connection Lost
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              Please check your internet connection.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
