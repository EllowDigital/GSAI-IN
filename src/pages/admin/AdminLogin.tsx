import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthProvider';
import { Button } from '@/components/ui/button';
import { Loader2, WifiOff, Eye, EyeOff, AlertCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';

// --- Validation Schema ---
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

// --- Types ---
type LoginValues = Yup.InferType<typeof LoginSchema>;

export default function AdminLogin() {
  const { signIn, isLoading, isAdmin } = useAdminAuth();
  const navigate = useNavigate();
  
  // --- State ---
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Dynamic Page Title ---
  useEffect(() => {
    document.title = 'Admin Access | GSAI Security';
  }, []);

  // --- Redirect if already authenticated ---
  useEffect(() => {
    if (!isLoading && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAdmin, isLoading, navigate]);

  // --- Network Status Listener ---
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setError(null); // Clear offline error when connection returns
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- Submit Handler ---
  const handleSubmit = async (
    values: LoginValues, 
    { setSubmitting }: FormikHelpers<LoginValues>
  ) => {
    if (!isOnline) {
      setError('You are offline. Please check your internet connection.');
      setSubmitting(false);
      return;
    }
    
    setError(null);
    
    try {
      await signIn(values.email.trim(), values.password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed. Please verify your credentials.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden px-4 py-8 font-sans selection:bg-yellow-500/20">
      
      {/* Background Ambient Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md bg-[#0f0f0f]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black p-8 flex flex-col gap-8"
      >
        
        {/* Logo & Header */}
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto">
            <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl animate-pulse" />
            <img
              src="/assets/images/logo.webp"
              alt="GSAI Logo"
              className="relative w-full h-full object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.2)]"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Admin Access
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              Enter your credentials to manage the portal
            </p>
          </div>
        </div>

        {/* Form */}
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => {
            const formDisabled = isLoading || isSubmitting || !isOnline;

            return (
              <Form className="flex flex-col gap-5" noValidate>
                
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-gray-300 ml-1">
                    Email Address
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    disabled={formDisabled}
                    className={`w-full bg-white/5 border ${
                      errors.email && touched.email
                        ? 'border-red-500/50 focus-visible:ring-red-500/20'
                        : 'border-white/10 focus-visible:border-yellow-500/50 focus-visible:ring-yellow-500/20'
                    } rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus-visible:ring-2 transition-all duration-200`}
                    placeholder="admin@gsai.in"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-xs font-medium text-red-400 ml-1 mt-1"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-gray-300 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <Field
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      disabled={formDisabled}
                      className={`w-full bg-white/5 border ${
                        errors.password && touched.password
                          ? 'border-red-500/50 focus-visible:ring-red-500/20'
                          : 'border-white/10 focus-visible:border-yellow-500/50 focus-visible:ring-yellow-500/20'
                      } rounded-xl px-4 py-3 pr-12 text-white placeholder:text-gray-600 focus:outline-none focus-visible:ring-2 transition-all duration-200`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute top-1/2 -translate-y-1/2 right-3 p-1.5 text-gray-500 hover:text-white rounded-md hover:bg-white/5 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-xs font-medium text-red-400 ml-1 mt-1"
                  />
                </div>

                {/* Offline Alert */}
                {!isOnline && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
                    <WifiOff className="w-5 h-5 shrink-0" />
                    <span className="font-medium">Connection lost. Please check your internet.</span>
                  </div>
                )}

                {/* Error Alert */}
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={formDisabled}
                  className="h-12 mt-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 border-none text-white font-bold tracking-wide text-base shadow-lg shadow-yellow-600/20 transition-all duration-300 hover:shadow-yellow-500/30 active:scale-[0.98]"
                >
                  {isLoading || isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5 mr-2" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-5 h-5 mr-2" />
                      Secure Login
                    </>
                  )}
                </Button>

                {/* Back Link */}
                <Link
                  to="/"
                  className="h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-medium tracking-wide transition-all duration-300 active:scale-[0.98]"
                >
                  Return to Main Site
                </Link>
              </Form>
            );
          }}
        </Formik>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-white/10">
          <p className="text-[11px] uppercase tracking-widest font-semibold text-gray-500">
            Protected by GSAI Security
          </p>
          <p className="text-[10px] text-gray-600 mt-1.5">
            © {new Date().getFullYear()} Ghatak Sports Academy India
          </p>
        </div>
        
      </motion.div>
    </div>
  );
}