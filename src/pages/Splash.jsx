import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/components/supabaseClient';

export default function Splash() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => localStorage.getItem('app_language') || 'en');
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  const getNextUrl = useCallback(() => {
    const onboarded = localStorage.getItem('onboarding_complete');
    if (onboarded) return createPageUrl('Home');
    return createPageUrl('Onboarding');
  }, []);

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  useEffect(() => {
    let mounted = true;
    base44.auth.isAuthenticated()
      .then(authed => {
        if (!mounted) return;
        if (authed) {
          navigate(getNextUrl());
        } else {
          setCheckingSession(false);
        }
      })
      .catch(() => mounted && setCheckingSession(false));
    return () => { mounted = false; };
  }, [navigate, getNextUrl]);

  const handleApple = () => {
    setAppleLoading(true);
    setError('');
    try {
      base44.auth.loginWithProvider('apple', getNextUrl());
    } catch (err) {
      setError('Sign in with Apple failed. Please try again.');
      setAppleLoading(false);
    }
  };

  const unlockSelf = language === 'es' ? 'Desbloquea Tu Mejor Versión' : 'Unlock Your Highest Self';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0118]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://gtryzyzcjewvfclhiynt.supabase.co/storage/v1/object/public/base44-app-assets/Alchemize/Splash/bg.png)',
          transform: 'translateZ(0)',
        }}
      />

      {checkingSession && (
        <div className="absolute inset-0 z-50 bg-[#0a0118] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: checkingSession ? 0 : 1 }}
        className="relative z-10 flex min-h-screen flex-col px-6 py-8"
      >
        {/* Language Selector */}
        <div className="flex justify-end">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur-sm"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>

        {/* Hero Section */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent"
          >
            Alchemize
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-12 text-xl text-purple-200/90"
          >
            {unlockSelf}
          </motion.p>

          {/* Apple Sign-In Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full max-w-sm space-y-4"
          >
            <button
              onClick={handleApple}
              disabled={appleLoading}
              className="group relative w-full overflow-hidden rounded-xl bg-black px-6 py-4 text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {appleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                )}
                <span className="font-semibold">
                  {language === 'es' ? 'Continuar con Apple' : 'Continue with Apple'}
                </span>
              </div>
            </button>

            {error && (
              <p className="text-center text-sm text-red-400">{error}</p>
            )}
          </motion.div>
        </div>

        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-col items-center gap-4 text-sm text-purple-300/70"
        >
          <div className="flex gap-6">
            <Link to={createPageUrl('Terms')} className="hover:text-purple-200">
              {language === 'es' ? 'Términos' : 'Terms'}
            </Link>
            <Link to={createPageUrl('Privacy')} className="hover:text-purple-200">
              {language === 'es' ? 'Privacidad' : 'Privacy'}
            </Link>
          </div>
          <p className="text-xs">
            {language === 'es' ? '© 2026 Alchemize. Todos los derechos reservados.' : '© 2026 Alchemize. All rights reserved.'}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}