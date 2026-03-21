import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import CosmicCard from '@/components/cosmic/CosmicCard';
// Navigation handled by bottom tab bar
import { Play, Pause, Plus, Minus, Award, Zap, PlusCircle, Trash2, Edit, X, Bell } from 'lucide-react';
import PremiumGate from '@/components/subscription/PremiumGate';
import { format } from 'date-fns';
import TimerView from '@/components/habits/TimerView';
import HabitFormDialog from '@/components/habits/HabitFormDialog';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '@/components/common/PullToRefresh';

// Default habits structure
const getDefaultHabitsData = () => {
  return {
    user_data: {
      total_xp: 0,
      total_energy: 0
    },
    habits: [
      {
        id: "hbt_meditate_2XQ3",
        name: "Meditate",
        icon: "🧘‍♀️",
        goal: 15,
        unit: "minutes",
        progress: { type: "timer", value: 0 },
        timer: { status: "stopped", elapsed_seconds: 0, remaining_seconds: 900 },
        streak: 0,
        xp_reward: 15,
        energy_reward: 4,
        completion_log: [],
        color: "#9B5DE5"
      },
      {
        id: "hbt_weight_3LP0",
        name: "Record Weight",
        icon: "⚖️",
        goal: 1,
        unit: "entry",
        progress: { type: "check", value: 0 },
        streak: 0,
        xp_reward: 5,
        energy_reward: 1,
        completion_log: [],
        color: "#00B4D8"
      },
      {
        id: "hbt_coldshower_9FD7",
        name: "Take a Cold Shower",
        icon: "🚿",
        goal: 1,
        unit: "session",
        progress: { type: "check", value: 0 },
        streak: 0,
        xp_reward: 10,
        energy_reward: 3,
        completion_log: [],
        color: "#0077B6"
      }
    ]
  };
};

const normalizeHabit = (habit) => ({
  ...habit,
  reminder_enabled: !!habit?.reminder_enabled,
  reminder_time: habit?.reminder_time || '08:00',
  last_reminder_date: habit?.last_reminder_date || null,
});

