import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';

export default function TimerView({ habit, onClose, onUpdate }) {
  const [elapsed, setElapsed] = useState(habit.timer?.elapsed_seconds || 0);
  const [isRunning, setIsRunning] = useState(habit.timer?.status === 'running');
  
  const totalSeconds = habit.goal * 60;
  const remaining = Math.max(0, totalSeconds - elapsed);
  const progress = (elapsed / totalSeconds) * 100;
  
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsed(prev => {
          const newElapsed = prev + 1;
          if (newElapsed >= totalSeconds) {
            setIsRunning(false);
            playAlarm();
            return totalSeconds;
          }
          return newElapsed;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, totalSeconds]);
  
  const playAlarm = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }, i * 400);
    }
  };
  
  const handlePlayPause = () => {
    const newStatus = isRunning ? 'stopped' : 'running';
    setIsRunning(!isRunning);
    onUpdate({ 
      timer: { 
        status: newStatus, 
        elapsed_seconds: elapsed,
        remaining_seconds: remaining
      } 
    });
  };
  
  const handleReset = () => {
    setElapsed(0);
    setIsRunning(false);
    onUpdate({ 
      timer: { 
        status: 'stopped', 
        elapsed_seconds: 0,
        remaining_seconds: totalSeconds
      },
      progress: { type: 'timer', value: 0 }
    });
  };
  
  const handleAdjust = (minutes) => {
    const newElapsed = Math.max(0, Math.min(totalSeconds, elapsed + (minutes * 60)));
    setElapsed(newElapsed);
  };
  
  const handleStop = () => {
    onUpdate({ 
      timer: { 
        status: 'stopped', 
        elapsed_seconds: elapsed,
        remaining_seconds: remaining
      },
      progress: { type: 'timer', value: Math.floor(elapsed / 60) }
    });
    onClose();
  };
  
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-b from-[#1a3a52] via-[#1a2533] to-[#0f1f0f]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <div className="text-white/60 text-sm">Every day, {habit.goal} {habit.unit}</div>
        <div className="w-10" />
      </div>
      
      {/* Habit Name */}
      <div className="text-center mt-4">
        <h1 className="text-2xl font-bold text-white">{habit.name}</h1>
      </div>
      
      {/* Circular Timer */}
      <div className="flex items-center justify-center mt-12 relative">
        {/* Streak indicator */}
        <div className="absolute -top-8 right-1/4 flex items-center gap-1 bg-orange-500/20 px-3 py-1 rounded-full">
          <span className="text-2xl">🔥</span>
          <span className="text-white font-bold">{habit.streak || 0}</span>
        </div>
        
        {/* Adjust buttons */}
        <button
          onClick={() => handleAdjust(-5)}
          className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-orange-600/30 hover:bg-orange-600/50 flex items-center justify-center transition-all"
        >
          <Minus className="w-6 h-6 text-orange-400" />
        </button>
        
        <button
          onClick={() => handleAdjust(5)}
          className="absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-orange-600/30 hover:bg-orange-600/50 flex items-center justify-center transition-all"
        >
          <Plus className="w-6 h-6 text-orange-400" />
        </button>
        
        <div className="relative">
          {/* Background circle */}
          <svg width="280" height="280" className="transform -rotate-90">
            <circle
              cx="140"
              cy="140"
              r="120"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="20"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="140"
              cy="140"
              r="120"
              stroke="url(#gradient)"
              strokeWidth="20"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Time display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-bold text-white">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
            </div>
          </div>
          
          {/* Tick marks */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30) - 90;
            const x = 140 + 110 * Math.cos(angle * Math.PI / 180);
            const y = 140 + 110 * Math.sin(angle * Math.PI / 180);
            return (
              <div
                key={i}
                className="absolute w-1 h-3 bg-white/30"
                style={{
                  left: x,
                  top: y,
                  transform: `rotate(${angle + 90}deg)`,
                  transformOrigin: 'center'
                }}
              />
            );
          })}
        </div>
      </div>
      
      {/* Controls */}
      <div className="mt-16 px-6 space-y-3">
        {/* Control buttons row */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <button
            onClick={handlePlayPause}
            className="w-12 h-12 rounded-full bg-orange-500/20 hover:bg-orange-500/30 flex items-center justify-center transition-all"
          >
            {isRunning ? (
              <Pause className="w-6 h-6 text-orange-400" fill="currentColor" />
            ) : (
              <Play className="w-6 h-6 text-orange-400" fill="currentColor" />
            )}
          </button>
          
          <button
            onClick={handleReset}
            className="w-12 h-12 rounded-full bg-orange-500/20 hover:bg-orange-500/30 flex items-center justify-center transition-all"
          >
            <RotateCcw className="w-6 h-6 text-orange-400" />
          </button>
        </div>
        
        {/* Elapsed time badge */}
        <button className="w-full py-3 rounded-full bg-orange-500/90 hover:bg-orange-600 text-white font-medium transition-all">
          +{Math.floor(elapsed / 60)} min, {elapsed % 60} sec
        </button>
        
        {/* Stop button */}
        <button
          onClick={handleStop}
          className="w-full py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all flex items-center justify-center gap-2"
        >
          <div className="w-2 h-2 bg-white rounded-full" />
          Stop timer
        </button>
      </div>
    </motion.div>
  );
}