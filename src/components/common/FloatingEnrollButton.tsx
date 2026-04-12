import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const HIDDEN_ROUTES = ['/admin', '/student', '/enroll'];

export default function FloatingEnrollButton() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  const isHidden = HIDDEN_ROUTES.some((r) => location.pathname.startsWith(r));

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isHidden) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-[60]"
        >
          <Link
            to="/enroll"
            className="group flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-yellow-500 to-red-600 text-white font-bold text-sm shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all duration-300 ring-2 ring-white/20"
            aria-label="Enroll at Ghatak Sports Academy"
          >
            <span className="text-lg">🥋</span>
            <span className="hidden sm:inline">
              Enroll at Ghatak Sports Academy
            </span>
            <span className="sm:hidden">Enroll at GSAI</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
