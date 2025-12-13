import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { getMoodColors } from './MoodSelector';

export default function PortalTile({ tile, index, onClick, driftOffset = { x: 0, y: 0 } }) {
  const moodColor = getMoodColors(tile.category || 'other');
  
  return (
    <motion.div
      layoutId={`portal-${tile.id}`}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        x: driftOffset.x,
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ 
        delay: index * 0.08,
        type: 'spring',
        stiffness: 200,
        damping: 20
      }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative cursor-pointer group"
    >
      {/* Glow effect */}
      <motion.div
        className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${moodColor.color} opacity-0 group-hover:opacity-60 blur-xl transition-opacity duration-500`}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      {/* Tile container */}
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10">
        {/* Image */}
        {tile.image_url ? (
          <motion.img 
            src={tile.image_url}
            alt={tile.title}
            className="w-full h-full object-contain bg-black/20"
            animate={{
              scale: [1, 1.02, 1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-indigo-900/50 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-purple-400/50" />
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Mood indicator */}
        <div className="absolute top-2 right-2">
          <span className="text-lg">{moodColor.emoji}</span>
        </div>
        
        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white text-sm font-medium line-clamp-2 leading-tight"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
          >
            {tile.title}
          </p>
        </div>
        
        {/* Shimmer effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </motion.div>
  );
}