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
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699b885148fb20799f795d54/3c0c9d3d3_IMG_2647.png)',
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
        transition={{ duration: 0.2 }}
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
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: checkingSession ? 0 : 1 }}
          transition={{ duration: 0.25 }}
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

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: checkingSession ? 0 : 1, scale: checkingSession ? 0.95 : 1 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-xs mt-4"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-amber-500 to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse" />

          <div className="relative bg-black/60 backdrop-blur-md rounded-xl p-6 border border-white/10 space-y-3">
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

            <button
              onClick={handleGoogle}
              className="w-full py-3 px-5 bg-white rounded-xl flex items-center justify-center gap-3 text-black font-semibold text-sm hover:bg-white/90 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>

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