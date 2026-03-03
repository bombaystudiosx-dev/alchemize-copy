import React, { useState, useEffect, useCallback } from 'react';
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

  const getNextUrl = useCallback(() => {
    const onboarded = localStorage.getItem('onboarding_complete');
    const skipped = localStorage.getItem('skipped_premium');
    if (onboarded && skipped) return createPageUrl('Home');
    if (onboarded) return createPageUrl('Premium');
    return createPageUrl('Onboarding');
  }, []);

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  // Fast auth check - no await chain
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0118]">
      {/* Background Image - preload */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699b885148fb20799f795d54/3c0c9d3d3_IMG_2647.png)',
          transform: 'translateZ(0)',
        }}
      />

      {/* Loading overlay */}
      {checkingSession && (
        <div className="absolute inset-0 z-50 bg-[#0a0118] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      )}

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

            {/* Apple Sign In */}
            <button
              onClick={handleApple}
              className="w-full py-3 px-5 bg-white rounded-xl flex items-center justify-center gap-3 text-black font-semibold text-sm hover:bg-white/90 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Sign in with Apple
            </button>

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