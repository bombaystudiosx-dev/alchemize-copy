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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-white">Alchemize</span>
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