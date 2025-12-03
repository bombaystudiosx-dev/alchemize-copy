import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Sparkles, Heart, Target, CheckSquare, DollarSign, 
  Dumbbell, Apple, Calendar, Settings 
} from 'lucide-react';

const features = [
  {
    id: 'manifestation',
    title: 'Manifestation Board',
    description: 'Visualize your dreams and bring them to life',
    icon: Sparkles,
    route: 'ManifestationBoard',
    gradient: 'from-violet-600 to-purple-600',
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/fd46769d1_DC93C701-3D3B-4706-95DB-B435D928B27B.png'
  },
  {
    id: 'affirmations',
    title: 'Affirmations',
    description: 'Empower yourself with positive thoughts',
    icon: Heart,
    route: 'Affirmations',
    gradient: 'from-pink-600 to-rose-600',
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/eb741e2f8_08E90FB0-1A9C-44F9-9BDB-FBDD45607671.png'
  },
  {
    id: 'goals',
    title: 'Goal Setting',
    description: 'Define and achieve your aspirations',
    icon: Target,
    route: 'Goals',
    gradient: 'from-amber-500 to-orange-600',
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/1278e4fea_3980621C-E6F5-4042-A813-8669BB08CC22.png'
  },
  {
    id: 'habits',
    title: 'Habit Tracker',
    description: 'Build lasting positive routines',
    icon: CheckSquare,
    route: 'Habits',
    gradient: 'from-emerald-500 to-teal-600',
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/1f223a74c_731223C4-9062-40AD-ADE6-BEC7D38C40C7.png'
  },
  {
    id: 'finance',
    title: 'Financial Tracker',
    description: 'Master your money and grow wealth',
    icon: DollarSign,
    route: 'Finance',
    gradient: 'from-green-500 to-emerald-600',
    artwork: '💰📊💎'
  },
  {
    id: 'fitness',
    title: 'Fitness Tracker',
    description: 'Transform your body and energy',
    icon: Dumbbell,
    route: 'Fitness',
    gradient: 'from-red-500 to-orange-600',
    artwork: '💪🏃‍♂️⚡'
  },
  {
    id: 'diet',
    title: 'Diet Planner',
    description: 'Nourish your body mindfully',
    icon: Apple,
    route: 'Diet',
    gradient: 'from-lime-500 to-green-600',
    artwork: '🥗🍎🥑'
  },
  {
    id: 'appointments',
    title: 'Appointments',
    description: 'Organize your time with intention',
    icon: Calendar,
    route: 'Appointments',
    gradient: 'from-blue-500 to-indigo-600',
    artwork: '📅⏰🗓️'
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Customize your Alchemize experience',
    icon: Settings,
    route: 'Settings',
    gradient: 'from-slate-500 to-gray-600',
    artwork: '⚙️🔧✨'
  }
];

