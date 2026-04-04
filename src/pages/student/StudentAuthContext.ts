import { createContext, useContext } from 'react';
import { Session } from '@supabase/supabase-js';

export interface StudentProfile {
  studentId: string;
  studentName: string;
  loginId: string;
  program: string;
}

export interface StudentAuthContextType {
  session: Session | null;
  profile: StudentProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (loginId: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const StudentAuthContext = createContext<StudentAuthContextType>({
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