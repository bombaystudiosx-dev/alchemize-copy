import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Apple } from 'lucide-react';
import { isDevMode } from '@/components/subscription/subscriptionHelper';
import { base44 } from '@/api/base44Client';

export default function Splash() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
    window.dispatchEvent(new Event('language-changed'));
  }, [language]);

  const getNextUrl = () => {
    const onboarded = localStorage.getItem('onboarding_complete');
    const skipped = localStorage.getItem('skipped_premium');
    if (isDevMode() || (onboarded && skipped)) return createPageUrl('Home');
    if (onboarded) return createPageUrl('Premium');
    return createPageUrl('Onboarding');
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider('google', getNextUrl());
  };

  const handleApple = () => {
    base44.auth.loginWithProvider('apple', getNextUrl());
  };

  const unlockSelf = language === 'es' ? 'Desbloquea Tu Mejor Versión' : 'Unlock Your Highest Self';

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/93e342e0e_ChatGPTImageFeb21202605_00_36PM1.png)'
        }}
      />
      
      {/* Language Toggle - Top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5"
      >
        <button
          onClick={() => setLanguage('en')}
          className={`text-xs font-medium px-2 py-1 rounded ${language === 'en' ? 'text-white bg-purple-600' : 'text-white/50'}`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('es')}
          className={`text-xs font-medium px-2 py-1 rounded ${language === 'es' ? 'text-white bg-purple-600' : 'text-white/50'}`}
        >
          ES
        </button>
      </motion.div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-end px-6 pt-16 pb-12">
        
        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-lg md:text-xl mb-8 tracking-wide text-center font-semibold"
          style={{
            background: 'linear-gradient(135deg, #ffd700, #a855f7, #ffd700)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 40px rgba(168, 85, 247, 0.8))',
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: 'italic'
          }}
        >
          {unlockSelf}
        </motion.p>

        {/* Auth Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
          className="relative w-full max-w-xs mt-4"
        >
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-amber-500 to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse" />

          {/* Box Content */}
          <div className="relative bg-black/60 backdrop-blur-md rounded-xl p-6 border border-white/10 space-y-3">

            {/* Google Button */}
            <motion.button
              onClick={handleGoogle}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-5 bg-white rounded-xl flex items-center justify-center gap-3 text-gray-800 font-semibold text-sm shadow-md hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </motion.button>

            {/* Apple Button */}
            <motion.button
              onClick={handleApple}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-5 bg-black border border-white/20 rounded-xl flex items-center justify-center gap-3 text-white font-semibold text-sm shadow-md hover:bg-gray-900 transition-colors"
            >
              <Apple className="w-5 h-5 flex-shrink-0" />
              Sign in with Apple
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-white/15" />
              <span className="text-white/30 text-xs">or</span>
              <div className="flex-1 h-px bg-white/15" />
            </div>

            {/* Email/Password Form */}
            {!showEmailForm ? (
              <motion.button
                onClick={() => setShowEmailForm(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-5 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center gap-3 text-white font-semibold text-sm hover:bg-white/15 transition-colors"
              >
                Continue with Email
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full py-2.5 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/40 outline-none focus:border-purple-500"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full py-2.5 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/40 outline-none focus:border-purple-500"
                />
                {emailError && <p className="text-red-400 text-xs px-1">{emailError}</p>}
                <div className="flex gap-2">
                  <motion.button
                    onClick={handleEmailLogin}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-semibold text-sm transition-colors"
                  >
                    Sign In
                  </motion.button>
                  <motion.button
                    onClick={handleEmailSignup}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-2.5 bg-white/10 border border-white/20 hover:bg-white/15 rounded-xl text-white font-semibold text-sm transition-colors"
                  >
                    Sign Up
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Terms */}
            <div className="flex items-center justify-center gap-3 text-xs text-white/40 pt-1">
              <Link to={createPageUrl('Terms')} className="hover:text-white/70 transition-colors">Terms</Link>
              <span>•</span>
              <Link to={createPageUrl('Privacy')} className="hover:text-white/70 transition-colors">Privacy</Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent z-10"
      />
    </div>
  );
}