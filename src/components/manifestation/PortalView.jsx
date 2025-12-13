import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { getMoodColors } from './MoodSelector';
import AudioReactiveParticles from './AudioReactiveParticles';

export default function PortalView({ 
  tile, 
  tiles,
  currentIndex,
  onClose, 
  onEdit, 
  onDelete,
  onNavigate 
}) {
  const [touchStart, setTouchStart] = useState(null);
  const moodColor = getMoodColors(tile?.category || 'other');

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < tiles.length - 1) {
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, tiles.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, onClose]);

  // Touch swipe handling
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    setTouchStart(null);
  };

  if (!tile) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Audio-reactive background */}
      <AudioReactiveParticles moodColor={moodColor} />
      
      {/* Cosmic blur edges */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-60`} />
        <div className={`absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60`} />
        <motion.div 
          className={`absolute inset-0 opacity-30`}
          style={{ 
            background: `radial-gradient(circle at 50% 50%, ${moodColor.glow}, transparent 70%)`
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      {/* Main image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tile.id}
          layoutId={`portal-${tile.id}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 flex items-center justify-center p-8 md:p-16"
        >
          {tile.image_url ? (
            <motion.img
              src={tile.image_url}
              alt={tile.title}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              style={{
                boxShadow: `0 0 60px ${moodColor.glow}, 0 0 120px ${moodColor.glow}`,
                maxWidth: '95vw',
                maxHeight: '85vh'
              }}
              animate={{
                scale: [1, 1.01, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          ) : (
            <div 
              className={`w-full max-w-lg aspect-[3/4] rounded-2xl bg-gradient-to-br ${moodColor.color} opacity-30`}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Intention text */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-0 left-0 right-0 p-8 pb-24 text-center"
      >
        <motion.div
          className="inline-block px-6 py-4 rounded-2xl backdrop-blur-xl bg-black/40"
          style={{
            boxShadow: `0 0 40px ${moodColor.glow}`
          }}
        >
          <p 
            className="text-xl md:text-2xl lg:text-3xl font-medium text-white leading-relaxed max-w-2xl mx-auto"
            style={{
              textShadow: `0 0 30px ${moodColor.glow}, 0 0 60px ${moodColor.glow}`
            }}
          >
            {tile.title}
          </p>
          
          {/* Mood tag */}
          <motion.div 
            className="mt-4 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-2xl">{moodColor.emoji}</span>
            <span className="text-white/60 text-sm">{moodColor.label}</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Navigation controls */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none">
        {currentIndex > 0 && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrev}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center text-white pointer-events-auto"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
        )}
        <div />
        {currentIndex < tiles.length - 1 && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNext}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center text-white pointer-events-auto"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        )}
      </div>

      {/* Top controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center text-white"
        >
          <X className="w-5 h-5" />
        </motion.button>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(tile)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center text-white"
          >
            <Pencil className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(tile.id)}
            className="w-10 h-10 rounded-full bg-red-500/20 backdrop-blur-lg flex items-center justify-center text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Slide indicator */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
        {tiles.map((_, idx) => (
          <motion.div
            key={idx}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}