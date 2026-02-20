import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
  Sparkles, Heart, Target, CheckSquare, DollarSign, 
  Dumbbell, Apple, Calendar, Settings, Scroll, BookOpen
} from 'lucide-react';
import { isFeatureLocked } from '@/components/subscription/subscriptionHelper';
import LockedFeatureOverlay from '@/components/subscription/LockedFeatureOverlay';

const features = [
  { id: 'manifestation', title: 'Manifestation Board', description: 'Visualize/feel your dreams until your reality becomes a reflection', icon: Sparkles, route: 'ManifestationBoard', gradient: 'from-violet-600 to-purple-600', image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/76aebc03e_3980621C-E6F5-4042-A813-8669BB08CC22.png' },
  { id: 'affirmations', title: 'Affirmations', description: 'Reprogram your subconscious mind with powerful affirmations', icon: Heart, route: 'Affirmations', gradient: 'from-pink-600 to-rose-600', image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/eb741e2f8_08E90FB0-1A9C-44F9-9BDB-FBDD45607671.png' },
  { id: 'goals', title: 'Set Goals', description: 'Be intentional and strategic with your life', icon: Target, route: 'Goals', gradient: 'from-amber-500 to-orange-600', image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/9f245f835_Photoshop12.jpg' },
  { id: 'habits', title: 'Habit Tracker', description: 'Condition yourself for greatness', icon: CheckSquare, route: 'Habits', gradient: 'from-emerald-500 to-teal-600', image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/7a35f50d7_PhotoShop4.jpg' },
  { id: 'finance', title: 'Financial Tracker', description: 'Organize Finances', icon: DollarSign, route: 'Finance', gradient: 'from-green-500 to-emerald-600', image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/d97e23f78_D461046E-F45A-4970-87FD-7AB31B05DB2E.png' },
  { id: 'fitness', title: 'Fitness Tracker', description: 'Transform your body and energy', icon: Dumbbell, route: 'Fitness', gradient: 'from-red-500 to-orange-600', image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/54559d13c_Photoshop5.jpg' },
  { id: 'calories', title: 'Calorie Tracker', description: 'AI food recognition, macros & meal planning', icon: Apple, route: 'CalorieTracker', gradient: 'from-green-500 to-emerald-600', image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/d84f1a2a1_1EE9F255-09A4-47B5-B9E3-49A5928D4EDD.png' },
  { id: 'appointments', title: 'Appointments', description: 'Organize your time with intention', icon: Calendar, route: 'Appointments', gradient: 'from-blue-500 to-indigo-600', image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/67a5278b0_Photoshop12.jpg' },
  { id: 'todo', title: 'To-Do List', description: 'Shape your day, one small win at a time.', icon: Scroll, route: 'TodoList', gradient: 'from-amber-500 to-yellow-600', image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/b794538fb_DB31821F-BEE3-4395-8386-4993A465E77E.png' },
  { id: 'gratitude', title: 'Gratitude Journal', description: 'Gratitude is the ability to experience life as a gift.', icon: BookOpen, route: 'Journal', gradient: 'from-purple-600 to-indigo-700', image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/c7635531d_Photoshoprender2.jpg' },
  { id: 'settings', title: 'Settings', description: 'Customize your Alchemize experience', icon: Settings, route: 'Settings', gradient: 'from-slate-500 to-gray-600', image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/4edaa444a_20250831_0435_DreamyGlowingKey_remix_01k3zyegxfez6ad6hbe52apr18.jpg' }
];

export default function FeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleFeatures, setVisibleFeatures] = useState(features);
  const [user, setUser] = useState(null);
  const touchStartX = useRef(0);
  const touchStartTime = useRef(0);
  const isSwiping = useRef(false);

  // Load user for premium check
  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Load enabled features
  useEffect(() => {
    const loadFeatures = () => {
      const stored = localStorage.getItem('enabled_features');
      if (stored) {
        try {
          const enabledIds = JSON.parse(stored).filter(f => f.enabled).map(f => f.id);
          const filtered = features.filter(f => enabledIds.includes(f.id));
          if (filtered.length > 0) {
            setVisibleFeatures(filtered);
            setCurrentIndex(i => Math.min(i, filtered.length - 1));
          }
        } catch (e) {}
      }
    };
    loadFeatures();
    window.addEventListener('features-updated', loadFeatures);
    return () => window.removeEventListener('features-updated', loadFeatures);
  }, []);

  const goTo = useCallback((index) => {
    setCurrentIndex(Math.max(0, Math.min(index, visibleFeatures.length - 1)));
  }, [visibleFeatures.length]);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
    isSwiping.current = false;
  }, []);

  const handleTouchMove = useCallback((e) => {
    const diff = Math.abs(e.touches[0].clientX - touchStartX.current);
    if (diff > 10) isSwiping.current = true;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    const elapsed = Date.now() - touchStartTime.current;
    const velocity = Math.abs(diff) / elapsed;

    // Swipe threshold: 40px or fast flick
    if (Math.abs(diff) > 40 || velocity > 0.3) {
      if (diff > 0) goTo(currentIndex + 1);
      else goTo(currentIndex - 1);
    }
  }, [currentIndex, goTo]);

  return (
    <div className="relative w-full flex flex-col items-center justify-center py-6">
      {/* Carousel */}
      <div 
        className="relative w-full h-[58vh] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {visibleFeatures.map((feature, index) => {
            const offset = index - currentIndex;
            if (Math.abs(offset) > 2) return null;

            const isActive = offset === 0;
            const Icon = feature.icon;
            const locked = feature.id !== 'settings' && isFeatureLocked(feature.id, user);

            return (
              <div
                key={feature.id}
                className="absolute transition-all duration-300 ease-out"
                style={{
                  transform: `translateX(${offset * 85}%) scale(${isActive ? 1 : 0.78})`,
                  opacity: isActive ? 1 : 0.4,
                  zIndex: isActive ? 10 : 5 - Math.abs(offset),
                  pointerEvents: isActive ? 'auto' : 'none',
                }}
              >
                <Link
                  to={locked ? createPageUrl('Premium') : createPageUrl(feature.route)}
                  className="block"
                  onClick={(e) => {
                    if (isSwiping.current) e.preventDefault();
                    if (!isActive) { e.preventDefault(); goTo(index); }
                  }}
                >
                  <div className={`
                    relative w-[82vw] max-w-[360px] h-[52vh] rounded-3xl overflow-hidden
                    border border-white/20
                    ${isActive ? 'shadow-2xl shadow-purple-500/25' : 'shadow-lg'}
                  `}>
                    {/* Background image */}
                    <div className="absolute inset-0 bg-black">
                      <img 
                        src={feature.image} 
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={feature.id === 'habits' ? { objectPosition: '70% center' } : {}}
                        loading={Math.abs(offset) <= 1 ? 'eager' : 'lazy'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a2e] via-[#1a0a2e]/30 to-transparent" />
                    </div>

                    {/* Text */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-center space-y-2 z-10">
                      <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                      <p className="text-sm text-white/60 leading-relaxed">{feature.description}</p>
                    </div>

                    {/* Locked overlay */}
                    {locked && <LockedFeatureOverlay />}

                    {/* Glow border */}
                    {isActive && !locked && (
                      <div className={`absolute inset-0 rounded-3xl border-2 border-purple-500/30 pointer-events-none`} />
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots */}
      <div className="flex items-center gap-2 mt-6">
        {visibleFeatures.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={`rounded-full transition-all duration-200 ${
              currentIndex === index
                ? 'w-7 h-2 bg-gradient-to-r from-purple-500 to-indigo-500'
                : 'w-2 h-2 bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Counter */}
      <p className="mt-4 text-white/40 text-sm">
        {currentIndex + 1} of {visibleFeatures.length}
      </p>
    </div>
  );
}