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
import { ArrowLeft, Plus, Dumbbell, Flame, Clock, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format, startOfWeek, isWithinInterval, addDays } from 'date-fns';

const workoutTypes = {
  cardio: { emoji: '🏃', color: 'from-red-500 to-orange-500' },
  strength: { emoji: '💪', color: 'from-blue-500 to-indigo-600' },
  yoga: { emoji: '🧘', color: 'from-purple-500 to-violet-600' },
  hiit: { emoji: '⚡', color: 'from-yellow-500 to-amber-600' },
  stretching: { emoji: '🤸', color: 'from-green-500 to-emerald-600' },
  sports: { emoji: '⚽', color: 'from-cyan-500 to-blue-600' },
  other: { emoji: '🏋️', color: 'from-gray-500 to-slate-600' }
};

export default function Fitness() {
  const [showDialog, setShowDialog] = useState(false);
  const [newWorkout, setNewWorkout] = useState({ 
    type: 'strength', 
    duration_minutes: '', 
    notes: '', 
    date: format(new Date(), 'yyyy-MM-dd'),
    calories_burned: ''
  });
  const queryClient = useQueryClient();

  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => base44.entities.Workout.list('-date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Workout.create({
      ...data,
      duration_minutes: parseInt(data.duration_minutes),
      calories_burned: data.calories_burned ? parseInt(data.calories_burned) : null
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['workouts']);
      setShowDialog(false);
      setNewWorkout({ 
        type: 'strength', 
        duration_minutes: '', 
        notes: '', 
        date: format(new Date(), 'yyyy-MM-dd'),
        calories_burned: ''
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Workout.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['workouts'])
  });

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  
  const thisWeekWorkouts = workouts.filter(w => 
    isWithinInterval(new Date(w.date), { start: weekStart, end: weekEnd })
  );

  const totalMinutes = thisWeekWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
  const totalCalories = thisWeekWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);

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
          <h1 className="text-xl font-bold text-white">Fitness Tracker</h1>
          <button 
            onClick={() => setShowDialog(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-600 flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </motion.header>

        <div className="px-6">
          {/* Weekly Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <p className="text-sm text-white/50 mb-4">This Week</p>
            
            <div className="grid grid-cols-3 gap-3">
              <CosmicCard className="text-center py-4">
                <Dumbbell className="w-5 h-5 text-red-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{thisWeekWorkouts.length}</p>
                <p className="text-xs text-white/50">Workouts</p>
              </CosmicCard>
              <CosmicCard className="text-center py-4">
                <Clock className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{totalMinutes}</p>
                <p className="text-xs text-white/50">Minutes</p>
              </CosmicCard>
              <CosmicCard className="text-center py-4">
                <Flame className="w-5 h-5 text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{totalCalories}</p>
                <p className="text-xs text-white/50">Calories</p>
              </CosmicCard>
            </div>
          </motion.div>

          {/* Workout Log */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-lg font-semibold text-white mb-4">Workout Log</h2>
            
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : workouts.length === 0 ? (
              <div className="text-center py-16">
                <Dumbbell className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Workouts Yet</h3>
                <p className="text-white/50 mb-6">Start your fitness journey</p>
                <GlowButton onClick={() => setShowDialog(true)}>
                  Log Workout
                </GlowButton>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {workouts.map((workout, index) => {
                    const type = workoutTypes[workout.type] || workoutTypes.other;
                    return (
                      <motion.div
                        key={workout.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <CosmicCard className="flex items-center gap-4 group">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center text-2xl`}>
                            {type.emoji}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-white capitalize">{workout.type}</p>
                            <div className="flex items-center gap-3 text-sm text-white/50">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {workout.duration_minutes} min
                              </span>
                              {workout.calories_burned && (
                                <span className="flex items-center gap-1">
                                  <Flame className="w-3 h-3" />
                                  {workout.calories_burned} cal
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-white/70">{format(new Date(workout.date), 'MMM d')}</p>
                          </div>
                          <button
                            onClick={() => deleteMutation.mutate(workout.id)}
                            className="p-1 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4 text-white/40 hover:text-red-400" />
                          </button>
                        </CosmicCard>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        {/* Add Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-red-500/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-red-400" />
                Log Workout
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Workout Type</label>
                <Select
                  value={newWorkout.type}
                  onValueChange={(value) => setNewWorkout({ ...newWorkout, type: value })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a0a2e] border-purple-500/30">
                    {Object.entries(workoutTypes).map(([key, { emoji }]) => (
                      <SelectItem key={key} value={key}>
                        {emoji} {key.charAt(0).toUpperCase() + key.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Duration (minutes)</label>
                <CosmicInput
                  type="number"
                  value={newWorkout.duration_minutes}
                  onChange={(e) => setNewWorkout({ ...newWorkout, duration_minutes: e.target.value })}
                  placeholder="30"
                  icon={Clock}
                />
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Calories Burned (optional)</label>
                <CosmicInput
                  type="number"
                  value={newWorkout.calories_burned}
                  onChange={(e) => setNewWorkout({ ...newWorkout, calories_burned: e.target.value })}
                  placeholder="200"
                  icon={Flame}
                />
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Date</label>
                <CosmicInput
                  type="date"
                  value={newWorkout.date}
                  onChange={(e) => setNewWorkout({ ...newWorkout, date: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Notes</label>
                <Textarea
                  value={newWorkout.notes}
                  onChange={(e) => setNewWorkout({ ...newWorkout, notes: e.target.value })}
                  placeholder="How did it feel?"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              
              <GlowButton
                onClick={() => createMutation.mutate(newWorkout)}
                disabled={!newWorkout.duration_minutes || createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? 'Logging...' : 'Log Workout'}
              </GlowButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CosmicBackground>
  );
}