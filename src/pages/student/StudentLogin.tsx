import React, { useState } from 'react';
import { useStudentAuth } from './StudentAuthProvider';
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
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentLogin() {
  const { signIn, isLoading, isAuthenticated } = useStudentAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await signIn(loginId.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = isLoading || submitting;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-background to-indigo-100/60">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-8 lg:grid-cols-2 lg:px-8">
        <section className="hidden lg:block">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-8 text-slate-100 shadow-xl">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-52 w-52 rounded-full bg-indigo-300/20 blur-3xl" />

            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                Student Access Portal
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-semibold leading-tight">
                  Track Progress, Fees, Events, and Competitions
                </h1>
                <p className="max-w-md text-sm text-slate-200">
                  Secure login for students to view personal dashboard updates in
                  one simple, modern workspace.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/20 bg-white/10 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Security
                  </p>
                  <p className="mt-1 text-sm font-medium">Account Protected</p>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Access
                  </p>
                  <p className="mt-1 text-sm font-medium">24x7 Dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-border/70 bg-card/95 p-6 shadow-lg backdrop-blur-sm sm:p-7">
            <div className="mb-6 space-y-3 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <GraduationCap className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Student Portal</h2>
              <p className="text-sm text-muted-foreground">
                Sign in with your Student ID and password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="login-id"
                  className="text-sm font-medium text-foreground"
                >
                  Student ID
                </label>
                <Input
                  id="login-id"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. GSAI-5549"
                  required
                  autoComplete="username"
                  disabled={isDisabled}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="pr-10"
                    disabled={isDisabled}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-center text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={isDisabled} className="h-11 w-full gap-2">
                {isDisabled ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                {isDisabled ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              First-time password: GSAI-STUDENT-2026. Change it from inside the
              portal after signing in.
            </p>

            <div className="mt-4 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Website
              </Link>
            </div>
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}
