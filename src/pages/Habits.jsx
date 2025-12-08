import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import CosmicCard from '@/components/cosmic/CosmicCard';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Play, Pause, Plus, Minus, Award, Zap, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CosmicInput from '@/components/cosmic/CosmicInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TimerView from '@/components/habits/TimerView';

// Load GRIT spec from localStorage or use default
const loadGritData = () => {
  const stored = localStorage.getItem('grit_habit_data');
  if (stored) {
    return JSON.parse(stored);
  }
  
  return {
    spec_lock: "grit.v3.base44",
    user_data: {
      total_xp: 0,
      total_energy: 0,
      current_level: 1,
      current_level_title: "Novice Spark"
    },
    layout: {
      theme: "dark",
      background: "galaxy-gradient",
      accent_color: "#FF7A00",
      streak_indicator: {
        enabled: true,
        icon: "🔥",
        color: "#FFB347",
        badge_levels: [
          { threshold: 7, badge: "Bronze Flame" },
          { threshold: 14, badge: "Silver Ember" },
          { threshold: 30, badge: "Golden Inferno" },
          { threshold: 100, badge: "Phoenix Soul" }
        ]
      }
    },
    rewards: {
      xp_enabled: true,
      energy_points_enabled: true,
      currency: "grit_fire",
      rules: {
        daily_completion: 5,
        streak_bonus: 2,
        milestone_bonus: 10,
        perfect_week_bonus: 20
      },
      progression: {
        levels: [
          { level: 1, xp_required: 0, title: "Novice Spark" },
          { level: 2, xp_required: 100, title: "Growing Ember" },
          { level: 3, xp_required: 300, title: "Focused Flame" },
          { level: 4, xp_required: 600, title: "Disciplined Blaze" },
          { level: 5, xp_required: 1000, title: "Grit Master" }
        ]
      }
    },
    sections: [
      {
        id: "sec_morning_7B4R",
        title: "Morning",
        color: "#FFD700",
        habits: [
          {
            id: "hbt_meditate_2XQ3",
            name: "Meditate",
            icon: "🧘‍♀️",
            frequency: "daily",
            goal: 15,
            unit: "minutes",
            progress: { type: "timer", value: 0 },
            timer: { status: "stopped", elapsed_seconds: 0, remaining_seconds: 900 },
            streak: 0,
            xp_reward: 15,
            energy_reward: 4,
            completion_log: [],
            ui: { color: "#9B5DE5" }
          },
          {
            id: "hbt_weight_3LP0",
            name: "Record Weight",
            icon: "⚖️",
            frequency: "daily",
            goal: 1,
            unit: "entry",
            progress: { type: "check", value: 0 },
            streak: 0,
            xp_reward: 5,
            energy_reward: 1,
            completion_log: [],
            ui: { color: "#00B4D8" }
          },
          {
            id: "hbt_coldshower_9FD7",
            name: "Take a Cold Shower",
            icon: "🚿",
            frequency: "daily",
            goal: 1,
            unit: "session",
            progress: { type: "check", value: 0 },
            streak: 0,
            xp_reward: 10,
            energy_reward: 3,
            completion_log: [],
            ui: { color: "#0077B6" }
          }
        ]
      },
      {
        id: "sec_health_3AJ8",
        title: "Health",
        color: "#32CD32",
        habits: [
          {
            id: "hbt_dontsnack_8PP9",
            name: "Don't Snack",
            icon: "🚫🍪",
            frequency: "daily",
            goal: 1,
            unit: "day",
            progress: { type: "check", value: 0 },
            streak: 0,
            xp_reward: 5,
            energy_reward: 2,
            completion_log: [],
            ui: { color: "#FF6B6B" }
          },
          {
            id: "hbt_burncalories_4KK3",
            name: "Burn Calories",
            icon: "🔥",
            frequency: "daily",
            goal: 1000,
            unit: "calories",
            progress: { type: "numeric", value: 0 },
            streak: 0,
            xp_reward: 8,
            energy_reward: 3,
            ui: { color: "#FFB347" }
          }
        ]
      },
      {
        id: "sec_learning_4PS2",
        title: "Learning",
        color: "#FFA500",
        habits: [
          {
            id: "hbt_learnspanish_7NL1",
            name: "Learn Spanish",
            icon: "🇪🇸",
            frequency: "daily",
            goal: 45,
            unit: "minutes",
            progress: { type: "timer", value: 0 },
            timer: { status: "stopped", elapsed_seconds: 0, remaining_seconds: 2700 },
            streak: 0,
            xp_reward: 20,
            energy_reward: 5,
            completion_log: [],
            ui: { color: "#FF8C00" }
          },
          {
            id: "hbt_readbook_6HD9",
            name: "Read a Book",
            icon: "📚",
            frequency: "daily",
            goal: 30,
            unit: "minutes",
            progress: { type: "timer", value: 0 },
            timer: { status: "stopped", elapsed_seconds: 0, remaining_seconds: 1800 },
            streak: 0,
            xp_reward: 10,
            energy_reward: 3,
            completion_log: [],
            ui: { color: "#5BC0BE" }
          }
        ]
      },
      {
        id: "sec_hydration_5RQ4",
        title: "Hydration",
        color: "#1E90FF",
        habits: [
          {
            id: "hbt_drinkwater_9LT8",
            name: "Drink Water",
            icon: "💧",
            frequency: "daily",
            goal: 2000,
            unit: "ml",
            progress: { type: "numeric", value: 0 },
            streak: 0,
            xp_reward: 6,
            energy_reward: 2,
            ui: { color: "#00BFFF" }
          }
        ]
      }
    ]
  };
};

