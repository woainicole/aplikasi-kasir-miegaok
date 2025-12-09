// providers/AuthContext.tsx
import type { Session } from "@supabase/supabase-js";
import { router, useSegments } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase-client";

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, fullName: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: any) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const segments = useSegments(); 

  // Ambil session saat pertama kali load
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession ?? null);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  // Redirect otomatis berdasarkan session
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/login");
    }

    if (session && inAuthGroup) {
      router.replace("/");
    }
  }, [session, loading, segments]);

  // ============================
  // AUTH FUNCTIONS
  // ============================

  const login = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signup = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return { error };

    if (data.user) {
      await supabase.from("users_profile").insert({
        id: data.user.id,
        full_name: fullName,
      });
    }

    return { data };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider
      value={{ session, loading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
