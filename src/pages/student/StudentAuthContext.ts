import { createContext, useContext } from 'react';
import { Session } from '@supabase/supabase-js';

/**
 * Represents the core profile data for an authenticated student.
 */
export interface StudentProfile {
  studentId: string;
  studentName: string;
  loginId: string;
  program: string;
}

/**
 * Defines the shape of the authentication context provided to the student portal.
 */
export interface StudentAuthContextType {
  session: Session | null;
  profile: StudentProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (loginId: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// We initialize with `undefined` instead of mock functions.
// This forces the app to fail loudly if the Provider is missing, rather than failing silently.
export const StudentAuthContext = createContext<
  StudentAuthContextType | undefined
>(undefined);

/**
 * Custom hook to access the Student Authentication Context.
 * * @throws {Error} If called outside of a <StudentAuthProvider> tree.
 * @returns {StudentAuthContextType} The current authentication state and methods.
 */
export function useStudentAuth(): StudentAuthContextType {
  const context = useContext(StudentAuthContext);

  if (context === undefined) {
    throw new Error(
      'useStudentAuth must be used within a <StudentAuthProvider>. ' +
        'Please ensure your component tree is wrapped with the provider.'
    );
  }

  return context;
}
