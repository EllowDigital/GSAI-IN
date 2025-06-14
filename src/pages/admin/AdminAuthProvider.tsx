import React, { createContext, useEffect, useState, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "@/components/ui/sonner";

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

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Keep session in sync
  useEffect(() => {
    const { data: subs } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUserEmail(session?.user.email ?? null);
      setIsLoading(false);
      if (session?.user.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    // Get initial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUserEmail(session?.user.email ?? null);
      setIsAdmin(session?.user.email === ADMIN_EMAIL);
      setIsLoading(false);
    });
    return () => subs.subscription.unsubscribe();
  }, []);

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
  };

  // Logout
  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setSession(null);
    setUserEmail(null);
    toast.success("Logged out.");
  };

  return (
    <AdminAuthContext.Provider value={{ session, userEmail, isAdmin, isLoading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