const saveGritData = (data) => {
  localStorage.setItem('grit_habit_data', JSON.stringify(data));
};

export default function Habits() {
  const [gritData, setGritData] = useState(loadGritData());
  const [activeTimers, setActiveTimers] = useState({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTimerView, setActiveTimerView] = useState(null);
  const [newHabit, setNewHabit] = useState({
    name: '',
    icon: '⭐',
    type: 'check',
    goal: 1,
    unit: 'session',
    section: 'sec_morning_7B4R'
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveGritData(gritData);
  }, [gritData]);

  // Timer effect with alarm
  useEffect(() => {
    const interval = setInterval(() => {
      setGritData(prev => {
        let updated = { ...prev };
        let hasChanges = false;

        prev.sections.forEach((section, sIdx) => {
          section.habits.forEach((habit, hIdx) => {
            if (habit.timer?.status === 'running') {
              hasChanges = true;
              const newElapsed = habit.timer.elapsed_seconds + 1;
              const newRemaining = Math.max(0, (habit.goal * 60) - newElapsed);
              
              updated.sections[sIdx].habits[hIdx] = {
                ...habit,
                timer: {
                  ...habit.timer,
                  elapsed_seconds: newElapsed,
                  remaining_seconds: newRemaining
                },
                progress: {
                  ...habit.progress,
                  value: Math.floor(newElapsed / 60)
                }
              };

              // Auto-complete when timer reaches goal + play alarm
              if (newElapsed >= habit.goal * 60 && habit.progress.value < habit.goal) {
                const today = format(new Date(), 'yyyy-MM-dd');
                if (!(habit.completion_log || []).some(log => log.date === today)) {
                  if (!updated.sections[sIdx].habits[hIdx].completion_log) {
                    updated.sections[sIdx].habits[hIdx].completion_log = [];
                  }
                  updated.sections[sIdx].habits[hIdx].completion_log.push({
                    date: today,
                    completed: true
                  });
                  updated.sections[sIdx].habits[hIdx].streak += 1;
                  updated.user_data.total_xp += habit.xp_reward;
                  updated.user_data.total_energy += habit.energy_reward;
                  updated.sections[sIdx].habits[hIdx].timer.status = 'stopped';
                  
                  // Play alarm sound
                  playAlarm();
                }
              }
            }
          });
        });

        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const playAlarm = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    // Play again after delay
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.value = 1000;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.5);
    }, 600);
  };

  const toggleTimer = (sectionId, habitId) => {
    const section = gritData.sections.find(s => s.id === sectionId);
    const sectionIdx = gritData.sections.indexOf(section);
    const habit = section.habits.find(h => h.id === habitId);
    const habitIdx = section.habits.indexOf(habit);
    setActiveTimerView({ sectionIdx, habitIdx, habit });
  };
  
  const updateTimerHabit = (sectionIdx, habitIdx, updates) => {
    setGritData(prev => {
      const updated = { ...prev };
      const habit = updated.sections[sectionIdx].habits[habitIdx];
      
      Object.keys(updates).forEach(key => {
        habit[key] = updates[key];
      });
      
      return updated;
    });
  };

  const toggleCheckHabit = (sectionId, habitId) => {
    setGritData(prev => {
      const updated = { ...prev };
      const section = updated.sections.find(s => s.id === sectionId);
      const habit = section.habits.find(h => h.id === habitId);
      const today = format(new Date(), 'yyyy-MM-dd');
      const alreadyCompleted = (habit.completion_log || []).some(log => log.date === today);
      
      if (alreadyCompleted) {
        habit.completion_log = (habit.completion_log || []).filter(log => log.date !== today);
        habit.streak = Math.max(0, habit.streak - 1);
        habit.progress.value = 0;
      } else {
        if (!habit.completion_log) habit.completion_log = [];
        habit.completion_log.push({ date: today, completed: true });
        habit.streak += 1;
        habit.progress.value = 1;
        updated.user_data.total_xp += habit.xp_reward;
        updated.user_data.total_energy += habit.energy_reward;
      }
      
      return updated;
    });
  };

  const updateNumericProgress = (sectionId, habitId, delta) => {
    setGritData(prev => {
      const updated = { ...prev };
      const section = updated.sections.find(s => s.id === sectionId);
      const habit = section.habits.find(h => h.id === habitId);
      
      habit.progress.value = Math.max(0, Math.min(habit.goal, habit.progress.value + delta));
      
      const today = format(new Date(), 'yyyy-MM-dd');
      const alreadyCompleted = (habit.completion_log || []).some(log => log.date === today);
      
      if (habit.progress.value >= habit.goal && !alreadyCompleted) {
        if (!habit.completion_log) habit.completion_log = [];
        habit.completion_log.push({ date: today, completed: true });
        habit.streak += 1;
        updated.user_data.total_xp += habit.xp_reward;
        updated.user_data.total_energy += habit.energy_reward;
      } else if (habit.progress.value < habit.goal && alreadyCompleted) {
        habit.completion_log = (habit.completion_log || []).filter(log => log.date !== today);
        habit.streak = Math.max(0, habit.streak - 1);
      }
      
      return updated;
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStreakBadge = (streak) => {
    const badges = gritData.layout.streak_indicator.badge_levels;
    for (let i = badges.length - 1; i >= 0; i--) {
      if (streak >= badges[i].threshold) {
        return badges[i].badge;
      }
    }
    return null;
  };

  const maxStreak = Math.max(...gritData.sections.flatMap(s => s.habits.map(h => h.streak || 0)));

  const addNewHabit = () => {
    setGritData(prev => {
      const updated = { ...prev };
      const section = updated.sections.find(s => s.id === newHabit.section);
      
      const habitId = `hbt_${newHabit.name.toLowerCase().replace(/\s/g, '')}_${Date.now().toString(36)}`;
      
      const newHabitData = {
        id: habitId,
        name: newHabit.name,
        icon: newHabit.icon,
        frequency: 'daily',
        goal: parseInt(newHabit.goal),
        unit: newHabit.unit,
        progress: { 
          type: newHabit.type, 
          value: 0 
        },
        streak: 0,
        xp_reward: newHabit.type === 'timer' ? 15 : 5,
        energy_reward: newHabit.type === 'timer' ? 4 : 2,
        completion_log: [],
        ui: { color: section.color }
      };
      
      if (newHabit.type === 'timer') {
        newHabitData.timer = {
          status: 'stopped',
          elapsed_seconds: 0,
          remaining_seconds: newHabit.goal * 60
        };
      }
      
      section.habits.push(newHabitData);
      return updated;
    });
    
    setShowAddDialog(false);
    setNewHabit({
      name: '',
      icon: '⭐',
      type: 'check',
      goal: 1,
      unit: 'session',
      section: 'sec_morning_7B4R'
    });
  };

  const icons = ['⭐', '💪', '📚', '🎯', '🧘‍♀️', '🏃', '💧', '🍎', '🎨', '🎵', '✍️', '🧠'];

  return (
    <CosmicBackground>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-6 py-4 sticky top-0 z-50 bg-gradient-to-b from-[#0a0118] to-transparent backdrop-blur-sm"
        >
          <Link to={createPageUrl('Home')} className="flex items-center gap-2 text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Habit Tracker</h1>
          <button 
            onClick={() => setShowAddDialog(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 flex items-center justify-center hover:scale-110 transition-transform"
          >
            <PlusCircle className="w-5 h-5 text-white" />
          </button>
        </motion.header>

        <div className="px-6">
          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <CosmicCard className="bg-gradient-to-r from-orange-500/20 to-purple-500/20 border-orange-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-amber-400 mb-1">
                      <span className="text-2xl">{gritData.layout.streak_indicator.icon}</span>
                      <span className="text-xl font-bold">{maxStreak}</span>
                    </div>
                    <p className="text-xs text-white/50">Max Streak</p>
                  </div>
                  
                  <div className="w-px h-10 bg-white/20" />
                  
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-purple-400 mb-1">
                      <Award className="w-5 h-5" />
                      <span className="text-lg font-bold">{gritData.user_data.total_xp}</span>
                    </div>
                    <p className="text-xs text-white/50">Total XP</p>
                  </div>
                  
                  <div className="w-px h-10 bg-white/20" />
                  
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-yellow-400 mb-1">
                      <Zap className="w-5 h-5" />
                      <span className="text-lg font-bold">{gritData.user_data.total_energy}</span>
                    </div>
                    <p className="text-xs text-white/50">Energy</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium text-white">Level {gritData.user_data.current_level}</p>
                  <p className="text-xs text-white/50">{gritData.user_data.current_level_title}</p>
                </div>
              </div>
            </CosmicCard>
          </motion.div>

          {/* Sections */}
          <AnimatePresence>
            {gritData.sections.map((section, sIdx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sIdx * 0.1 }}
                className="mb-6"
              >
                <h2 
                  className="text-lg font-semibold mb-3 flex items-center gap-2"
                  style={{ color: section.color }}
                >
                  {section.title}
                </h2>
                
                <div className="space-y-3">
                  {section.habits.map((habit) => {
                    const today = format(new Date(), 'yyyy-MM-dd');
                    const isCompleted = (habit.completion_log || []).some(log => log.date === today);
                    const progress = (habit.progress.value / habit.goal) * 100;
                    
                    return (
                      <CosmicCard 
                        key={habit.id}
                        className={`relative overflow-hidden ${isCompleted ? 'border-green-500/50' : ''}`}
                      >
                        {/* Progress bar background */}
                        <div 
                          className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                        
                        <div className="relative">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{habit.icon}</span>
                              <div>
                                <h3 className="font-medium text-white">{habit.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs text-white/50">
                                    {habit.progress.value} / {habit.goal} {habit.unit}
                                  </p>
                                  {habit.streak > 0 && (
                                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                                      <span>{gritData.layout.streak_indicator.icon}</span>
                                      <span>{habit.streak}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center gap-2 text-xs">
                                <div className="flex items-center gap-1 text-purple-400">
                                  <Award className="w-3 h-3" />
                                  <span>+{habit.xp_reward}</span>
                                </div>
                                <div className="flex items-center gap-1 text-yellow-400">
                                  <Zap className="w-3 h-3" />
                                  <span>+{habit.energy_reward}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress Controls */}
                          {habit.progress.type === 'timer' && (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => toggleTimer(section.id, habit.id)}
                                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 transition-all flex items-center justify-center gap-2"
                              >
                                {habit.timer.status === 'running' ? (
                                  <>
                                    <Pause className="w-4 h-4 text-white" />
                                    <span className="text-white text-sm">{formatTime(habit.timer.elapsed_seconds)}</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4 text-white" />
                                    <span className="text-white text-sm">{formatTime(habit.timer.elapsed_seconds)}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                          
                          {habit.progress.type === 'check' && (
                            <button
                              onClick={() => toggleCheckHabit(section.id, habit.id)}
                              className={`w-full py-2 rounded-lg transition-all ${
                                isCompleted 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                                  : 'bg-white/10 hover:bg-white/20'
                              }`}
                            >
                              <span className="text-white text-sm">
                                {isCompleted ? '✓ Completed' : 'Mark Complete'}
                              </span>
                            </button>
                          )}
                          
                          {habit.progress.type === 'numeric' && (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateNumericProgress(section.id, habit.id, -100)}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                              >
                                <Minus className="w-4 h-4 text-white" />
                              </button>
                              
                              <div className="flex-1 text-center">
                                <div className="text-2xl font-bold text-white">
                                  {habit.progress.value}
                                </div>
                              </div>
                              
                              <button
                                onClick={() => updateNumericProgress(section.id, habit.id, 100)}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                              >
                                <Plus className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          )}
                        </div>
                      </CosmicCard>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Habit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-orange-500/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-orange-400" />
              Add New Habit
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-purple-200/70 mb-2 block">Habit Name</label>
              <CosmicInput
                value={newHabit.name}
                onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                placeholder="e.g., Morning Workout"
              />
            </div>
            
            <div>
              <label className="text-sm text-purple-200/70 mb-2 block">Icon</label>
              <div className="flex flex-wrap gap-2">
                {icons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setNewHabit({ ...newHabit, icon })}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl transition-all ${
                      newHabit.icon === icon 
                        ? 'bg-orange-500/30 scale-110' 
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm text-purple-200/70 mb-2 block">Section</label>
              <Select value={newHabit.section} onValueChange={(val) => setNewHabit({ ...newHabit, section: val })}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a0a2e] border-purple-500/30 text-white">
                  {gritData.sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-purple-200/70 mb-2 block">Type</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setNewHabit({ ...newHabit, type: 'check', unit: 'session', goal: 1 })}
                  className={`py-2 px-3 rounded-lg text-sm transition-all ${
                    newHabit.type === 'check' 
                      ? 'bg-orange-500/30 border border-orange-500/50' 
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  ✓ Check
                </button>
                <button
                  onClick={() => setNewHabit({ ...newHabit, type: 'timer', unit: 'minutes', goal: 15 })}
                  className={`py-2 px-3 rounded-lg text-sm transition-all ${
                    newHabit.type === 'timer' 
                      ? 'bg-orange-500/30 border border-orange-500/50' 
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  ⏱ Timer
                </button>
                <button
                  onClick={() => setNewHabit({ ...newHabit, type: 'numeric', unit: 'reps', goal: 100 })}
                  className={`py-2 px-3 rounded-lg text-sm transition-all ${
                    newHabit.type === 'numeric' 
                      ? 'bg-orange-500/30 border border-orange-500/50' 
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  # Counter
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Goal</label>
                <CosmicInput
                  type="number"
                  value={newHabit.goal}
                  onChange={(e) => setNewHabit({ ...newHabit, goal: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Unit</label>
                <CosmicInput
                  value={newHabit.unit}
                  onChange={(e) => setNewHabit({ ...newHabit, unit: e.target.value })}
                  placeholder="e.g., minutes"
                />
              </div>
            </div>
            
            <button
              onClick={addNewHabit}
              disabled={!newHabit.name}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Add Habit
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Timer View */}
      <AnimatePresence>
        {activeTimerView && (
          <TimerView
            habit={activeTimerView.habit}
            onClose={() => setActiveTimerView(null)}
            onUpdate={(updates) => {
              updateTimerHabit(activeTimerView.sectionIdx, activeTimerView.habitIdx, updates);
            }}
          />
        )}
      </AnimatePresence>
    </CosmicBackground>
  );
}