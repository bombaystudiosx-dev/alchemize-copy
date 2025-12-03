import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import FeatureCarousel from '@/components/carousel/FeatureCarousel';
import { Moon, Sparkles } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState('Welcome');

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();

    // Set time-based greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'Seeker';

  return (
    <CosmicBackground>
      <div className="min-h-screen flex flex-col">
        {/* Floating particles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-6 py-4 relative z-10"
        >
          <div className="flex items-center">
            <motion.img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/3b3299703_7EFD7764-73E6-4E36-ADAD-927E09F48B68.png" 
              alt="Alchemize"
              className="h-12 object-contain"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              filter: ['drop-shadow(0 0 8px rgba(168, 85, 247, 0.3))', 'drop-shadow(0 0 16px rgba(168, 85, 247, 0.6))', 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.3))']
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Moon className="w-6 h-6 text-purple-300" />
          </motion.div>
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
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300/80 text-sm uppercase tracking-wider">{greeting}</span>
            <Sparkles className="w-5 h-5 text-purple-400" />
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {firstName}
          </h1>
          <p className="text-purple-200/70 text-sm md:text-base">
            Swipe to explore your transformation journey
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="flex-1 flex items-center">
          <FeatureCarousel />
        </div>

        {/* Bottom hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pb-8 relative z-10"
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
      </div>
    </CosmicBackground>
  );
}