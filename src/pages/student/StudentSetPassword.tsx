import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/services/supabase/client';
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

export default function StudentSetPassword() {
  const navigate = useNavigate();

  // State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [checkingSession, setCheckingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // --- Dynamic Page Title ---
  useEffect(() => {
    document.title = 'Set Password | GSAI Portal';
  }, []);

  // Session Check
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;

        if (!data.session) {
          toast.error('Please sign in first to update your password.');
          navigate('/student/login', { replace: true });
          return;
        }
      } catch (err) {
        console.error('Session check failed', err);
      } finally {
        if (mounted) setCheckingSession(false);
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

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
      const { error } = await supabase.auth.updateUser({
        password,
        data: {
          require_password_setup: false,
        },
      });

      if (error) throw error;

      await supabase.auth.signOut();
      toast.success(
        'Password set successfully. Please sign in with your new password.'
      );
      navigate('/student/login', { replace: true });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to set password. Please try again.';
      setFormError(message);
      toast.error('An error occurred while saving your password.');
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = submitting || checkingSession;

  // Loading State
  if (checkingSession) {
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
