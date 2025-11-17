import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Sparkles } from 'lucide-react';
import React from 'react';

const LoginBadge = () => (
  <svg
    viewBox="0 0 320 240"
    className="h-40 w-full max-w-[260px] sm:h-48"
    role="img"
    aria-label="GSAI admin login confirmation illustration"
  >
    <rect width="320" height="240" rx="28" fill="#FFFBEA" />
    <circle cx="80" cy="120" r="40" fill="#FACC15" opacity="0.8" />
    <circle cx="80" cy="120" r="24" fill="#FCD34D" />
    <path
      d="M150 70h130c10 0 18 8 18 18v110c0 10-8 18-18 18H150c-10 0-18-8-18-18V88c0-10 8-18 18-18z"
      fill="#fff"
      stroke="#FACC15"
      strokeWidth="4"
    />
    <rect x="172" y="112" width="90" height="16" rx="8" fill="#FACC15" />
    <rect x="172" y="140" width="110" height="14" rx="7" fill="#FEDC56" />
    <rect
      x="172"
      y="168"
      width="70"
      height="12"
      rx="6"
      fill="#FACC15"
      opacity="0.6"
    />
    <text
      x="32"
      y="56"
      fontSize="18"
      fontWeight="600"
      fontFamily="'Inter', 'Segoe UI', sans-serif"
      fill="#a16207"
    >
      GSAI ACCESS
    </text>
  </svg>
);

const LogoutBadge = () => (
  <svg
    viewBox="0 0 320 240"
    className="h-40 w-full max-w-[260px] sm:h-48"
    role="img"
    aria-label="GSAI admin logout confirmation illustration"
  >
    <rect width="320" height="240" rx="28" fill="#FEE2E2" />
    <path
      d="M148 70h120c10 0 18 8 18 18v96c0 10-8 18-18 18H148"
      fill="#fff"
      stroke="#FB7185"
      strokeWidth="4"
    />
    <path
      d="M48 140h128"
      stroke="#FB7185"
      strokeWidth="12"
      strokeLinecap="round"
    />
    <path
      d="M128 110l40 30-40 30"
      fill="none"
      stroke="#FB7185"
      strokeWidth="12"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="232" cy="120" r="14" fill="#FDA4AF" />
    <circle cx="232" cy="166" r="14" fill="#FDA4AF" />
    <text
      x="32"
      y="56"
      fontSize="18"
      fontWeight="600"
      fontFamily="'Inter', 'Segoe UI', sans-serif"
      fill="#BE123C"
    >
      GSAI SIGN-OUT
    </text>
  </svg>
);

const illustrationMap: Record<'login' | 'logout', JSX.Element> = {
  login: <LoginBadge />,
  logout: <LogoutBadge />,
};

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
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-3 py-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex w-full max-w-lg flex-col items-center gap-6 rounded-3xl bg-gradient-to-br from-white via-white/90 to-yellow-50 p-6 text-center shadow-2xl sm:p-10"
          >
            <div className="absolute -top-5 right-6 rounded-full bg-yellow-100 p-2 text-yellow-600 shadow-md">
              {variant === 'login' ? (
                <Sparkles className="h-5 w-5" />
              ) : (
                <LogOut className="h-5 w-5" />
              )}
            </div>

            <div className="relative flex w-full max-w-xs items-center justify-center rounded-2xl bg-white/90 p-4 shadow-inner sm:max-w-sm">
              {illustrationMap[variant]}
              <motion.div
                className="pointer-events-none absolute inset-1 rounded-2xl border border-yellow-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.15, 0.5, 0.15] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500 sm:text-sm">
                {variant === 'login'
                  ? 'GSAI portal access'
                  : 'GSAI portal exit'}
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 sm:text-3xl">
                {variant === 'login'
                  ? 'Welcome back, Admin!'
                  : 'Session closed safely'}
              </p>
              <p className="mt-3 text-sm text-gray-500 sm:text-base">
                {message}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
              <span>GSAI Control Hub</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
