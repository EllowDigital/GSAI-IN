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

const ADMIN_EMAIL = 'ghatakgsai@gmail.com';

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

  const updateAuthState = (session: Session | null) => {
    const email = session?.user?.email ?? null;
    setSession(session);
    setUserEmail(email);
    const isAdminUser = email === ADMIN_EMAIL;
    setIsAdmin(isAdminUser);
    return isAdminUser;
  };

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const currentSession = data.session;
      const isAdminUser = updateAuthState(currentSession);
      setIsLoading(false);

      if (!isAdminUser) {
        clearState();
        navigate('/admin/login', { replace: true });
      }
    };

    checkSession();

    // Auth change listener
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        const isAdminUser = updateAuthState(newSession);
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

    if (data.user.email !== ADMIN_EMAIL) {
      toast.error('Unauthorized: This is not the designated admin account.');
      await supabase.auth.signOut();
      clearState();
      return;
    }

    updateAuthState(data.session ?? null);
    toast.success('Successfully logged in as admin.');
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

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  return <AdminAuthProviderInner>{children}</AdminAuthProviderInner>;
}

export function useAdminAuth(): AdminAuthContextType {
  return useContext(AdminAuthContext);
}
