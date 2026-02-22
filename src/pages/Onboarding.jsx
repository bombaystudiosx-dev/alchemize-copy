import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Sparkles, Target, Flame, ChevronRight } from 'lucide-react';

const SLIDES = [
{
  icon: Sparkles,
  title: 'Manifest Your Dreams',
  description: 'Create vision boards, affirmations, and rituals to align your energy with your desires.',
  gradient: 'from-purple-600 to-indigo-600'
},
{
  icon: Target,
  title: 'Track Your Growth',
  description: 'Set goals, build habits, and monitor your fitness, nutrition, and finances — all in one place.',
  gradient: 'from-amber-500 to-orange-600'
},
{
  icon: Flame,
  title: 'Transform Daily',
  description: 'Stay consistent with streaks, daily check-ins, and AI-powered insights that keep you on track.',
  gradient: 'from-pink-500 to-rose-600'
}];


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
        }} />

      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 min-h-screen flex flex-col px-6 pt-16 pb-10 safe-area-top safe-area-bottom">
        {/* Skip */}
        <div className="flex justify-end">
          


        </div>

        {/* Content */}
        































        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {SLIDES.map((_, i) =>
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
            i === current ? 'w-8 h-2 bg-purple-500' : 'w-2 h-2 bg-white/30'}`
            } />

          )}
        </div>

        {/* Next button */}
        






      </div>
    </div>);

}