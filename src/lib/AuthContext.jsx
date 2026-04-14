/**
 * AuthContext.jsx
 *
 * Provides a React context + hook for Supabase authentication.
 * Replaces the old Base44 auth system entirely.
 *
 * Usage:
 *   const { user, session, isLoading, signOut, navigateToLogin } = useAuth();
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/api/base44Client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // ── Bootstrap: load initial session ──────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) setAuthError(error);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // ── Listen for auth state changes (sign in, sign out, token refresh) ──
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Helper actions ────────────────────────────────────────────────────────
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const navigateToLogin = () => {
    // Update this path to match your app's login route
    window.location.href = '/login';
  };

  // isAuthenticated: true / false (never null after loading)
  const isAuthenticated = !!session;
  const isLoadingAuth = isLoading;
  const isLoadingPublicSettings = false; // no longer needed

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated,
        isLoadingAuth,
        isLoading,
        isLoadingPublicSettings,
        authError,
        signOut,
        navigateToLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
