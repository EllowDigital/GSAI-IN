import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, WifiOff, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
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
  const [email, setEmail] = useState('');

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

  const handleSubmit = async (values: { email: string; password: string }) => {
    if (!isOnline) {
      setError('You are offline. Please check your internet connection.');
      return;
    }
    setError(null);
    await signIn(values.email.trim(), values.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-4 py-8">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 p-8 flex flex-col gap-8"
      >
        {/* Logo + Title */}
        <div className="text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl animate-pulse" />
            <img
              src="/assets/img/logo.webp"
              alt="GSAI Logo"
              className="relative w-full h-full object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Welcome Back
            </h2>
            <p className="text-gray-400 mt-2 text-sm">
              Enter your credentials to access the admin panel
            </p>
          </div>
        </div>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched }) => (
            <Form className="flex flex-col gap-5">
              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-300 ml-1"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={`w-full bg-white/5 border ${
                      errors.email && touched.email 
                        ? 'border-red-500/50 focus:border-red-500' 
                        : 'border-white/10 focus:border-yellow-500/50'
                    } rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 transition-all duration-200`}
                    placeholder="admin@gsai.in"
                  />
                </div>
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-xs text-red-400 ml-1"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-300 ml-1"
                >
                  Password
                </label>
                <div className="relative group">
                  <Field
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`w-full bg-white/5 border ${
                      errors.password && touched.password 
                        ? 'border-red-500/50 focus:border-red-500' 
                        : 'border-white/10 focus:border-yellow-500/50'
                    } rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 transition-all duration-200 pr-12`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-500 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-xs text-red-400 ml-1"
                />
              </div>

              {/* Offline Alert */}
              {!isOnline && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
                  <WifiOff className="w-4 h-4" />
                  <span>You are currently offline</span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading || !isOnline}
                className="h-12 mt-2 rounded-xl bg-gradient-to-r from-yellow-500 to-red-600 hover:from-yellow-400 hover:to-red-500 text-white font-bold tracking-wide text-base shadow-lg shadow-orange-500/20 transition-all duration-300 hover:shadow-orange-500/40 active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  'Sign In to Dashboard'
                )}
              </Button>

              {/* Back to Home */}
              <Link
                to="/"
                className="h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-semibold tracking-wide text-base transition-all duration-300 active:scale-[0.98]"
              >
                Back to Home
              </Link>
            </Form>
          )}
        </Formik>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Protected by GSAI Security Systems
          </p>
          <p className="text-[10px] text-gray-600 mt-1">
            © {new Date().getFullYear()} Ghatak Sports Academy India
          </p>
        </div>
      </motion.div>
    </div>
  );
}
