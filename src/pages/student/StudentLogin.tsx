import React, { useState, useEffect } from 'react';
import { useStudentAuth } from './StudentAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Info,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Memoized to prevent unnecessary re-renders when the user types in the form inputs.
const BrandingPanel = React.memo(() => (
  <section className="hidden lg:flex flex-col justify-center h-full">
    <div className="relative overflow-hidden rounded-[2rem] border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-12 text-slate-100 shadow-2xl transition-all hover:shadow-indigo-500/10">
      
      {/* Decorative Blur Effects */}
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/30 bg-indigo-500/20 px-4 py-1.5 text-xs font-semibold tracking-wide text-indigo-100 backdrop-blur-md shadow-sm">
          <Sparkles className="h-4 w-4 text-indigo-300" />
          Student Access Portal
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl xl:text-5xl font-bold leading-[1.15] tracking-tight">
            Track Progress, Fees, Events & Competitions.
          </h1>
          <p className="max-w-md text-base text-slate-300 leading-relaxed">
            Securely log in to view your personal dashboard, manage upcoming events, and stay updated in one modern workspace.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 pt-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-colors hover:bg-white/10">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-5 w-5 text-green-400" />
              <p className="text-sm font-semibold text-slate-200">Security</p>
            </div>
            <p className="text-xs text-slate-400 font-medium">End-to-End Encrypted</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-colors hover:bg-white/10">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-5 w-5 text-blue-400" />
              <p className="text-sm font-semibold text-slate-200">Access</p>
            </div>
            <p className="text-xs text-slate-400 font-medium">24x7 Availability</p>
          </div>
        </div>
      </div>
    </div>
  </section>
));

BrandingPanel.displayName = 'BrandingPanel';

export default function StudentLogin() {
  const { signIn, isLoading, isAuthenticated } = useStudentAuth();
  
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // --- Dynamic Page Title ---
  useEffect(() => {
    document.title = 'Student Login | GSAI Portal';
  }, []);

  if (isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || isLoading) return;
    
    setError(null);
    setSubmitting(true);
    
    try {
      await signIn(loginId.trim(), password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = isLoading || submitting;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/80 font-sans text-slate-900 selection:bg-primary/20">
      
      <div className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-12">
        
        {/* Left Side: Static Branding */}
        <BrandingPanel />

        {/* Right Side: Interactive Form */}
        <section className="mx-auto w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-[2rem] border border-border/50 bg-background/80 p-6 sm:p-10 shadow-2xl shadow-indigo-500/5 backdrop-blur-xl">
            
            {/* Header */}
            <div className="mb-8 text-center space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-inner">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Welcome Back
              </h2>
              <p className="text-sm text-muted-foreground font-medium">
                Sign in with your Student ID to continue
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              
              <div className="space-y-2">
                <label htmlFor="loginId" className="text-sm font-semibold text-foreground">
                  Student ID
                </label>
                <Input
                  id="loginId"
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. GSAI-5549"
                  required
                  autoComplete="username"
                  autoFocus
                  disabled={isDisabled}
                  className="h-12 rounded-xl transition-all bg-background focus-visible:ring-2 focus-visible:ring-primary/50"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-semibold text-foreground">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    disabled={isDisabled}
                    className="h-12 rounded-xl pr-12 transition-all bg-background focus-visible:ring-2 focus-visible:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isDisabled}
                className="h-12 w-full rounded-xl gap-2 font-semibold text-base shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                {isDisabled ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    Secure Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Info Badge */}
            <div className="mt-8 rounded-xl bg-blue-50/50 p-4 border border-blue-100/50 flex gap-3 items-start">
              <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900/80">
                <span className="font-semibold text-blue-900">First time here?</span> Your default password is{' '}
                <code className="bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded font-bold tracking-wide">
                  GSAI-STUDENT-2026
                </code>
              </div>
            </div>

            {/* Footer Links */}
            <div className="mt-8 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Main Website
              </Link>
            </div>

            <div className="mt-8 border-t border-border/50 pt-6 text-center">
              <p className="text-xs text-muted-foreground font-medium">
                Powered by{' '}
                <a
                  href="https://ellowdigital.space"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-foreground hover:text-primary transition-colors underline underline-offset-4"
                >
                  EllowDigital
                </a>
              </p>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}