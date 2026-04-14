import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/api/base44Client';
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
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
          setUser(profile || authUser);
        }
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
    const checkCheckout = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');
      if (params.get('checkout') === 'success' || sessionId) {
        if (sessionId) {
          try {
            await supabase.functions.invoke('verify-session', { body: { session_id: sessionId } });
            await loadUser();
          } catch (e) {
            console.error('Session verify error:', e);
          }
        }
        setShowCheckoutSuccess(true);
        window.history.replaceState({}, '', window.location.pathname);
        setTimeout(() => setShowCheckoutSuccess(false), 4000);
        window.dispatchEvent(new Event('features-updated'));
      }
    };
    checkCheckout();

    return () => clearInterval(timer);
  }, []);

  const firstName = useMemo(() => user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Seeker', [user]);

  const handleRefresh = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        setUser(profile || authUser);
      }
    } catch (e) {}
    window.dispatchEvent(new Event('features-updated'));
  }, []);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      {/* Checkout Success Banner */}
      {showCheckoutSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-4 right-4 z-50 bg-green-500/20 border border-green-500/40 rounded-2xl p-4 flex items-center gap-3"
        >
          <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-white font-semibold">Welcome to Premium!</p>
            <p className="text-green-200/70 text-sm">Your subscription is now active. Enjoy all features!</p>
          </div>
        </motion.div>
      )}

      {/* Lightweight CSS-only particles */}
      <CosmicBackground />

      <div className="min-h-screen bg-[#0a0118] text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-12 pb-4">
          {/* Left - Logo + Profile */}
          <div className="flex items-center gap-3">
            {user?.profile_picture && (
              <img src={user.profile_picture} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
            )}
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>

          {/* Right - Time, Settings, Moon */}
          <div className="flex items-center gap-3">
            <span className="text-purple-300/70 text-sm">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <Link to={createPageUrl('Settings')}>
              <Moon className="w-5 h-5 text-purple-400" />
            </Link>
          </div>
        </div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-4"
        >
          <p className="text-purple-300/70 text-sm">{greeting}</p>
          <h1 className="text-3xl font-bold text-white">{firstName}</h1>
          <p className="text-purple-200/50 text-sm mt-1">Transform your reality by transforming yourself</p>
        </motion.div>

        {/* Daily Affirmation Widget */}
        <DailyAffirmationWidget />

        {/* Carousel */}
        <FeatureCarousel />

        {/* Bottom hint */}
        <div className="px-4 pb-8 text-center">
          <p className="text-purple-200/30 text-xs">Swipe up to explore your tools</p>
        </div>

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
      </div>
    </PullToRefresh>
  );
}
