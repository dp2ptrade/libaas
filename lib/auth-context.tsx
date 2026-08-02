'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

type AuthContextType = {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  signIn: async () => ({ error: 'Not initialized' }),
  signUp: async () => ({ error: 'Not initialized' }),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data as Profile | null);
  }, []);

  useEffect(() => {
    let mounted = true;

    // Initialize from stored session on mount
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session?.user) {
        userIdRef.current = session.user.id;
        setUser({ id: session.user.id, email: session.user.email || '' });
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    init();

    // Listen for auth state changes.
    // CRITICAL: do NOT call any supabase.auth.* methods inside this callback
    // — it causes a deadlock that prevents signOut from clearing the session.
    // All async work (fetchProfile) is fired without awaiting.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session) {
        userIdRef.current = null;
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        userIdRef.current = session.user.id;
        setUser({ id: session.user.id, email: session.user.email || '' });
        fetchProfile(session.user.id);
        setLoading(false);
      }
    });

    // Refresh profile when the page regains focus — picks up DB-side
    // changes like role updates made from the database console.
    const onFocus = () => {
      if (mounted && userIdRef.current) fetchProfile(userIdRef.current);
    };
    window.addEventListener('focus', onFocus);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message };

    // The database trigger should create the profile, but if it fails
    // (race condition, trigger error), we create it directly as a fallback.
    if (data.user) {
      await supabase.from('profiles').upsert(
        { id: data.user.id, full_name: fullName },
        { onConflict: 'id' }
      );
    }
    return { error: null };
  };

  const signOut = async () => {
    // Use global scope to sign out across all browser tabs
    await supabase.auth.signOut({ scope: 'global' });
    // Immediately clear local state — don't wait for onAuthStateChange
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user?.id) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin: profile?.role === 'admin',
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
