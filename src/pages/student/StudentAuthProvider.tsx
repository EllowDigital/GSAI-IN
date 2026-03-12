import React, {
  createContext,
  useContext,
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

interface StudentProfile {
  studentId: string;
  studentName: string;
  loginId: string;
  program: string;
}

interface StudentAuthContextType {
  session: Session | null;
  profile: StudentProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (loginId: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const StudentAuthContext = createContext<StudentAuthContextType>({
  session: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  signIn: async () => {},
  signOut: async () => {},
});

export function useStudentAuth() {
  return useContext(StudentAuthContext);
}

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

  const triggerAnimation = (
    type: 'login' | 'logout',
    message: string,
    duration = 1800
  ) => {
    clearAnimationTimeout();
    setAuthAnimation({ type, message });
    authTimeoutRef.current = setTimeout(() => setAuthAnimation(null), duration);
  };

  const loadProfile = useCallback(
    async (userId: string): Promise<StudentProfile | null> => {
      try {
        const { data, error } = (await supabase
          .from('student_portal_accounts')
          .select('student_id, login_id, students(name, program)')
          .eq('auth_user_id', userId)
          .maybeSingle()) as any;

        if (error || !data) return null;
        return {
          studentId: data.student_id,
          loginId: data.login_id,
          studentName: data.students?.name || '',
          program: data.students?.program || '',
        };
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
        const { data } = await supabase.auth.getSession();
        const sess = data.session;
        if (!mounted) return;
        setSession(sess);

        if (sess) {
          const prof = await loadProfile(sess.user.id);
          if (!mounted) return;
          if (prof) {
            setProfile(prof);
            if (
              location.pathname === '/student/login' ||
              location.pathname === '/student'
            ) {
              navigate('/student/dashboard', { replace: true });
            }
          } else {
            setProfile(null);
          }
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
          const prof = await loadProfile(newSession.user.id);
          if (mounted) setProfile(prof);
        } else {
          if (mounted) setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
      clearAnimationTimeout();
    };
  }, [loadProfile, navigate, location.pathname]);

  const signIn = async (loginId: string, password: string) => {
    setIsLoading(true);
    try {
      const email = `${loginId.toLowerCase().trim()}@student.gsai.app`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);

      const prof = await loadProfile(data.user.id);
      if (!prof) {
        await supabase.auth.signOut();
        throw new Error('No student account found for this ID.');
      }
      setProfile(prof);
      triggerAnimation('login', `Welcome back, ${prof.studentName}!`, 2200);
      await new Promise((r) => setTimeout(r, 1500));
      navigate('/student/dashboard', { replace: true });
      setTimeout(() => setAuthAnimation(null), 800);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    isSigningOut.current = true;
    triggerAnimation('logout', 'You have been signed out successfully.', 2500);

    try {
      await new Promise((r) => setTimeout(r, 1000));
      await supabase.auth.signOut();
    } catch {
      // Ignore sign-out errors
    }

    setSession(null);
    setProfile(null);

    await new Promise((r) => setTimeout(r, 300));
    setAuthAnimation(null);
    isSigningOut.current = false;
    navigate('/', { replace: true });
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
