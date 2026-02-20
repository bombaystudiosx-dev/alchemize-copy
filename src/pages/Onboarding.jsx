import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Sparkles, Target, Flame, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    icon: Sparkles,
    title: 'Manifest Your Dreams',
    description: 'Create vision boards, affirmations, and rituals to align your energy with your desires.',
    gradient: 'from-purple-600 to-indigo-600',
  },
  {
    icon: Target,
    title: 'Track Your Growth',
    description: 'Set goals, build habits, and monitor your fitness, nutrition, and finances — all in one place.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: Flame,
    title: 'Transform Daily',
    description: 'Stay consistent with streaks, daily check-ins, and AI-powered insights that keep you on track.',
    gradient: 'from-pink-500 to-rose-600',
  },
];

export default function Onboarding() {
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < SLIDES.length - 1) {
      setCurrent(current + 1);
    } else {
      localStorage.setItem('onboarding_complete', 'true');
      window.location.href = createPageUrl('Premium');
    }
  };

  const skip = () => {
    localStorage.setItem('onboarding_complete', 'true');
    window.location.href = createPageUrl('Premium');
  };

  const slide = SLIDES[current];
  const Icon = slide.icon;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/ce90c0d9f_B28AA351-FB07-478A-8B1E-FB90E998F0B7.png)'
        }}
      />
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 min-h-screen flex flex-col px-6 pt-16 pb-10 safe-area-top safe-area-bottom">
        {/* Skip */}
        <div className="flex justify-end">
          <button onClick={skip} className="text-white/50 text-sm font-medium px-3 py-1">
            Skip
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${slide.gradient} flex items-center justify-center mb-8 shadow-lg`}
          >
            <Icon className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h1
            key={`t-${current}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-white mb-4"
          >
            {slide.title}
          </motion.h1>

          <motion.p
            key={`d-${current}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg leading-relaxed max-w-sm"
          >
            {slide.description}
          </motion.p>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === current ? 'w-8 h-2 bg-purple-500' : 'w-2 h-2 bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={next}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
        >
          {current === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}