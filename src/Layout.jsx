import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { SoundscapeProvider } from '@/components/audio/SoundscapeContext';
import SoundscapePanel from '@/components/audio/SoundscapePanel';
import { Loader2 } from 'lucide-react';

export default function Layout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        base44.auth.redirectToLogin();
      } else {
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, []);

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
    <SoundscapeProvider>
      <div className="min-h-screen">
        {children}
        <SoundscapePanel />
      </div>
    </SoundscapeProvider>
  );
}