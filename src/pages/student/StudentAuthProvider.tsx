import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

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
  const navigate = useNavigate();
  const location = useLocation();

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
          // Not a student account
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

    return () => listener.subscription.unsubscribe();
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
      navigate('/student/dashboard', { replace: true });
    } catch (e: any) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
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
    </StudentAuthContext.Provider>
  );
}
