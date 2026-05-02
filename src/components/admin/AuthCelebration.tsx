import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, LogOut, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthCelebrationProps {
  variant: 'login' | 'logout';
  open: boolean;
  message: string;
}

// --- Animation Variants ---
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2, delay: 0.1 } },
};

const cardVariants: any = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.96,
    transition: { duration: 0.2 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

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
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md px-4"
          role="alertdialog"
          aria-live="assertive"
          aria-modal="true"
        >
          <motion.div
            variants={cardVariants}
            className="w-full max-w-sm bg-background/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl shadow-black/10 p-8 text-center overflow-hidden relative"
          >
            {/* Background Ambient Glow */}
            <div
              className={cn(
                'absolute inset-0 opacity-10 pointer-events-none',
                isLogin
                  ? 'bg-[radial-gradient(circle_at_center,hsl(var(--primary))_0%,transparent_70%)]'
                  : 'bg-[radial-gradient(circle_at_center,hsl(var(--destructive))_0%,transparent_70%)]'
              )}
            />

            {/* Icon Container */}
            <motion.div
              variants={itemVariants}
              className="relative mx-auto w-16 h-16 mb-6"
            >
              <div
                className={cn(
                  'absolute inset-0 rounded-full blur-md animate-pulse opacity-50',
                  isLogin ? 'bg-primary' : 'bg-destructive'
                )}
              />
              <div
                className={cn(
                  'relative h-full w-full rounded-2xl flex items-center justify-center shadow-inner',
                  isLogin
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-destructive/10 text-destructive border border-destructive/20'
                )}
              >
                {isLogin ? (
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                ) : (
                  <LogOut className="w-7 h-7 stroke-[2.5] -ml-1" />
                )}
              </div>
            </motion.div>

            {/* Text Content */}
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                {isLogin ? 'Authentication Successful' : 'Securely Signed Out'}
              </h3>
              <p className="mt-2 text-sm font-medium text-muted-foreground leading-relaxed">
                {message}
              </p>
            </motion.div>

            {/* Progress Indicator */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex items-center justify-center gap-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              <Loader2
                className={cn(
                  'w-3.5 h-3.5 animate-spin',
                  isLogin ? 'text-primary' : 'text-destructive'
                )}
              />
              <span>{isLogin ? 'Loading Workspace...' : 'Redirecting...'}</span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
