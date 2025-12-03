import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import CosmicCard from '@/components/cosmic/CosmicCard';
import GlowButton from '@/components/cosmic/GlowButton';
import CosmicInput from '@/components/cosmic/CosmicInput';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, CheckSquare, Flame, Check, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns';

export default function Habits() {
  const [showDialog, setShowDialog] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', frequency: 'daily', color: '#8b5cf6' });
  const queryClient = useQueryClient();

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: () => base44.entities.Habit.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Habit.create({ ...data, completed_dates: [], streak: 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries(['habits']);
      setShowDialog(false);
      setNewHabit({ name: '', frequency: 'daily', color: '#8b5cf6' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Habit.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['habits'])
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Habit.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['habits'])
  });

  const toggleHabitForDate = (habit, date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const completedDates = habit.completed_dates || [];
    const isCompleted = completedDates.includes(dateStr);
    
    let newDates;
    if (isCompleted) {
      newDates = completedDates.filter(d => d !== dateStr);
    } else {
      newDates = [...completedDates, dateStr];
    }
    
    // Calculate streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = format(addDays(today, -i), 'yyyy-MM-dd');
      if (newDates.includes(checkDate)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    updateMutation.mutate({ 
      id: habit.id, 
      data: { completed_dates: newDates, streak } 
    });
  };

  const weekDays = [...Array(7)].map((_, i) => addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i));

  const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  return (
    <CosmicBackground>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-6 py-4 sticky top-0 z-50 bg-gradient-to-b from-[#0a0118] to-transparent"
        >
          <Link to={createPageUrl('Home')} className="flex items-center gap-2 text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Habit Tracker</h1>
          <button 
            onClick={() => setShowDialog(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </motion.header>

        <div className="px-6">
          {/* Week Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">This Week</h2>
              <div className="flex items-center gap-2 text-amber-400">
                <Flame className="w-5 h-5" />
                <span className="font-bold">
                  {habits.reduce((max, h) => Math.max(max, h.streak || 0), 0)} day streak
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="text-center">
                  <p className="text-xs text-white/40 mb-1">{format(day, 'EEE')}</p>
                  <p className={`text-sm font-medium ${isToday(day) ? 'text-purple-400' : 'text-white/70'}`}>
                    {format(day, 'd')}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Habits List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : habits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <CheckSquare className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Habits Yet</h3>
              <p className="text-white/50 mb-6">Build lasting positive routines</p>
              <GlowButton onClick={() => setShowDialog(true)}>
                Create Habit
              </GlowButton>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {habits.map((habit, index) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <CosmicCard className="relative group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: habit.color || '#8b5cf6' }}
                          />
                          <h3 className="font-medium text-white">{habit.name}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {habit.streak > 0 && (
                            <div className="flex items-center gap-1 text-amber-400 text-sm">
                              <Flame className="w-4 h-4" />
                              <span>{habit.streak}</span>
                            </div>
                          )}
                          <button
                            onClick={() => deleteMutation.mutate(habit.id)}
                            className="p-1 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4 text-white/40 hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-2">
                        {weekDays.map((day) => {
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const isCompleted = (habit.completed_dates || []).includes(dateStr);
                          return (
                            <button
                              key={day.toISOString()}
                              onClick={() => toggleHabitForDate(habit, day)}
                              className={`
                                aspect-square rounded-lg flex items-center justify-center transition-all
                                ${isCompleted 
                                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
                                  : 'bg-white/10 hover:bg-white/20'
                                }
                                ${isToday(day) ? 'ring-2 ring-purple-500/50' : ''}
                              `}
                            >
                              {isCompleted && <Check className="w-4 h-4 text-white" />}
                            </button>
                          );
                        })}
                      </div>
                    </CosmicCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Add Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-emerald-500/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                Create Habit
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Habit Name</label>
                <CosmicInput
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  placeholder="e.g., Meditate, Exercise, Read..."
                />
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Color</label>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewHabit({ ...newHabit, color })}
                      className={`
                        w-8 h-8 rounded-full transition-transform
                        ${newHabit.color === color ? 'scale-125 ring-2 ring-white' : ''}
                      `}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <GlowButton
                onClick={() => createMutation.mutate(newHabit)}
                disabled={!newHabit.name || createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Habit'}
              </GlowButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CosmicBackground>
  );
}