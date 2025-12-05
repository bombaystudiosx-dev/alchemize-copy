import React, { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import PWASetup from '@/components/pwa/PWASetup';
import InstallPrompt from '@/components/pwa/InstallPrompt';

export default function Layout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [authError, setAuthError] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        base44.auth.redirectToLogin();
      } else {
        setIsAuthenticated(true);
      }
    } catch (e) {
      setAuthError(true);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#1a0a2e] to-[#0d0620] flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#1a0a2e] to-[#0d0620] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-purple-200/70">Loading your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PWASetup />
      <InstallPrompt />
      <div className="min-h-screen">
        {children}
      </div>
    </>
  );
}