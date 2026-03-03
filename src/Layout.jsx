import React, { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
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

const PUBLIC_PAGES = ['Splash', 'Terms', 'Privacy', 'Onboarding', 'Premium'];

const LoadingFallback = () => (
  <div className="fixed inset-0 bg-[#0a0118] flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
  </div>
);

export default function Layout({ children, currentPageName }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [authError, setAuthError] = useState(false);

  const isPublicPage = PUBLIC_PAGES.includes(currentPageName);

  const bottomPadding = useMemo(() => 
    HIDDEN_TAB_PAGES.includes(currentPageName) ? 0 : `calc(${TAB_BAR_HEIGHT + 20}px + env(safe-area-inset-bottom))`,
    [currentPageName]
  );

  const checkAuth = useCallback(async () => {
    if (isPublicPage) {
      setIsAuthenticated(true);
      return;
    }
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        setIsAuthenticated(true);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        return;
      }
      base44.auth.redirectToLogin();
    } catch (e) {
      setAuthError(true);
    }
  }, [isPublicPage]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (authError) {
    return (
      <div className="fixed inset-0 bg-[#0a0118] flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-white mb-2">Connection Error</p>
          <p className="text-purple-200/50 text-sm mb-4">Please check your connection</p>
          <button 
            onClick={() => { setAuthError(false); checkAuth(); }}
            className="px-6 py-2 bg-purple-600 rounded-full text-white text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isAuthenticated === null) {
    return (
      <div className="fixed inset-0 bg-[#0a0118] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-purple-200/70">Loading your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
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