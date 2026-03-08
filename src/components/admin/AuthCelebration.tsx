import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, LogOut } from 'lucide-react';
import React from 'react';

interface AuthCelebrationProps {
  variant: 'login' | 'logout';
  open: boolean;
  message: string;
}

export const AuthCelebration: React.FC<AuthCelebrationProps> = ({
  variant,
  open,
  message,
}) => {
  const isLogin = variant === 'login';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm bg-background border border-border rounded-2xl shadow-xl p-8 text-center"
          >
            {/* Icon */}
            <div
              className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${
                isLogin
                  ? 'bg-primary/10 text-primary'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {isLogin ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <LogOut className="w-6 h-6" />
              )}
            </div>

            {/* Title */}
            <h3 className="mt-5 text-lg font-semibold text-foreground">
              {isLogin ? 'Welcome back!' : 'Signed out'}
            </h3>

            {/* Message */}
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {message}
            </p>

            {/* Progress indicator */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <motion.div
                className="h-1 w-1 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span>{isLogin ? 'Preparing dashboard…' : 'Redirecting…'}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
