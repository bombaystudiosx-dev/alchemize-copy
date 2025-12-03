import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import GlowButton from '@/components/cosmic/GlowButton';
import { Moon, KeyRound } from 'lucide-react';

export default function Splash() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <CosmicBackground>
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        {/* Logo Container */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: 'spring',
            stiffness: 200,
            delay: 0.2
          }}
          className="relative mb-8"
        >
          {/* Glow effect behind logo */}
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 opacity-50 rounded-full scale-150" />
          
          {/* Logo Icon */}
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              y: [0, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="relative"
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-700 flex items-center justify-center shadow-2xl shadow-purple-500/50 border-2 border-white/20">
              <div className="relative">
                <Moon className="w-12 h-12 text-white absolute -top-2 -right-2 opacity-80" />
                <KeyRound className="w-16 h-16 text-white" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-indigo-300 mb-4 tracking-tight"
        >
          Alchemize
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-lg md:text-xl text-purple-200/80 mb-12 tracking-wide"
        >
          Unlock Your Highest Self
        </motion.p>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex items-center gap-4 mb-12"
        >
          {['✨', '🌙', '⭐', '🌙', '✨'].map((emoji, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -5, 0] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="text-2xl"
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: showButton ? 1 : 0, 
            scale: showButton ? 1 : 0.8 
          }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Link to={createPageUrl('Home')}>
            <GlowButton size="lg" className="min-w-[200px]">
              Continue
            </GlowButton>
          </Link>
        </motion.div>

        {/* Bottom decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"
        />
      </div>
    </CosmicBackground>
  );
}