export default function FeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleDragStart = (e) => {
    setIsDragging(true);
    startX.current = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    scrollLeft.current = currentIndex;
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const diff = (startX.current - x) / 200;
    const newIndex = Math.round(scrollLeft.current + diff);
    if (newIndex >= 0 && newIndex < features.length) {
      setCurrentIndex(newIndex);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const goToSlide = (index) => {
    if (index >= 0 && index < features.length) {
      setCurrentIndex(index);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center py-8">
      {/* Carousel Container */}
      <div 
        ref={containerRef}
        className="relative w-full flex items-center justify-center h-[500px] overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {features.map((feature, index) => {
              const offset = index - currentIndex;
              const isActive = index === currentIndex;
              const isVisible = Math.abs(offset) <= 2;
              
              if (!isVisible) return null;
              
              const Icon = feature.icon;
              
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    x: offset * 280,
                    scale: isActive ? 1 : 0.75,
                    rotateY: offset * -15,
                    z: isActive ? 0 : -100,
                    opacity: isActive ? 1 : 0.5,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 30 
                  }}
                  className="absolute"
                  style={{ 
                    perspective: '1000px',
                    transformStyle: 'preserve-3d',
                    zIndex: isActive ? 10 : 5 - Math.abs(offset)
                  }}
                >
                  <Link 
                    to={createPageUrl(feature.route)}
                    className="block"
                    onClick={(e) => {
                      if (!isActive) {
                        e.preventDefault();
                        goToSlide(index);
                      }
                    }}
                  >
                    <motion.div
                      whileHover={isActive ? { scale: 1.02 } : {}}
                      whileTap={isActive ? { scale: 0.98 } : {}}
                      className={`
                        relative w-[280px] h-[380px] rounded-3xl overflow-hidden
                        bg-gradient-to-br from-white/15 to-white/5
                        backdrop-blur-xl border border-white/20
                        ${isActive ? 'shadow-2xl shadow-purple-500/30' : 'shadow-lg'}
                      `}
                    >
                      {/* Animated glow border */}
                      <div className={`
                        absolute inset-0 rounded-3xl opacity-60
                        bg-gradient-to-r ${feature.gradient}
                        ${isActive ? 'animate-pulse' : ''}
                      `} style={{ padding: '2px', background: 'transparent' }}>
                        <div className="absolute inset-[2px] rounded-3xl bg-gradient-to-br from-[#1a0a2e] to-[#0d0620]" />
                      </div>
                      
                      {/* Glow effect */}
                      <div className={`
                        absolute -inset-1 rounded-3xl blur-xl opacity-40
                        bg-gradient-to-r ${feature.gradient}
                        ${isActive ? 'opacity-60' : 'opacity-20'}
                        transition-opacity duration-500
                      `} />
                      
                      {/* Card Content */}
                      <div className="relative z-10 h-full flex flex-col">
                        {/* Artwork Area */}
                        <div className="absolute inset-0 overflow-hidden rounded-3xl">
                          {feature.image ? (
                            <motion.div
                              animate={isActive ? { 
                                scale: [1, 1.05, 1]
                              } : {}}
                              transition={{ 
                                duration: 4, 
                                repeat: Infinity,
                                ease: 'easeInOut'
                              }}
                              className="relative w-full h-full"
                            >
                              <img 
                                src={feature.image} 
                                alt={feature.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a2e] via-[#1a0a2e]/30 to-transparent" />
                            </motion.div>
                          ) : (
                            <motion.div
                              animate={isActive ? { 
                                y: [0, -10, 0],
                                rotate: [0, 5, -5, 0]
                              } : {}}
                              transition={{ 
                                duration: 4, 
                                repeat: Infinity,
                                ease: 'easeInOut'
                              }}
                              className="relative"
                            >
                              <div className={`
                                w-24 h-24 rounded-2xl flex items-center justify-center
                                bg-gradient-to-br ${feature.gradient}
                                shadow-lg shadow-purple-500/30
                              `}>
                                <Icon className="w-12 h-12 text-white" />
                              </div>
                              {feature.artwork && (
                                <>
                                  <div className="absolute -top-4 -right-4 text-3xl animate-bounce">
                                    {feature.artwork.split('')[0]}
                                  </div>
                                  <div className="absolute -bottom-2 -left-4 text-2xl animate-pulse">
                                    {feature.artwork.split('')[1]}
                                  </div>
                                </>
                              )}
                            </motion.div>
                          )}
                        </div>
                        
                        {/* Text Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-center space-y-3">
                          <h3 className="text-xl font-bold text-white">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-white/60 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                        
                        {/* Tap indicator */}
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 text-center"
                          >
                            <span className="text-xs text-purple-300/80 uppercase tracking-wider">
                              Tap to Open
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Pagination Dots */}
      <div className="flex items-center gap-2 mt-8">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`
              transition-all duration-300 rounded-full
              ${currentIndex === index 
                ? 'w-8 h-2 bg-gradient-to-r from-purple-500 to-indigo-500' 
                : 'w-2 h-2 bg-white/30 hover:bg-white/50'
              }
            `}
          />
        ))}
      </div>
      
      {/* Feature Title Display */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 text-center"
      >
        <p className="text-white/50 text-sm">
          {currentIndex + 1} of {features.length}
        </p>
      </motion.div>
    </div>
  );
}