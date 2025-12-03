import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import GlowButton from '@/components/cosmic/GlowButton';
// KeyRound import removed - not used

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
            <div className="w-40 h-40 rounded-full overflow-hidden shadow-2xl shadow-purple-500/50 border-2 border-white/20">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/6a10d4a15_A361E0F7-2289-4491-873F-681D46F0CACB.png"
                alt="Alchemize"
                className="w-full h-full object-cover scale-110"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-4"
        >
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/87ac0e58a_7EFD7764-73E6-4E36-ADAD-927E09F48B68.png"
            alt="Alchemize"
            className="h-44 md:h-56 object-contain"
          />
        </motion.div>

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