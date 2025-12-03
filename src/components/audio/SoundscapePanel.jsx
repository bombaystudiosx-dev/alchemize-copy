import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, X, Play, Pause, Volume2 } from 'lucide-react';
import { useSoundscape } from './SoundscapeContext';
import { Slider } from '@/components/ui/slider';

export default function SoundscapePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    soundscapes, 
    currentTrack, 
    isPlaying, 
    volume, 
    setVolume, 
    selectTrack, 
    togglePlay 
  } = useSoundscape();

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full
          bg-gradient-to-br from-purple-600 to-indigo-700
          shadow-lg shadow-purple-500/30
          flex items-center justify-center
          border border-purple-400/30
        `}
      >
        <Music className="w-6 h-6 text-white" />
        {isPlaying && (
          <>
            <span className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full" />
          </>
        )}
      </motion.button>

      {/* Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:bottom-6 sm:right-6 sm:left-auto sm:w-80"
            >
              <div className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] rounded-3xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                      <Music className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Soundscapes</h3>
                      <p className="text-purple-300/60 text-xs">Meditation Audio</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Controls */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlay}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-105 transition-transform"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      )}
                    </button>
                    
                    <div className="flex-1 flex items-center gap-3">
                      <Volume2 className="w-4 h-4 text-purple-300/60" />
                      <Slider
                        value={[volume * 100]}
                        onValueChange={([val]) => setVolume(val / 100)}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Track List */}
                <div className="p-2 max-h-64 overflow-y-auto">
                  {soundscapes.map((track) => {
                    const isActive = currentTrack === track.id;
                    return (
                      <motion.button
                        key={track.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          selectTrack(track.id);
                          if (!isPlaying) togglePlay();
                        }}
                        className={`
                          w-full flex items-center gap-3 p-3 rounded-xl transition-all
                          ${isActive 
                            ? 'bg-purple-500/20 border border-purple-500/50 shadow-lg shadow-purple-500/20' 
                            : 'hover:bg-white/5 border border-transparent'
                          }
                        `}
                      >
                        <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center text-xl
                          ${isActive 
                            ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
                            : 'bg-white/10'
                          }
                        `}>
                          {track.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <p className={`font-medium ${isActive ? 'text-white' : 'text-white/80'}`}>
                            {track.title}
                          </p>
                          <p className="text-xs text-purple-300/50">{track.description}</p>
                        </div>
                        {isActive && isPlaying && (
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3].map((i) => (
                              <motion.div
                                key={i}
                                animate={{ height: [4, 12, 4] }}
                                transition={{ 
                                  duration: 0.6, 
                                  repeat: Infinity, 
                                  delay: i * 0.15 
                                }}
                                className="w-1 bg-purple-400 rounded-full"
                              />
                            ))}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}