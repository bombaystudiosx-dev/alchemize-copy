import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Mail, Eye, EyeOff, Loader2 } from 'lucide-react';


import { base44 } from '@/api/base44Client';
import { supabase } from '@/components/supabaseClient';

export default function Splash() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => localStorage.getItem('app_language') || 'en');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    localStorage.setItem('app_language', language);
    window.dispatchEvent(new Event('language-changed'));
  }, [language]);

  // Auto-redirect if already authenticated
  useEffect(() => {
    (async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (authed) {
          navigate(getNextUrl());
          return;
        }
      } catch {}
      setCheckingSession(false);
    })();
  }, []);

  const getNextUrl = () => {
    const onboarded = localStorage.getItem('onboarding_complete');
    const skipped = localStorage.getItem('skipped_premium');
    if (onboarded && skipped) return createPageUrl('Home');
    if (onboarded) return createPageUrl('Premium');
    return createPageUrl('Onboarding');
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider('google', getNextUrl());
  };

  const handleApple = () => {
    base44.auth.loginWithProvider('apple', getNextUrl());
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setSuccessMsg('Account created! Welcome to Alchemize!');
        } else {
          navigate(getNextUrl());
        }
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
      } else {
        if (!rememberMe) {
          localStorage.setItem('supabase_no_persist', 'true');
        } else {
          localStorage.removeItem('supabase_no_persist');
        }
        navigate(getNextUrl());
      }
    }

    setLoading(false);
  };

  const unlockSelf = language === 'es' ? 'Desbloquea Tu Mejor Versión' : 'Unlock Your Highest Self';

  if (checkingSession) {
    return (
      <div className="fixed inset-0 bg-[#0a0118] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0118]">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/93e342e0e_ChatGPTImageFeb21202605_00_36PM1.png)'
        }}
      />

      {/* Language Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5"
      >
        <button
          onClick={() => setLanguage('en')}
          className={`text-xs font-medium px-2 py-1 rounded ${language === 'en' ? 'text-white bg-purple-600' : 'text-white/50'}`}
        >EN</button>
        <button
          onClick={() => setLanguage('es')}
          className={`text-xs font-medium px-2 py-1 rounded ${language === 'es' ? 'text-white bg-purple-600' : 'text-white/50'}`}
        >ES</button>
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
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-amber-500 to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse" />

          <div className="relative bg-black/60 backdrop-blur-md rounded-xl p-6 border border-white/10 space-y-3">

            {/* Email toggle / form */}
            {/* Social Login */}
            <button
              onClick={handleGoogle}
              className="w-full py-3 px-5 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center gap-3 text-white font-semibold text-sm hover:bg-white/20 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>

            <button
              onClick={handleApple}
              className="w-full py-3 px-5 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center gap-3 text-white font-semibold text-sm hover:bg-white/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-2.13 4.41-3.74 4.25z"/></svg>
              Continue with Apple
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-xs">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <AnimatePresence mode="wait">
              {!showEmailForm ? (
                <motion.button
                  key="email-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowEmailForm(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-5 bg-purple-600/30 border border-purple-500/40 rounded-xl flex items-center justify-center gap-3 text-white font-semibold text-sm hover:bg-purple-600/50 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Continue with Email
                </motion.button>
              ) : (
                <motion.form
                  key="email-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onSubmit={handleEmailAuth}
                  className="space-y-3"
                >
                  {/* Sign In / Sign Up Toggle Tabs */}
                  <div className="flex bg-white/10 rounded-lg p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => { setIsSignUp(false); setError(''); setSuccessMsg(''); }}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${!isSignUp ? 'bg-purple-600 text-white shadow' : 'text-white/50 hover:text-white/80'}`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsSignUp(true); setError(''); setSuccessMsg(''); }}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${isSignUp ? 'bg-purple-600 text-white shadow' : 'text-white/50 hover:text-white/80'}`}
                    >
                      Sign Up
                    </button>
                  </div>

                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-purple-500"
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-purple-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Remember Me */}
                  {!isSignUp && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="w-4 h-4 accent-purple-500 rounded"
                      />
                      <span className="text-white/60 text-xs">Remember me</span>
                    </label>
                  )}

                  {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                  {successMsg && <p className="text-green-400 text-xs text-center">{successMsg}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </button>

                  <div className="flex items-center justify-center text-xs">
                    <button
                      type="button"
                      onClick={() => { setShowEmailForm(false); setError(''); setSuccessMsg(''); }}
                      className="text-white/30 hover:text-white/60"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Terms */}
            <div className="flex items-center justify-center gap-3 text-xs text-white/40 pt-1">
              <Link to={createPageUrl('Terms')} className="hover:text-white/70 transition-colors">Terms</Link>
              <span>•</span>
              <Link to={createPageUrl('Privacy')} className="hover:text-white/70 transition-colors">Privacy</Link>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent z-10"
      />
    </div>
  );
}