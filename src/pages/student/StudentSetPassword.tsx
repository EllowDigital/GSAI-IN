import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { studentSupabase as supabase } from '@/services/supabase/studentClient';
import {
  Loader2,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  Info,
} from 'lucide-react';
import { toast } from '@/hooks/useToast';
import {
  MIN_PASSWORD_LENGTH,
  validateStrongPassword,
} from '@/utils/passwordPolicy';
import { mapSupabaseErrorToFriendly } from '@/utils/errorHandling';
import { isTimeoutError, withTimeout } from '@/utils/withTimeout';
import { useStudentAuth } from './StudentAuthContext';
import Seo from '@/components/seo/Seo';

const SESSION_CHECK_TIMEOUT_MS = 10000;
const PASSWORD_UPDATE_TIMEOUT_MS = 15000;
const PASSWORD_REDIRECT_METRIC_KEY = 'gsai-student-password-redirect-start-ms';

export default function StudentSetPassword() {
  const navigate = useNavigate();
  const { session, isLoading: authLoading } = useStudentAuth();

  // State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Session Check
  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      toast.error('Please sign in first to update your password.');
      navigate('/student/login', { replace: true });
      return;
    }

    if (!session.user?.user_metadata?.require_password_setup) {
      navigate('/student/dashboard', { replace: true });
    }
  }, [authLoading, session, navigate]);

  // Prefetch dashboard route chunk so post-save navigation feels instant.
  useEffect(() => {
    void import('./StudentDashboard');
  }, []);

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const submitStartMs =
      typeof performance !== 'undefined' ? performance.now() : Date.now();

    setFormError(null);

    const passwordError = validateStrongPassword(password);
    if (passwordError) {
      setFormError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please try again.');
      return;
    }

    setSubmitting(true);

    try {
      // Ensure we still have a valid session right before updating password.
      const { data: sessionData } = await withTimeout(
        supabase.auth.getSession(),
        SESSION_CHECK_TIMEOUT_MS,
        'Session check timed out. Please retry.'
      );
      if (!sessionData?.session) {
        throw new Error('Session expired. Please sign in again.');
      }

      const { error } = await withTimeout(
        supabase.auth.updateUser({
          password,
          data: {
            require_password_setup: false,
          },
        }),
        PASSWORD_UPDATE_TIMEOUT_MS,
        'Password update timed out. Please check your connection and try again.'
      );

      if (error) throw error;

      const redirectStartMs =
        typeof performance !== 'undefined' ? performance.now() : Date.now();
      const totalMs = Math.round(redirectStartMs - submitStartMs);
      console.info('[student-set-password] submit-to-redirect-ms', totalMs);

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(
          PASSWORD_REDIRECT_METRIC_KEY,
          String(Date.now())
        );
      }

      toast.success('Password updated successfully. Redirecting...');
      navigate('/student/dashboard', { replace: true });
    } catch (error: unknown) {
      if (isTimeoutError(error)) {
        const message = 'Request timed out. Please check your connection.';
        setFormError(message);
        toast.error(message);
        return;
      }

      const friendlyError = mapSupabaseErrorToFriendly(error);
      const message =
        friendlyError?.message ||
        (error instanceof Error
          ? error.message
          : 'Failed to set password. Please try again.');
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = submitting || authLoading;

  // Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Verifying secure session...
        </p>
      </div>
    );
  }

  // Main Render
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/80 px-4 py-8 font-sans selection:bg-primary/20">
      <Seo
        title="Set Password | GSAI Student Portal"
        description="Secure password setup for the Ghatak Sports Academy India student portal."
        canonical="/student/set-password"
        noIndex
        noFollow
      />
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="rounded-[2rem] border border-border/50 bg-background/80 p-6 sm:p-10 shadow-2xl shadow-indigo-500/5 backdrop-blur-xl">
          {/* Header */}
          <div className="mb-8 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-indigo-500/10 shadow-inner">
              <Lock className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Set Your Password
            </h1>
            <p className="text-sm text-muted-foreground font-medium max-w-[16rem] mx-auto">
              Create a strong, permanent password to secure your student
              account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* New Password Input */}
            <div className="space-y-2">
              <Label
                htmlFor="new-password"
                className="text-sm font-semibold text-foreground"
              >
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  minLength={MIN_PASSWORD_LENGTH}
                  autoComplete="new-password"
                  required
                  autoFocus
                  disabled={isDisabled}
                  className="h-12 rounded-xl pr-12 transition-all bg-background focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label
                htmlFor="confirm-password"
                className="text-sm font-semibold text-foreground"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  minLength={MIN_PASSWORD_LENGTH}
                  autoComplete="new-password"
                  required
                  disabled={isDisabled}
                  className="h-12 rounded-xl pr-12 transition-all bg-background focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Policy Hint */}
            <div className="rounded-xl bg-slate-50 p-3 border border-border/50 flex gap-2.5 items-start">
              <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed">
                Password must be at least{' '}
                <strong className="text-slate-800">
                  {MIN_PASSWORD_LENGTH} characters
                </strong>{' '}
                long. We recommend using a mix of letters, numbers, and symbols
                for better security.
              </p>
            </div>

            {/* Inline Error */}
            {formError && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="font-medium">{formError}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="h-12 w-full rounded-xl gap-2 font-semibold text-base shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              disabled={isDisabled}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving Password...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  Save & Continue
                </>
              )}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center border-t border-border/50 pt-6">
            <Link
              to="/student/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Cancel and return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
