import React, {
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/services/supabase/client';
import { Session } from '@supabase/supabase-js';
import { AuthCelebration } from '@/components/admin/AuthCelebration';
import { clearPersistedSupabaseSession } from '@/services/supabase/session';
import { toast } from '@/components/ui/sonner';
import { isTimeoutError, withTimeout } from '@/utils/withTimeout';
import { StudentAuthContext, StudentProfile } from './StudentAuthContext';

const AUTH_TIMEOUT_MS = 15000;
const STUDENT_PROFILE_STORAGE_KEY = 'gsai-student-profile-cache';

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authAnimation, setAuthAnimation] = useState<null | {
    type: 'login' | 'logout';
    message: string;
  }>(null);
  const authTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSigningOut = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  const clearAnimationTimeout = () => {
    if (authTimeoutRef.current) {
      clearTimeout(authTimeoutRef.current);
      authTimeoutRef.current = null;
    }
  };

  const getCachedStudentProfile = (): StudentProfile | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(STUDENT_PROFILE_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as StudentProfile;
      if (!parsed?.studentId || !parsed?.loginId) return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const cacheStudentProfile = (nextProfile: StudentProfile | null) => {
    if (typeof window === 'undefined') return;
    if (!nextProfile) {
      window.localStorage.removeItem(STUDENT_PROFILE_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(
      STUDENT_PROFILE_STORAGE_KEY,
      JSON.stringify(nextProfile)
    );
  };

  const triggerAnimation = (
    type: 'login' | 'logout',
    message: string,
    duration = 1800
  ) => {
    clearAnimationTimeout();
    setAuthAnimation({ type, message });
    authTimeoutRef.current = setTimeout(() => setAuthAnimation(null), duration);
  };

  const requiresPasswordSetup = (sess: Session | null): boolean => {
    return Boolean(sess?.user?.user_metadata?.require_password_setup);
  };

  const loadProfile = useCallback(
    async (userId: string): Promise<StudentProfile | null> => {
      try {
        const { data, error } = (await withTimeout(
          supabase
            .from('student_portal_accounts')
            .select('student_id, login_id, students(name, program)')
            .eq('auth_user_id', userId)
            .maybeSingle(),
          AUTH_TIMEOUT_MS,
          'Loading student profile timed out.'
        )) as any;

        if (error || !data) return null;
        const nextProfile = {
          studentId: data.student_id,
          loginId: data.login_id,
          studentName: data.students?.name || '',
          program: data.students?.program || '',
        };
        cacheStudentProfile(nextProfile);
        return nextProfile;
      } catch {
        return null;
      }
    },
    []
  );

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_TIMEOUT_MS,
          'Loading student session timed out.'
        );
        const sess = data.session;
        if (!mounted) return;
        setSession(sess);

        if (sess) {
          const prof = await loadProfile(sess.user.id);
          if (!mounted) return;
          if (prof) {
            setProfile(prof);
            const currentPath = window.location.pathname;
            if (requiresPasswordSetup(sess)) {
              if (currentPath !== '/student/set-password') {
                navigate('/student/set-password', { replace: true });
              }
              return;
            }
            if (
              currentPath === '/student/login' ||
              currentPath === '/student' ||
              currentPath === '/student/set-password'
            ) {
              navigate('/student/dashboard', { replace: true });
            }
          } else {
            setProfile(null);
            cacheStudentProfile(null);
          }
        } else {
          setProfile(null);
          cacheStudentProfile(null);
        }
      } catch (error) {
        if (isTimeoutError(error)) {
          const cached = getCachedStudentProfile();
          if (cached) {
            setProfile(cached);
            toast.warning('Using cached student session. Reconnecting...');
          } else {
            setSession(null);
            setProfile(null);
          }
          toast.error('Student portal is responding slowly. Please try again.');
        } else {
          setSession(null);
          setProfile(null);
          cacheStudentProfile(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted || isSigningOut.current) return;
        setSession(newSession);
        if (newSession) {
          const currentPath = window.location.pathname;
          if (requiresPasswordSetup(newSession)) {
            if (currentPath !== '/student/set-password') {
              navigate('/student/set-password', { replace: true });
            }
          }
          const prof = await loadProfile(newSession.user.id);
          if (mounted) setProfile(prof);
        } else {
          if (mounted) setProfile(null);
          cacheStudentProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
      clearAnimationTimeout();
    };
  }, [loadProfile, navigate]);

  useEffect(() => {
    if (authAnimation?.type !== 'login') return;
    if (location.pathname !== '/student/dashboard') return;

    const settleTimer = setTimeout(() => {
      setAuthAnimation(null);
      clearAnimationTimeout();
    }, 250);

    return () => clearTimeout(settleTimer);
  }, [authAnimation, location.pathname]);

  const signIn = async (loginId: string, password: string) => {
    setIsLoading(true);
    try {
      const email = `${loginId.toLowerCase().trim()}@student.gsai.app`;
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        AUTH_TIMEOUT_MS,
        'Login request timed out. Please check your connection and try again.'
      );
      if (error) throw new Error(error.message);

      if (requiresPasswordSetup(data.session)) {
        navigate('/student/set-password', { replace: true });
        return;
      }

      const prof = await loadProfile(data.user.id);
      if (!prof) {
        await supabase.auth.signOut();
        throw new Error('No student account found for this ID.');
      }
      setProfile(prof);
      cacheStudentProfile(prof);
      triggerAnimation('login', `Welcome back, ${prof.studentName}!`, 500);
      navigate('/student/dashboard', { replace: true });
    } catch (error) {
      if (isTimeoutError(error)) {
        throw new Error('Login timed out. Please try again.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    if (isSigningOut.current) return;

    isSigningOut.current = true;
    setIsLoading(true);
    triggerAnimation('logout', 'You have been signed out successfully.', 700);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      clearPersistedSupabaseSession();
      setSession(null);
      setProfile(null);
      cacheStudentProfile(null);

      setAuthAnimation(null);
      navigate('/student/login', { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unexpected sign-out error.';
      toast.error(`Sign out failed: ${message}`);
      return;
    } finally {
      setIsLoading(false);
      isSigningOut.current = false;
    }
  };

  return (
    <StudentAuthContext.Provider
      value={{
        session,
        profile,
        isLoading,
        isAuthenticated: !!profile,
        signIn,
        signOut,
      }}
    >
      {children}
      {authAnimation && (
        <AuthCelebration
          variant={authAnimation.type}
          open={!!authAnimation}
          message={authAnimation.message}
        />
      )}
    </StudentAuthContext.Provider>
  );
}
