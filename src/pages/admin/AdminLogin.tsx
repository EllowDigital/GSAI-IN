import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, WifiOff, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const LoginSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export default function AdminLogin() {
  const { signIn, isLoading, isAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const email = 'ghatakgsai@gmail.com';

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

  const handleSubmit = async (values: { password: string }) => {
    if (!isOnline) {
      setError('You are offline. Please check your internet connection.');
      return;
    }
    setError(null);
    await signIn(email.trim(), values.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-white to-yellow-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-sm bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border border-yellow-200 dark:border-gray-700 rounded-2xl shadow-lg p-6 sm:p-8 flex flex-col gap-6"
      >
        {/* Logo + Title */}
        <div className="text-center">
          <img
            src="/assets/img/logo.webp"
            alt="GSAI Logo"
            className="h-20 mx-auto"
          />
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-yellow-500 dark:text-yellow-400">
            Admin Login
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Secure Access Panel
          </p>
        </div>

        <Formik
          initialValues={{ password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ values }) => (
            <Form className="flex flex-col gap-4">
              {/* Email (read-only) */}
              <div>
                <label
                  htmlFor="email"
                  className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800 dark:text-white text-sm rounded-lg border-yellow-300 dark:border-gray-600"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block"
                >
                  Password
                </label>
                <div className="relative">
                  <Field
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-yellow-300 dark:border-gray-600 text-sm rounded-lg pr-10"
                    as={Input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-2 right-3 text-gray-500 dark:text-gray-400"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-xs text-red-500 mt-1"
                />
              </div>

              {/* Offline Alert */}
              {!isOnline && (
                <Alert variant="destructive">
                  <WifiOff className="w-4 h-4" />
                  <AlertTitle>Offline</AlertTitle>
                  <AlertDescription>
                    Please check your internet connection.
                  </AlertDescription>
                </Alert>
              )}

              {/* Error */}
              {error && (
                <div className="text-sm text-red-500 text-center">{error}</div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading || !isOnline}
                className="h-11 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold tracking-wide text-base shadow"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  'Sign In'
                )}
              </Button>
            </Form>
          )}
        </Formik>

        <div className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">
          © {new Date().getFullYear()} GSAI. All rights reserved.
        </div>
      </motion.div>
    </div>
  );
}
