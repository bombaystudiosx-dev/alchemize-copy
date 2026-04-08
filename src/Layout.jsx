import React, { useEffect, useState, useCallback, useMemo, Suspense, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/components/supabaseClient';
import { Loader2 } from 'lucide-react';
import PWASetup from '@/components/pwa/PWASetup';
import InstallPrompt from '@/components/pwa/InstallPrompt';
import BottomTabBar, { TAB_BAR_HEIGHT, HIDDEN_TAB_PAGES } from '@/components/navigation/BottomTabBar';
import NativeFeelProvider from '@/components/native/NativeFeelProvider';
import PageTransition from '@/components/native/PageTransition';
import { AppToastProvider } from '@/components/common/AppToast';
import ErrorBoundary from '@/components/common/ErrorBoundary';

const PUBLIC_PAGES = ['Splash', 'Terms', 'Privacy', 'Onboarding'];

const LoadingFallback = () => (
  <div className="fixed inset-0 bg-[#0a0118] flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
  </div>
);

// Full-screen auth gate shown while resolving session
const AuthLoadingGate = () => (
  <div className="fixed inset-0 bg-[#0a0118] flex flex-col items-center justify-center" style={{ zIndex: 9999 }}>
    <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
    <p className="text-purple-200/70 text-sm">Loading your journey...</p>
  </div>
);

export default function Layout({ children, currentPageName }) {
  // null = still resolving, true = authenticated, false = not authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [authError, setAuthError] = useState(false);
  // authKey forces a full remount of the app shell after login (fixes stale layout bug)
  const [authKey, setAuthKey] = useState(0);
  const prevAuthState = useRef(null);

  const isPublicPage = PUBLIC_PAGES.includes(currentPageName);

  const bottomPadding = useMemo(() =>
    HIDDEN_TAB_PAGES.includes(currentPageName) ? 0 : `calc(${TAB_BAR_HEIGHT + 20}px + env(safe-area-inset-bottom))`
  , [currentPageName]);

  const checkAuth = useCallback(async () => {
    if (isPublicPage) {
      setIsAuthenticated(true);
      return;
    }
    try {
      // Primary: check base44 auth
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        // If we just transitioned from unauthenticated -> authenticated, force remount
        if (prevAuthState.current === false) {
          setAuthKey(k => k + 1);
        }
        prevAuthState.current = true;
        setIsAuthenticated(true);
        setAuthError(false);
        return;
      }
      // Fallback: check supabase session directly
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (prevAuthState.current === false) {
          setAuthKey(k => k + 1);
        }
        prevAuthState.current = true;
        setIsAuthenticated(true);
        setAuthError(false);
        return;
      }
      prevAuthState.current = false;
      setIsAuthenticated(false);
      base44.auth.redirectToLogin();
    } catch (e) {
      setAuthError(true);
      setIsAuthenticated(false);
    }
  }, [isPublicPage]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Listen for supabase auth state changes to catch Apple Sign-In callback
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Force full remount of app shell to eliminate stale layout
        if (prevAuthState.current !== true) {
          prevAuthState.current = true;
          setAuthKey(k => k + 1);
          setIsAuthenticated(true);
          setAuthError(false);
        }
      } else if (event === 'SIGNED_OUT') {
        prevAuthState.current = false;
        setIsAuthenticated(false);
        setAuthKey(0);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Phase 1: Still resolving auth - show full-screen gate, render NOTHING else
  if (isAuthenticated === null) {
    return <AuthLoadingGate />;
  }

  // Phase 2: Auth error state
  if (authError) {
    return (
      <div className="fixed inset-0 bg-[#0a0118] flex flex-col items-center justify-center p-6">
        <p className="text-red-400 text-center text-sm mb-4">Unable to verify your session. Please try again.</p>
        <button
          onClick={() => { setAuthError(false); setIsAuthenticated(null); checkAuth(); }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    // authKey forces complete remount of app shell after Sign in with Apple
    <ErrorBoundary key={authKey}>
      <AppToastProvider>
        <NativeFeelProvider />
        <PWASetup />
        <InstallPrompt />
        <Suspense fallback={<LoadingFallback />}>
          <div
            className="min-h-screen"
            style={{
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: bottomPadding,
              background: '#0a0118',
              willChange: 'contents',
            }}
          >
            <PageTransition pageKey={currentPageName}>
              {children}
            </PageTransition>
          </div>
        </Suspense>
        <BottomTabBar currentPageName={currentPageName} />
      </AppToastProvider>
    </ErrorBoundary>
  );
}