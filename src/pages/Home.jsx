import React from 'react';
import { motion } from 'framer-motion';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import FeatureCarousel from '@/components/carousel/FeatureCarousel';
import { Moon, KeyRound } from 'lucide-react';

export default function Home() {
  return (
    <CosmicBackground>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-6 py-4"
        >
          <div className="flex items-center">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/3b3299703_7EFD7764-73E6-4E36-ADAD-927E09F48B68.png" 
              alt="Alchemize"
              className="h-12 object-contain"
            />
          </div>
          
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
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
          className="text-center px-6 pt-4"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Welcome, Seeker
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
          className="text-center pb-8"
        >
          <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
            <span>←</span>
            <span>Swipe to navigate</span>
            <span>→</span>
          </div>
        </motion.div>
      </div>
    </CosmicBackground>
  );
}