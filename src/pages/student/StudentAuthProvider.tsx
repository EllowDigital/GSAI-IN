import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
  session: null, profile: null, isLoading: true, isAuthenticated: false,
  signIn: async () => {}, signOut: async () => {},
});

export function useStudentAuth() { return useContext(StudentAuthContext); }

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authAnimation, setAuthAnimation] = useState<null | { type: 'login' | 'logout'; message: string }>(null);
  const authTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  const triggerAnimation = (type: 'login' | 'logout', message: string, duration = 1800) => {
    if (authTimeoutRef.current) clearTimeout(authTimeoutRef.current);
    setAuthAnimation({ type, message });
    authTimeoutRef.current = setTimeout(() => setAuthAnimation(null), duration);
  };

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('student_portal_accounts')
      .select('student_id, login_id, students(name, program)')
      .eq('auth_user_id', userId)
      .maybeSingle() as any;

    if (error || !data) return null;
    return {
      studentId: data.student_id,
      loginId: data.login_id,
      studentName: data.students?.name || '',
      program: data.students?.program || '',
    } as StudentProfile;
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const sess = data.session;
      setSession(sess);

      if (sess) {
        const prof = await loadProfile(sess.user.id);
        if (prof) {
          setProfile(prof);
          if (location.pathname === '/student/login' || location.pathname === '/student') {
            navigate('/student/dashboard', { replace: true });
          }
        } else {
          setProfile(null);
        }
      }
      setIsLoading(false);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        const prof = await loadProfile(newSession.user.id);
        setProfile(prof);
      } else {
        setProfile(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
      if (authTimeoutRef.current) clearTimeout(authTimeoutRef.current);
    };
  }, [loadProfile, navigate, location.pathname]);

  const signIn = async (loginId: string, password: string) => {
    setIsLoading(true);
    try {
      const email = `${loginId.toLowerCase().trim()}@student.gsai.app`;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);

      const prof = await loadProfile(data.user.id);
      if (!prof) {
        await supabase.auth.signOut();
        throw new Error('No student account found for this ID.');
      }
      setProfile(prof);
      triggerAnimation('login', `Welcome back, ${prof.studentName}!`, 2200);
      await delay(1500);
      navigate('/student/dashboard', { replace: true });
      // Clear animation shortly after navigation
      setTimeout(() => setAuthAnimation(null), 800);
    } catch (e: any) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    triggerAnimation('logout', 'You have been signed out successfully.', 1800);
    await delay(1200);
    setAuthAnimation(null);
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    navigate('/student/login', { replace: true });
  };

  return (
    <StudentAuthContext.Provider value={{
      session, profile, isLoading, isAuthenticated: !!profile, signIn, signOut,
    }}>
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
