import React from 'react';
import { motion } from 'framer-motion';

export const moods = [
  { id: 'all', label: 'All', emoji: '✨', color: 'from-purple-500 to-indigo-500', glow: 'rgba(168, 85, 247, 0.4)' },
  { id: 'wealth', label: 'Wealth', emoji: '💰', color: 'from-amber-400 to-yellow-500', glow: 'rgba(251, 191, 36, 0.4)' },
  { id: 'love', label: 'Love', emoji: '💕', color: 'from-pink-400 to-rose-500', glow: 'rgba(244, 114, 182, 0.4)' },
  { id: 'health', label: 'Health', emoji: '🌿', color: 'from-emerald-400 to-green-500', glow: 'rgba(52, 211, 153, 0.4)' },
  { id: 'spiritual', label: 'Focus', emoji: '🎯', color: 'from-blue-400 to-indigo-600', glow: 'rgba(96, 165, 250, 0.4)' },
  { id: 'other', label: 'Creativity', emoji: '🎨', color: 'from-violet-400 to-purple-600', glow: 'rgba(167, 139, 250, 0.4)' },
  { id: 'career', label: 'Healing', emoji: '💫', color: 'from-teal-400 to-cyan-500', glow: 'rgba(45, 212, 191, 0.4)' },
];

export const getMoodColors = (moodId) => {
  const mood = moods.find(m => m.id === moodId) || moods[0];
  return mood;
};

export default function MoodSelector({ selectedMood, onMoodChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
      {moods.map((mood) => (
        <motion.button
          key={mood.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onMoodChange(mood.id)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all
            ${selectedMood === mood.id 
              ? `bg-gradient-to-r ${mood.color} text-white shadow-lg` 
              : 'bg-white/10 text-white/70 hover:bg-white/20'
            }
          `}
          style={{
            boxShadow: selectedMood === mood.id ? `0 0 20px ${mood.glow}` : 'none'
          }}
        >
          <span className="text-lg">{mood.emoji}</span>
          <span className="text-sm font-medium">{mood.label}</span>
        </motion.button>
      ))}
    </div>
  );
}