export default function Habits() {
  const queryClient = useQueryClient();
  
  // Fetch habit progress from database
  const { data: habitRecord, isLoading } = useQuery({
    queryKey: ['habitProgress'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const records = await base44.entities.HabitProgress.filter({ created_by: user.email });
      return records[0] || null;
    }
  });
  
  const [habitsData, setHabitsData] = useState({
    ...getDefaultHabitsData(),
    habits: getDefaultHabitsData().habits.map(normalizeHabit)
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTimerView, setActiveTimerView] = useState(null);
  const [editingHabit, setEditingHabit] = useState(null);
  
  // Load habit data from database
  useEffect(() => {
    if (habitRecord?.habit_data) {
      if (habitRecord.habit_data.sections) {
        const migratedHabits = habitRecord.habit_data.sections.flatMap(s => 
          s.habits.map(h => normalizeHabit({ ...h, color: h.ui?.color || s.color }))
        );
        setHabitsData({
          user_data: habitRecord.habit_data.user_data || { total_xp: 0, total_energy: 0 },
          habits: migratedHabits
        });
      } else {
        setHabitsData({
          ...habitRecord.habit_data,
          habits: (habitRecord.habit_data.habits || []).map(normalizeHabit)
        });
      }
    }
  }, [habitRecord]);
  
  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (habitRecord) {
        return await base44.entities.HabitProgress.update(habitRecord.id, { habit_data: data });
      } else {
        return await base44.entities.HabitProgress.create({ habit_data: data });
      }
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['habitProgress'] });
      const prev = queryClient.getQueryData(['habitProgress']);
      queryClient.setQueryData(['habitProgress'], habitRecord ? { ...habitRecord, habit_data: data } : { id: 'optimistic-habit-progress', habit_data: data });
      return { prev };
    },
    onError: (err, data, ctx) => {
      if (ctx?.prev !== undefined) queryClient.setQueryData(['habitProgress'], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['habitProgress'] });
    }
  });
  
  // Save to database whenever data changes (debounced) — skip on first load
  const isFirstLoad = useRef(true);
  useEffect(() => {
    if (isLoading || habitRecord === undefined) return;
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    const timer = setTimeout(() => {
      saveMutation.mutate(habitsData);
    }, 800);
    return () => clearTimeout(timer);
  }, [habitsData]);

  // Timer effect with alarm
  useEffect(() => {
    const interval = setInterval(() => {
      setHabitsData(prev => {
        let updated = { ...prev, habits: [...prev.habits] };
        let hasChanges = false;

        prev.habits.forEach((habit, hIdx) => {
          if (habit.timer?.status === 'running') {
            hasChanges = true;
            const newElapsed = habit.timer.elapsed_seconds + 1;
            const newRemaining = Math.max(0, (habit.goal * 60) - newElapsed);
            
            updated.habits[hIdx] = {
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
                if (!updated.habits[hIdx].completion_log) {
                  updated.habits[hIdx].completion_log = [];
                }
                updated.habits[hIdx].completion_log.push({
                  date: today,
                  completed: true
                });
                updated.habits[hIdx].streak += 1;
                updated.user_data.total_xp += habit.xp_reward;
                updated.user_data.total_energy += habit.energy_reward;
                updated.habits[hIdx].timer.status = 'stopped';
                
                // Play alarm sound with notification
                playAlarm(habit.name);
              }
            }
          }
        });

        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const playAlarm = (habitName) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800 + (i * 100);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }, i * 400);
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🎉 Habit Complete!', {
        body: `Great job! You completed "${habitName}"`,
        icon: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/de839f697_9EA146BA-906E-4508-B4D9-35794A087FAF.png',
        badge: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/de839f697_9EA146BA-906E-4508-B4D9-35794A087FAF.png',
        vibrate: [200, 100, 200, 100, 200]
      });
    }
  };

  const sendHabitReminder = (habitName) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Habit reminder', {
        body: `Time for ${habitName}`,
        icon: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/de839f697_9EA146BA-906E-4508-B4D9-35794A087FAF.png',
      });
    }
  };
  
  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = format(new Date(), 'HH:mm');
      const today = format(new Date(), 'yyyy-MM-dd');

      setHabitsData((prev) => {
        let changed = false;
        const habits = prev.habits.map((habit) => {
          const isCompleted = (habit.completion_log || []).some((log) => log.date === today);
          if (
            habit.reminder_enabled &&
            habit.reminder_time === now &&
            habit.last_reminder_date !== today &&
            !isCompleted
          ) {
            changed = true;
            sendHabitReminder(habit.name);
            return { ...habit, last_reminder_date: today };
          }
          return habit;
        });

        return changed ? { ...prev, habits } : prev;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);
  


  const toggleTimer = (habitId) => {
    const habitIdx = habitsData.habits.findIndex(h => h.id === habitId);
    const habit = habitsData.habits[habitIdx];
    setActiveTimerView({ habitIdx, habit });
  };
  
  const updateTimerHabit = (habitIdx, updates) => {
    setHabitsData(prev => {
      const updated = { ...prev, habits: [...prev.habits] };
      const habit = updated.habits[habitIdx];
      
      Object.keys(updates).forEach(key => {
        habit[key] = updates[key];
      });
      
      return updated;
    });
  };

  const toggleCheckHabit = (habitId) => {
    setHabitsData(prev => {
      const updated = { ...prev, habits: [...prev.habits] };
      const habit = updated.habits.find(h => h.id === habitId);
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStreakBadge = (streak) => {
    if (streak >= 30) return '🏆';
    if (streak >= 14) return '💎';
    if (streak >= 7) return '🔥';
    return null;
  };

  const maxStreak = Math.max(...(habitsData.habits.map(h => h.streak || 0)));

  const handleSaveHabit = async (habitForm) => {
    if (habitForm.reminder_enabled && 'Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (editingHabit) {
      setHabitsData((prev) => ({
        ...prev,
        habits: prev.habits.map((habit) => habit.id === editingHabit.id ? normalizeHabit({
          ...habit,
          name: habitForm.name,
          icon: habitForm.icon,
          goal: habitForm.goal,
          unit: habitForm.unit,
          color: habitForm.color,
          reminder_enabled: habitForm.reminder_enabled,
          reminder_time: habitForm.reminder_time,
          progress: { ...habit.progress, type: habitForm.type },
          timer: habitForm.type === 'timer'
            ? {
                status: habit.timer?.status || 'stopped',
                elapsed_seconds: habit.timer?.elapsed_seconds || 0,
                remaining_seconds: Math.max((habitForm.goal * 60) - (habit.timer?.elapsed_seconds || 0), 0),
              }
            : undefined,
        }) : habit),
      }));
      setEditingHabit(null);
      return;
    }

    setHabitsData(prev => {
      const habitId = `hbt_${habitForm.name.toLowerCase().replace(/\s/g, '')}_${Date.now().toString(36)}`;
      const newHabitData = normalizeHabit({
        id: habitId,
        name: habitForm.name,
        icon: habitForm.icon,
        goal: habitForm.goal,
        unit: habitForm.unit,
        progress: { type: habitForm.type, value: 0 },
        streak: 0,
        xp_reward: habitForm.type === 'timer' ? 15 : 5,
        energy_reward: habitForm.type === 'timer' ? 4 : 2,
        completion_log: [],
        color: habitForm.color,
        reminder_enabled: habitForm.reminder_enabled,
        reminder_time: habitForm.reminder_time,
      });

      if (habitForm.type === 'timer') {
        newHabitData.timer = {
          status: 'stopped',
          elapsed_seconds: 0,
          remaining_seconds: habitForm.goal * 60,
        };
      }

      return {
        ...prev,
        habits: [...prev.habits, newHabitData],
      };
    });

    setShowAddDialog(false);
  };

  const deleteHabit = (habitId) => {
    setHabitsData(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== habitId)
    }));
  };

  if (isLoading) {
    return (
      <CosmicBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Loading your habits...</p>
          </div>
        </div>
      </CosmicBackground>
    );
  }

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['habitProgress'] });
  };

  return (
    <PremiumGate featureId="habits">
    <CosmicBackground>
      <PullToRefresh onRefresh={handleRefresh} className="min-h-screen pb-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-6 py-4 sticky top-0 z-50 bg-gradient-to-b from-[#0a0118] to-transparent backdrop-blur-sm"
        >
          <div className="w-10" />
          <h1 className="text-xl font-bold text-white">Habit Tracker</h1>
          <button 
            onClick={() => setShowAddDialog(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 flex items-center justify-center hover:scale-110 transition-transform"
          >
            <PlusCircle className="w-5 h-5 text-white" />
          </button>
        </motion.header>

        <div className="px-6 pb-32">
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
                      <span className="text-2xl">🔥</span>
                      <span className="text-xl font-bold">{maxStreak}</span>
                    </div>
                    <p className="text-xs text-white/50">Max Streak</p>
                  </div>
                  
                  <div className="w-px h-10 bg-white/20" />
                  
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-purple-400 mb-1">
                      <Award className="w-5 h-5" />
                      <span className="text-lg font-bold">{habitsData.user_data.total_xp}</span>
                    </div>
                    <p className="text-xs text-white/50">Total XP</p>
                  </div>
                  
                  <div className="w-px h-10 bg-white/20" />
                  
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-yellow-400 mb-1">
                      <Zap className="w-5 h-5" />
                      <span className="text-lg font-bold">{habitsData.user_data.total_energy}</span>
                    </div>
                    <p className="text-xs text-white/50">Energy</p>
                  </div>
                </div>
              </div>
            </CosmicCard>
          </motion.div>

          {/* Habits List */}
          <div className="space-y-3">
            <AnimatePresence>
              {habitsData.habits.map((habit, index) => {
                const today = format(new Date(), 'yyyy-MM-dd');
                const isCompleted = (habit.completion_log || []).some(log => log.date === today);
                const progress = (habit.progress.value / habit.goal) * 100;
                
                return (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <CosmicCard 
                      className={`relative overflow-hidden ${isCompleted ? 'border-green-500/50' : ''}`}
                    >
                      {/* Progress bar background */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />

                      <div className="relative">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-2xl">{habit.icon}</span>
                            <div className="flex-1">
                              <h3 className="font-medium text-white">{habit.name}</h3>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <p className="text-xs text-white/50">
                                  {habit.progress.value} / {habit.goal} {habit.unit}
                                </p>
                                {habit.streak > 0 && (
                                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                                    <span>🔥</span>
                                    <span>{habit.streak}</span>
                                  </div>
                                )}
                                {habit.reminder_enabled && (
                                  <div className="flex items-center gap-1 text-cyan-300 text-xs bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-400/20">
                                    <Bell className="w-3 h-3" />
                                    <span>{habit.reminder_time}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
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
                            <button
                              onClick={() => setEditingHabit(habit)}
                              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                            >
                              <Edit className="w-4 h-4 text-white/80" />
                            </button>
                            <button
                              onClick={() => deleteHabit(habit.id)}
                              className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Progress Controls */}
                        {habit.progress.type === 'timer' && (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleTimer(habit.id)}
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
                            onClick={() => toggleCheckHabit(habit.id)}
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
                      </div>
                    </CosmicCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </PullToRefresh>

      <HabitFormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={handleSaveHabit}
        title="Add New Habit"
      />

      <HabitFormDialog
        open={!!editingHabit}
        onOpenChange={(open) => !open && setEditingHabit(null)}
        initialData={editingHabit}
        onSave={handleSaveHabit}
        title="Edit Habit"
      />

      {/* Timer View */}
      <AnimatePresence>
        {activeTimerView && (
          <TimerView
            habit={activeTimerView.habit}
            onClose={() => setActiveTimerView(null)}
            onUpdate={(updates) => {
              updateTimerHabit(activeTimerView.habitIdx, updates);
            }}
          />
        )}
      </AnimatePresence>
    </CosmicBackground>
    </PremiumGate>
  );
}