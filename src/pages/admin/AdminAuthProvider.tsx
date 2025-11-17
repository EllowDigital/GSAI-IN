import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { toast } from '@/components/ui/sonner';
import { AuthCelebration } from '@/components/admin/AuthCelebration';

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

const ADMIN_SESSION_CACHE_KEY = 'gsai-admin-session-cache';

function AdminAuthProviderInner({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authAnimation, setAuthAnimation] = useState<null | {
    type: 'login' | 'logout';
    message: string;
  }>(null);
  const pendingLogoutRef = useRef(false);
  const authAnimationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const navigate = useNavigate();

  const persistSessionTokens = useCallback((sessionToPersist: Session | null) => {
    if (typeof window === 'undefined') return;
    if (!sessionToPersist?.access_token || !sessionToPersist?.refresh_token) {
      sessionStorage.removeItem(ADMIN_SESSION_CACHE_KEY);
      return;
    }

    sessionStorage.setItem(
      ADMIN_SESSION_CACHE_KEY,
      JSON.stringify({
        access_token: sessionToPersist.access_token,
        refresh_token: sessionToPersist.refresh_token,
      })
    );
  }, []);

  const restoreSessionFromCache = useCallback(async (): Promise<Session | null> => {
    if (typeof window === 'undefined') return null;
    const cached = sessionStorage.getItem(ADMIN_SESSION_CACHE_KEY);
    if (!cached) return null;

    try {
      const parsed = JSON.parse(cached) as {
        access_token?: string;
        refresh_token?: string;
      };
      if (!parsed.access_token || !parsed.refresh_token) {
        sessionStorage.removeItem(ADMIN_SESSION_CACHE_KEY);
        return null;
      }

      const { data, error } = await supabase.auth.setSession({
        access_token: parsed.access_token,
        refresh_token: parsed.refresh_token,
      });

      if (error) {
        sessionStorage.removeItem(ADMIN_SESSION_CACHE_KEY);
        return null;
      }

      return data.session;
    } catch {
      sessionStorage.removeItem(ADMIN_SESSION_CACHE_KEY);
      return null;
    }
  }, []);

  const clearState = (options?: { keepLoading?: boolean }) => {
    setSession(null);
    setUserEmail(null);
    setIsAdmin(false);
    persistSessionTokens(null);
    if (!options?.keepLoading) {
      setIsLoading(false);
    }
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const triggerAuthAnimation = (type: 'login' | 'logout') => {
    const message =
      type === 'login'
        ? 'Redirecting you to the admin workspace'
        : 'Preparing the public site for you';

    if (authAnimationTimeoutRef.current) {
      clearTimeout(authAnimationTimeoutRef.current);
    }
    setAuthAnimation({ type, message });
    authAnimationTimeoutRef.current = setTimeout(
      () => setAuthAnimation(null),
      1800
    );
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
    newSession: Session | null,
    adminStatusOverride?: boolean
  ): Promise<boolean> => {
    const email = newSession?.user?.email ?? null;
    const roleFromMetadata = (newSession?.user?.user_metadata?.role ?? '')
      .toString()
      .toLowerCase();
    let isAdminUser = roleFromMetadata === 'admin';

    if (typeof adminStatusOverride === 'boolean') {
      isAdminUser = adminStatusOverride;
    } else if (!isAdminUser) {
      isAdminUser = await checkAdminStatus(email);
    }

    setSession(newSession);
    setUserEmail(email);
    setIsAdmin(isAdminUser);
    persistSessionTokens(newSession);

    return isAdminUser;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await restoreSessionFromCache();
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        const isAdminUser = await updateAuthState(session);

        setIsLoading(false);

        if (!isAdminUser && !pendingLogoutRef.current) {
          clearState();
          navigate('/admin/login', { replace: true });
        }
      } catch (error) {
        console.error('Failed to initialize admin auth', error);
        clearState();
        navigate('/admin/login', { replace: true });
      }
    };

    initializeAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        try {
          const isAdminUser = await updateAuthState(newSession);
          setIsLoading(false);

          if (!isAdminUser && !pendingLogoutRef.current) {
            clearState();
            navigate('/admin/login', { replace: true });
          }
        } catch (error) {
          console.error('Auth state listener failed', error);
          clearState();
          navigate('/admin/login', { replace: true });
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
      if (authAnimationTimeoutRef.current) {
        clearTimeout(authAnimationTimeoutRef.current);
      }
    };
  }, [navigate, restoreSessionFromCache]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      const signedInEmail = data.user?.email ?? null;
      const isAdminUser = await checkAdminStatus(signedInEmail);

      if (!isAdminUser) {
        await supabase.auth.signOut();
        throw new Error('Unauthorized: Not an admin account.');
      }

      await updateAuthState(data.session ?? null, true);
      persistSessionTokens(data.session ?? null);
      toast.success('Logged in as admin.');
      triggerAuthAnimation('login');
      await delay(1200);
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unexpected login error.';
      toast.error(`Login failed: ${message}`);
      clearState();
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    if (pendingLogoutRef.current) return;

    pendingLogoutRef.current = true;
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }

      clearState({ keepLoading: true });
      toast.success('Logged out successfully.');
      triggerAuthAnimation('logout');
      await delay(1400);
      pendingLogoutRef.current = false;
      window.location.replace('/');
    } catch (error) {
      pendingLogoutRef.current = false;
      const message =
        error instanceof Error ? error.message : 'Unexpected logout error.';
      toast.error(`Logout failed: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{ session, userEmail, isAdmin, isLoading, signIn, signOut }}
    >
      {children}
      {authAnimation && (
        <AuthCelebration
          variant={authAnimation.type}
          open={!!authAnimation}
          message={authAnimation.message}
        />
      )}
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
