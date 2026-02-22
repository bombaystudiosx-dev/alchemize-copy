import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Apple, Check } from 'lucide-react';
import { isDevMode } from '@/components/subscription/subscriptionHelper';

export default function Splash() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_language') || 'en';
  });
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    localStorage.setItem('app_language', language);
    window.dispatchEvent(new Event('language-changed'));
  }, [language]);

  const handleSignIn = () => {
    if (rememberMe) {
      localStorage.setItem('remember_me', 'true');
    }
    // Auth is handled by Layout - redirectToLogin.
    // After login, user lands on Home. We check onboarding there via useEffect.
    const onboarded = localStorage.getItem('onboarding_complete');
    const skipped = localStorage.getItem('skipped_premium');
    if (isDevMode() || (onboarded && skipped)) {
      window.location.href = createPageUrl('Home');
    } else if (onboarded) {
      window.location.href = createPageUrl('Premium');
    } else {
      window.location.href = createPageUrl('Onboarding');
    }
  };

  const text = {
    en: {
      signIn: 'Sign In',
      continueWith: 'Or continue with',
      rememberMe: 'Remember me',
      unlockSelf: 'Unlock Your Highest Self'
    },
    es: {
      signIn: 'Iniciar Sesión',
      continueWith: 'O continuar con',
      rememberMe: 'Recuérdame',
      unlockSelf: 'Desbloquea Tu Mejor Versión'
    }
  };

  const t = text[language];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/ce90c0d9f_B28AA351-FB07-478A-8B1E-FB90E998F0B7.png)'
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

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-16 pb-32">
        
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
            textShadow: '0 0 30px rgba(255, 215, 0, 0.8), 0 0 50px rgba(168, 85, 247, 0.6)',
            filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 40px rgba(168, 85, 247, 0.8))',
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: 'italic'
          }}
        >
          {t.unlockSelf}
        </motion.p>

        {/* Sign In Box with Glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
          className="relative w-full max-w-xs"
        >
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-amber-500 to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse" />
          
          {/* Box Content */}
          <div className="relative bg-black/60 backdrop-blur-md rounded-xl p-6 border border-white/10">
            
            {/* Main Sign In Button */}
            <motion.button
              onClick={handleSignIn}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg text-white font-semibold text-lg shadow-lg shadow-purple-500/30 transition-all mb-4"
            >
              {t.signIn}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-white/50 text-xs">{t.continueWith}</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            {/* Social Sign In Buttons */}
            <div className="flex gap-3 mb-4">
              <motion.button
                onClick={handleSignIn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-2.5 px-4 bg-white rounded-lg flex items-center justify-center gap-2 text-black font-medium hover:bg-gray-100 transition-colors"
              >
                <Apple className="w-5 h-5" />
                <span className="text-sm">Apple</span>
              </motion.button>
              
              <motion.button
                onClick={handleSignIn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-2.5 px-4 bg-white rounded-lg flex items-center justify-center gap-2 text-black font-medium hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm">Google</span>
              </motion.button>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2 cursor-pointer mb-4">
              <div 
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  rememberMe ? 'bg-purple-600 border-purple-600' : 'border-white/30'
                }`}
              >
                {rememberMe && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-white/70 text-sm">
                {t.rememberMe}
              </span>
            </label>

            {/* Terms and Privacy Links */}
            <div className="flex items-center justify-center gap-3 text-xs text-white/50">
              <Link to={createPageUrl('Terms')} className="hover:text-white/80 transition-colors">
                Terms
              </Link>
              <span>•</span>
              <Link to={createPageUrl('Privacy')} className="hover:text-white/80 transition-colors">
                Privacy
              </Link>
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