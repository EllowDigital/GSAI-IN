import React, { createContext, useEffect, useState, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

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

const ADMIN_EMAIL = "ghatakgsai@gmail.com";

function AdminAuthProviderInner({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for changes in auth state (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUserEmail(newSession?.user?.email ?? null);
      setIsAdmin(newSession?.user?.email === ADMIN_EMAIL);
      setIsLoading(false);

      // Only redirect in needed scenarios (no full reload)
      if (
        !_event.startsWith("INITIAL") &&
        (!newSession || newSession?.user?.email !== ADMIN_EMAIL)
      ) {
        navigate("/admin/login", { replace: true });
      }

      console.log("[Supabase Auth Change]", _event, newSession);
    });

    // On mount, check for persisted session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUserEmail(session?.user?.email ?? null);
      setIsAdmin(session?.user?.email === ADMIN_EMAIL);
      setIsLoading(false);
      // If not admin, redirect to login page with routing (not refresh)
      if (!session?.user || session.user.email !== ADMIN_EMAIL) {
        navigate("/admin/login", { replace: true });
      }
      console.log("[Supabase Session Init]", session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Sign in as admin only
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error("Login failed: " + error.message);
      setIsLoading(false);
      return;
    }
    if (data.user.email !== ADMIN_EMAIL) {
      toast.error("Only the designated admin account can access the dashboard.");
      await supabase.auth.signOut();
      setIsAdmin(false);
      setSession(null);
      setUserEmail(null);
      setIsLoading(false);
      return;
    }
    toast.success("Logged in as admin.");
    setIsAdmin(true);
    setSession(data.session ?? null);
    setUserEmail(data.user.email);
    setIsLoading(false);
    console.log("[Admin SignIn] session/user", data.session, data.user);
    // Redirect to dashboard on successful login
    navigate("/admin/dashboard", { replace: true });
  };

  // Logout with redirect to home ("/"), use react-router navigation
  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setSession(null);
    setUserEmail(null);

    toast.success("Logged out.");
    console.log("[Admin SignOut]");
    // Redirect to homepage after logout
    navigate("/", { replace: true });
  };

  return (
    <AdminAuthContext.Provider value={{ session, userEmail, isAdmin, isLoading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// Provide the navigation context by wrapping in a component
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  return <AdminAuthProviderInner>{children}</AdminAuthProviderInner>;
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
