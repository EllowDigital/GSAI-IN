import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
  useCallback,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { toast } from '@/components/ui/sonner';
import { AuthCelebration } from '@/components/admin/AuthCelebration';
import type { Enums } from '@/integrations/supabase/types';
import {
  ADMIN_SESSION_STORAGE_KEY,
  POST_LOGIN_REDIRECT_KEY,
} from '@/integrations/supabase/constants';

const ADMIN_ROLE: Enums<'app_role'> = 'admin';
const HARD_RELOAD_TYPES: PerformanceNavigationTiming['type'][] = [
  'navigate',
  'back_forward',
];

const getNavigationType = ():
  | PerformanceNavigationTiming['type']
  | undefined => {
  if (
    typeof window === 'undefined' ||
    typeof window.performance === 'undefined'
  ) {
    return undefined;
  }
  const [entry] = window.performance.getEntriesByType(
    'navigation'
  ) as PerformanceNavigationTiming[];
  return entry?.type;
};

const clearPersistedSupabaseSession = () => {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    const projectRef = (
      import.meta.env.VITE_SUPABASE_PROJECT_ID ?? ''
    ).toString();
    const prefix = projectRef ? `sb-${projectRef}` : 'sb-';
    Object.keys(window.localStorage).forEach((key) => {
      if (key.startsWith(prefix) || key.includes('supabase.auth')) {
        window.localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Unable to clear persisted Supabase session cache', error);
  }
};

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
  const [authAnimation, setAuthAnimation] = useState<null | {
    type: 'login' | 'logout';
    message: string;
  }>(null);
  const pendingLogoutRef = useRef(false);
  const authAnimationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const navigate = useNavigate();
  const location = useLocation();
  const navigationTypeRef = useRef<
    PerformanceNavigationTiming['type'] | undefined
  >(getNavigationType());

  useEffect(() => {
    if (
      navigationTypeRef.current &&
      HARD_RELOAD_TYPES.includes(navigationTypeRef.current)
    ) {
      clearPersistedSupabaseSession();
    }
  }, []);

  const clearState = (options?: { keepLoading?: boolean }) => {
    setSession(null);
    setUserEmail(null);
    setIsAdmin(false);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    }
    if (!options?.keepLoading) {
      setIsLoading(false);
    }
  };

  const rememberIntendedRoute = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!location.pathname.startsWith('/admin')) {
      window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
      return;
    }
    if (location.pathname.startsWith('/admin/login')) {
      window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
      return;
    }
    const pathWithQuery = `${location.pathname}${location.search}`;
    window.sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, pathWithQuery);
  }, [location.pathname, location.search]);

  const consumeRedirectRoute = () => {
    if (typeof window === 'undefined') {
      return '/admin/dashboard';
    }
    const stored = window.sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
    if (stored) {
      window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
      return stored;
    }
    return '/admin/dashboard';
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

  const checkAdminStatus = async (userId: string | null): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', ADMIN_ROLE)
        .maybeSingle();

      if (error) {
        console.error('Admin role lookup failed', error);
        return false;
      }

      return !!data;
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
    const userId = newSession?.user?.id ?? null;
    const roleFromMetadata = (newSession?.user?.user_metadata?.role ?? '')
      .toString()
      .toLowerCase();
    let isAdminUser = roleFromMetadata === 'admin';

    if (typeof adminStatusOverride === 'boolean') {
      isAdminUser = adminStatusOverride;
    } else if (!isAdminUser) {
      isAdminUser = await checkAdminStatus(userId);
    }

    setSession(newSession);
    setUserEmail(email);
    setIsAdmin(isAdminUser);

    return isAdminUser;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        const isAdminUser = await updateAuthState(session);

        setIsLoading(false);

        if (isAdminUser) {
          // If an admin session exists and we're on the login route, forward to the intended/admin dashboard.
          const destination = consumeRedirectRoute();
          if (location.pathname.startsWith('/admin/login')) {
            navigate(destination, { replace: true });
          }
        } else if (!isAdminUser && !pendingLogoutRef.current) {
          rememberIntendedRoute();
          clearState();
          navigate('/admin/login', { replace: true });
        }
      } catch (error) {
        console.error('Failed to initialize admin auth', error);
        clearState();
        rememberIntendedRoute();
        navigate('/admin/login', { replace: true });
      }
    };

    initializeAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        try {
          const isAdminUser = await updateAuthState(newSession);
          setIsLoading(false);

          if (isAdminUser) {
            const destination = consumeRedirectRoute();
            if (location.pathname.startsWith('/admin/login')) {
              navigate(destination, { replace: true });
            }
          } else if (!isAdminUser && !pendingLogoutRef.current) {
            rememberIntendedRoute();
            clearState();
            navigate('/admin/login', { replace: true });
          }
        } catch (error) {
          console.error('Auth state listener failed', error);
          clearState();
          rememberIntendedRoute();
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
  }, [navigate, rememberIntendedRoute]);

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

      const signedInUserId = data.user?.id ?? null;
      const isAdminUser = await checkAdminStatus(signedInUserId);

      if (!isAdminUser) {
        await supabase.auth.signOut();
        throw new Error('Unauthorized: Not an admin account.');
      }

      await updateAuthState(data.session ?? null, true);
      toast.success('Logged in as admin.');
      triggerAuthAnimation('login');
      await delay(1200);
      const destination = consumeRedirectRoute();
      navigate(destination, { replace: true });
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

      clearPersistedSupabaseSession();
      clearState({ keepLoading: true });
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
      }
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
