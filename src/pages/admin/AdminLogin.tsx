import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const { signIn, isLoading, isAdmin } = useAdminAuth();
  const [email] = useState('ghatakgsai@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAdmin, isLoading, navigate]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isOnline) {
      setError('You are offline. Please check your internet connection.');
      return;
    }
    setError(null);
    await signIn(email.trim(), password);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center p-4 font-montserrat">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="backdrop-blur-xl bg-white/80 border border-yellow-300 rounded-3xl shadow-xl px-6 py-8 w-full max-w-md flex flex-col gap-6 animate-in fade-in"
      >
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-2">
          <motion.img
            src="/assets/img/logo.webp"
            alt="GSAI Logo"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
            className="h-20 w-auto object-contain"
          />
          <motion.h1
            className="text-3xl font-extrabold text-yellow-500 mt-3 tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Admin Login
          </motion.h1>
        </div>

        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Admin Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            autoComplete="username"
            className="rounded-xl bg-gray-50 border-yellow-300 text-base"
          />
        </div>

        {/* Password Input */}
        <div>
          <label
            htmlFor="password"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            minLength={6}
            required
            className="rounded-xl bg-gray-50 border-yellow-300 text-base"
          />
        </div>

        {/* Offline Alert */}
        {!isOnline && (
          <Alert variant="destructive" className="text-center">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>You are offline</AlertTitle>
            <AlertDescription>
              Please check your internet connection to sign in.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-500 text-center">{error}</div>
        )}

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            type="submit"
            disabled={isLoading || !isOnline}
            className="h-12 w-full rounded-xl text-lg font-bold flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white shadow disabled:bg-yellow-300"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
          </Button>
        </motion.div>
      </motion.form>
    </div>
  );
}
