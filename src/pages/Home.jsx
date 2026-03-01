import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import FeatureCarousel from '@/components/carousel/FeatureCarousel';
import FeatureManager from '@/components/home/FeatureManager';
import DailyAffirmationWidget from '@/components/home/DailyAffirmationWidget';
import PullToRefresh from '@/components/common/PullToRefresh';
import { Moon, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Home() {
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState('Welcome');
  const [showFeatureManager, setShowFeatureManager] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);

  // Removed heavy JS particles — using CSS-only sparkles instead

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        // User not logged in - handled by layout
      }
    };
    loadUser();

    // Set time-based greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Check for checkout success
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      setShowCheckoutSuccess(true);
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setShowCheckoutSuccess(false), 4000);
    }

    return () => clearInterval(timer);
    }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'Seeker';

  const handleRefresh = useCallback(async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {}
    window.dispatchEvent(new Event('features-updated'));
  }, []);

  return (
    <CosmicBackground>
      {/* Checkout Success Banner */}
      <AnimatePresence>
        {showCheckoutSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-4 left-4 right-4 z-50 bg-green-500/90 backdrop-blur-md rounded-2xl px-5 py-4 flex items-center gap-3 shadow-lg shadow-green-500/30"
          >
            <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0" />
            <div>
              <p className="text-white font-bold text-sm">Welcome to Premium!</p>
              <p className="text-white/80 text-xs">Your subscription is now active. Enjoy all features!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PullToRefresh onRefresh={handleRefresh} className="min-h-screen flex flex-col">
        {/* Lightweight CSS-only particles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-float-slow" style={{ left: '15%', top: '20%' }} />
          <div className="absolute w-1 h-1 bg-purple-400/20 rounded-full animate-float-slow" style={{ left: '75%', top: '35%', animationDelay: '1s' }} />
          <div className="absolute w-1 h-1 bg-purple-400/25 rounded-full animate-float-slow" style={{ left: '45%', top: '60%', animationDelay: '2s' }} />
        </div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-6 py-4 relative z-10"
        >
          {/* Left - Logo + Profile */}
          <div className="flex items-center gap-3">
            <motion.img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/de839f697_9EA146BA-906E-4508-B4D9-35794A087FAF.png" 
              alt="Alchemize"
              className="h-10 object-contain"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            {user?.profile_picture && (
              <Link to={createPageUrl('Profile')}>
                <img 
                  src={user.profile_picture} 
                  alt="" 
                  className="w-8 h-8 rounded-full object-cover border-2 border-purple-500/50"
                />
              </Link>
            )}
          </div>

          {/* Right - Time, Settings, Moon */}
          <div className="flex items-center gap-3">
            <span 
              className="text-white/90 text-lg tracking-wider"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>



            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                filter: ['drop-shadow(0 0 8px rgba(168, 85, 247, 0.3))', 'drop-shadow(0 0 16px rgba(168, 85, 247, 0.6))', 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.3))']
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Moon className="w-5 h-5 text-purple-300" />
            </motion.div>
          </div>
        </motion.header>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center px-6 pt-4 relative z-10"
        >
          <motion.div 
            className="flex items-center justify-center gap-2 mb-2"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span 
              className="text-sm uppercase tracking-widest"
              style={{
                background: 'linear-gradient(135deg, #ffd700, #a855f7, #ffd700)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.7)) drop-shadow(0 0 20px rgba(255, 215, 0, 0.5))',
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic'
              }}
            >{greeting}</span>
            <Sparkles className="w-5 h-5 text-purple-400" />
          </motion.div>
          <h1 
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ 
              fontFamily: 'Georgia, serif', 
              letterSpacing: '0.05em',
              background: 'linear-gradient(135deg, #ffd700, #a855f7, #ffd700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(255, 215, 0, 0.8), 0 0 50px rgba(168, 85, 247, 0.6)',
              filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 40px rgba(168, 85, 247, 0.8))'
            }}
          >
            {firstName}
          </h1>
          <p 
            className="text-xl md:text-2xl font-semibold"
            style={{
              background: 'linear-gradient(135deg, #ffd700, #a855f7, #ffd700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 8px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8)',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.9)) drop-shadow(0 0 24px rgba(168, 85, 247, 0.6))',
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic',
              letterSpacing: '0.02em'
            }}
          >
            Transform your reality by transforming yourself
          </p>
        </motion.div>

        {/* Daily Affirmation Widget */}
        <DailyAffirmationWidget />

        {/* Carousel */}
        <div className="flex-1 flex items-center">
          <FeatureCarousel />
        </div>

        {/* Bottom hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pb-4 relative z-10"
        >
          <motion.div 
            className="flex items-center justify-center gap-2 text-white/40 text-sm"
            animate={{ x: [-3, 3, -3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span>←</span>
            <span>Swipe to navigate</span>
            <span>→</span>
          </motion.div>
        </motion.div>
      </PullToRefresh>

      {/* Feature Manager */}
      <FeatureManager 
        open={showFeatureManager} 
        onOpenChange={(open) => {
          setShowFeatureManager(open);
          if (!open) {
            window.dispatchEvent(new Event('features-updated'));
          }
        }} 
      />
    </CosmicBackground>
  );
}