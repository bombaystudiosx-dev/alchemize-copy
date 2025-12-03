import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMoodColors } from './MoodSelector';
import AudioReactiveParticles from './AudioReactiveParticles';

// Chime sound (very subtle)
const playChime = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 2);
};

export default function DailyRitualModal({ tile, onComplete }) {
  const [showContent, setShowContent] = useState(false);
  const moodColor = getMoodColors(tile?.category || 'other');

  useEffect(() => {
    // Play subtle chime on mount
    const timer = setTimeout(() => {
      playChime();
      setShowContent(true);
    }, 500);

    // Auto-dismiss after 8 seconds
    const dismissTimer = setTimeout(() => {
      onComplete();
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, [onComplete]);

  if (!tile) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
      onClick={onComplete}
    >
      <AudioReactiveParticles moodColor={moodColor} />
      
      {/* Cosmic glow */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${moodColor.glow}, transparent 50%)`
        }}
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10 flex flex-col items-center px-8 text-center"
          >
            {/* Morning greeting */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-purple-300/80 text-sm uppercase tracking-widest mb-6"
            >
              ✨ Morning Portal Ritual ✨
            </motion.p>

            {/* Image */}
            {tile.image_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="relative mb-8"
              >
                <div 
                  className="absolute -inset-4 rounded-3xl blur-2xl"
                  style={{ background: moodColor.glow }}
                />
                <img
                  src={tile.image_url}
                  alt={tile.title}
                  className="relative w-64 h-64 md:w-80 md:h-80 object-cover rounded-2xl shadow-2xl"
                />
              </motion.div>
            )}

            {/* Intention */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-xl md:text-2xl lg:text-3xl font-medium text-white leading-relaxed max-w-lg"
              style={{
                textShadow: `0 0 30px ${moodColor.glow}`
              }}
            >
              {tile.title}
            </motion.p>

            {/* Mood */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-6 flex items-center gap-2"
            >
              <span className="text-2xl">{moodColor.emoji}</span>
            </motion.div>

            {/* Tap to continue */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ delay: 3, duration: 2, repeat: Infinity }}
              className="mt-12 text-white/40 text-sm"
            >
              Tap anywhere to continue
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}