import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { toast } from '@/components/ui/sonner';

type AdminAuthContextType = {
  session: Session | null;
  userEmail: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextType>({
  session: null,
  userEmail: null,
  isAdmin: false,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

function AdminAuthProviderInner({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const clearState = () => {
    setSession(null);
    setUserEmail(null);
    setIsAdmin(false);
    setIsLoading(false);
  };

  // Check if user is admin via database lookup
  const checkAdminStatus = async (email: string | null): Promise<boolean> => {
    if (!email) return false;

    try {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      return !!adminUser;
    } catch (error) {
      console.error('Admin status check failed:', error);
      return false;
    }
  };

  const updateAuthState = async (
    newSession: Session | null
  ): Promise<boolean> => {
    const email = newSession?.user?.email ?? null;
    const isAdminUser = await checkAdminStatus(email);

    setSession(newSession);
    setUserEmail(email);
    setIsAdmin(isAdminUser);

    return isAdminUser;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      const isAdminUser = await updateAuthState(session);

      setIsLoading(false);

      if (!isAdminUser) {
        clearState();
        navigate('/admin/login', { replace: true });
      }
    };

    initializeAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        const isAdminUser = await updateAuthState(newSession);
        setIsLoading(false);

        if (!isAdminUser) {
          clearState();
          navigate('/admin/login', { replace: true });
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(`Login failed: ${error.message}`);
      clearState();
      return;
    }

    const signedInEmail = data.user.email;
    const isAdminUser = await checkAdminStatus(signedInEmail);

    if (!isAdminUser) {
      toast.error('Unauthorized: Not an admin account.');
      await supabase.auth.signOut();
      clearState();
      return;
    }

    await updateAuthState(data.session ?? null);
    toast.success('Logged in as admin.');
    navigate('/admin/dashboard', { replace: true });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearState();
    toast.success('Logged out successfully.');
    window.location.replace('/');
  };

  return (
    <AdminAuthContext.Provider
      value={{ session, userEmail, isAdmin, isLoading, signIn, signOut }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

// Outer provider to allow wrapping and reuse if needed
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  return <AdminAuthProviderInner>{children}</AdminAuthProviderInner>;
}

// Hook to consume admin auth context
export function useAdminAuth(): AdminAuthContextType {
  return useContext(AdminAuthContext);
}
