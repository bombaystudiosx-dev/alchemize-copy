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
import { 
  ArrowLeft, Plus, Dumbbell, Flame, Clock, Trash2, 
  Ruler, Weight, TrendingUp, Activity, User, Award, Zap, Target, Calendar 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  const [showWorkoutDialog, setShowWorkoutDialog] = useState(false);
  const [showMetricsDialog, setShowMetricsDialog] = useState(false);
  const [newWorkout, setNewWorkout] = useState({ 
    type: 'strength', 
    duration_minutes: '', 
    notes: '', 
    date: format(new Date(), 'yyyy-MM-dd'),
    calories_burned: ''
  });
  const [newMetrics, setNewMetrics] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    weight: '',
    waist: '',
    chest: '',
    hips: '',
    arms: '',
    thighs: '',
    body_fat_percentage: '',
    muscle_mass: '',
    notes: ''
  });
  const queryClient = useQueryClient();

  const { data: workouts = [], isLoading: loadingWorkouts } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => base44.entities.Workout.list('-date')
  });

  const { data: metrics = [], isLoading: loadingMetrics } = useQuery({
    queryKey: ['bodyMetrics'],
    queryFn: () => base44.entities.BodyMetrics.list('-date')
  });

  const createWorkoutMutation = useMutation({
    mutationFn: (data) => base44.entities.Workout.create({
      ...data,
      duration_minutes: parseInt(data.duration_minutes),
      calories_burned: data.calories_burned ? parseInt(data.calories_burned) : null
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['workouts']);
      setShowWorkoutDialog(false);
      setNewWorkout({ 
        type: 'strength', 
        duration_minutes: '', 
        notes: '', 
        date: format(new Date(), 'yyyy-MM-dd'),
        calories_burned: ''
      });
    }
  });

  const createMetricsMutation = useMutation({
    mutationFn: (data) => {
      const cleaned = { date: data.date };
      if (data.weight) cleaned.weight = parseFloat(data.weight);
      if (data.waist) cleaned.waist = parseFloat(data.waist);
      if (data.chest) cleaned.chest = parseFloat(data.chest);
      if (data.hips) cleaned.hips = parseFloat(data.hips);
      if (data.arms) cleaned.arms = parseFloat(data.arms);
      if (data.thighs) cleaned.thighs = parseFloat(data.thighs);
      if (data.body_fat_percentage) cleaned.body_fat_percentage = parseFloat(data.body_fat_percentage);
      if (data.muscle_mass) cleaned.muscle_mass = parseFloat(data.muscle_mass);
      if (data.notes) cleaned.notes = data.notes;
      return base44.entities.BodyMetrics.create(cleaned);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bodyMetrics']);
      setShowMetricsDialog(false);
      setNewMetrics({
        date: format(new Date(), 'yyyy-MM-dd'),
        weight: '',
        waist: '',
        chest: '',
        hips: '',
        arms: '',
        thighs: '',
        body_fat_percentage: '',
        muscle_mass: '',
        notes: ''
      });
    }
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: (id) => base44.entities.Workout.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['workouts'])
  });

  const deleteMetricsMutation = useMutation({
    mutationFn: (id) => base44.entities.BodyMetrics.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['bodyMetrics'])
  });

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  
  const thisWeekWorkouts = workouts.filter(w => 
    isWithinInterval(new Date(w.date), { start: weekStart, end: weekEnd })
  );

  const totalMinutes = thisWeekWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
  const totalCalories = thisWeekWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);

  // Calculate streak
  const calculateStreak = () => {
    if (workouts.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
    let checkDate = new Date(today);
    
    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((checkDate - workoutDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0 || diffDays === 1) {
        streak++;
        checkDate = workoutDate;
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  // Personal records
  const personalRecords = {
    longestWorkout: workouts.reduce((max, w) => Math.max(max, w.duration_minutes || 0), 0),
    mostCalories: workouts.reduce((max, w) => Math.max(max, w.calories_burned || 0), 0),
    totalWorkouts: workouts.length
  };

  const latestMetrics = metrics[0];
  const previousMetrics = metrics[1];

  const getChange = (current, previous) => {
    if (!current || !previous) return null;
    const diff = current - previous;
    return { value: Math.abs(diff).toFixed(1), isIncrease: diff > 0 };
  };

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
          <h1 className="text-xl font-bold text-white">Fitness Hub</h1>
          <div className="w-10" />
        </motion.header>

        <Tabs defaultValue="workouts" className="px-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 mb-6">
            <TabsTrigger value="workouts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-600">
              <Dumbbell className="w-4 h-4 mr-2" />
              Workouts
            </TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600">
              <User className="w-4 h-4 mr-2" />
              Body Metrics
            </TabsTrigger>
          </TabsList>

          {/* Workouts Tab */}
          <TabsContent value="workouts">
            {/* Hero Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Performance</h2>
                <GlowButton size="sm" onClick={() => setShowWorkoutDialog(true)}>
                  <Plus className="w-4 h-4" />
                  Log Workout
                </GlowButton>
              </div>

              {/* Streak Card */}
              <CosmicCard className="mb-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl" />
                <div className="relative flex items-center gap-4 p-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Flame className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Current Streak</p>
                    <p className="text-3xl font-bold text-white">{currentStreak} <span className="text-lg text-white/60">days</span></p>
                    <p className="text-xs text-amber-400 mt-1">Keep the momentum going! 🔥</p>
                  </div>
                </div>
              </CosmicCard>
              
              {/* Weekly Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <CosmicCard className="text-center py-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent" />
                  <div className="relative">
                    <Dumbbell className="w-6 h-6 text-red-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{thisWeekWorkouts.length}</p>
                    <p className="text-xs text-white/50">Workouts</p>
                  </div>
                </CosmicCard>
                <CosmicCard className="text-center py-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
                  <div className="relative">
                    <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{totalMinutes}</p>
                    <p className="text-xs text-white/50">Minutes</p>
                  </div>
                </CosmicCard>
                <CosmicCard className="text-center py-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
                  <div className="relative">
                    <Zap className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{totalCalories}</p>
                    <p className="text-xs text-white/50">Calories</p>
                  </div>
                </CosmicCard>
              </div>

              {/* Personal Records */}
              <CosmicCard className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <p className="text-sm font-semibold text-white">Personal Records</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mx-auto mb-2">
                      <Target className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-lg font-bold text-white">{personalRecords.totalWorkouts}</p>
                    <p className="text-xs text-white/40">Total</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-lg font-bold text-white">{personalRecords.longestWorkout}</p>
                    <p className="text-xs text-white/40">Longest (min)</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mx-auto mb-2">
                      <Flame className="w-5 h-5 text-orange-400" />
                    </div>
                    <p className="text-lg font-bold text-white">{personalRecords.mostCalories}</p>
                    <p className="text-xs text-white/40">Max Burn</p>
                  </div>
                </div>
              </CosmicCard>
            </motion.div>

            {/* Workout Log */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Workout History</h2>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <Calendar className="w-3 h-3" />
                  <span>{workouts.length} total sessions</span>
                </div>
              </div>
              
              {loadingWorkouts ? (
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
                  <GlowButton onClick={() => setShowWorkoutDialog(true)}>
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
                         <CosmicCard className="flex items-center gap-4 group hover:scale-[1.01] transition-transform">
                           <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center text-2xl shadow-lg relative`}>
                             <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${type.color} blur-md opacity-50`} />
                             <span className="relative">{type.emoji}</span>
                           </div>
                           <div className="flex-1">
                             <p className="font-semibold text-white capitalize mb-1">{workout.type}</p>
                             <div className="flex items-center gap-3 text-sm">
                               <span className="flex items-center gap-1.5 text-blue-400">
                                 <Clock className="w-3.5 h-3.5" />
                                 <span className="font-medium">{workout.duration_minutes}</span>
                                 <span className="text-white/40">min</span>
                               </span>
                               {workout.calories_burned && (
                                 <span className="flex items-center gap-1.5 text-orange-400">
                                   <Flame className="w-3.5 h-3.5" />
                                   <span className="font-medium">{workout.calories_burned}</span>
                                   <span className="text-white/40">cal</span>
                                 </span>
                               )}
                             </div>
                             {workout.notes && (
                               <p className="text-xs text-white/40 mt-1 line-clamp-1">{workout.notes}</p>
                             )}
                           </div>
                           <div className="text-right flex flex-col items-end gap-1">
                             <p className="text-sm font-medium text-white/70">{format(new Date(workout.date), 'MMM d')}</p>
                             <p className="text-xs text-white/40">{format(new Date(workout.date), 'yyyy')}</p>
                           </div>
                           <button
                             onClick={() => deleteWorkoutMutation.mutate(workout.id)}
                             className="p-2 rounded-full hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all"
                           >
                             <Trash2 className="w-4 h-4 text-red-400" />
                           </button>
                         </CosmicCard>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Body Metrics Tab */}
          <TabsContent value="metrics">
            {/* Current Stats */}
            {latestMetrics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-white/50">Latest Measurements</p>
                  <GlowButton size="sm" onClick={() => setShowMetricsDialog(true)}>
                    <Plus className="w-4 h-4" />
                    Add Metrics
                  </GlowButton>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {latestMetrics.weight && (
                    <CosmicCard className="p-4">
                      <div className="flex items-center gap-3">
                        <Weight className="w-8 h-8 text-purple-400" />
                        <div className="flex-1">
                          <p className="text-xs text-white/50">Weight</p>
                          <p className="text-2xl font-bold text-white">{latestMetrics.weight}</p>
                          {previousMetrics?.weight && (() => {
                            const change = getChange(latestMetrics.weight, previousMetrics.weight);
                            return change && (
                              <p className={`text-xs flex items-center gap-1 ${change.isIncrease ? 'text-orange-400' : 'text-green-400'}`}>
                                <TrendingUp className={`w-3 h-3 ${!change.isIncrease && 'rotate-180'}`} />
                                {change.value} kg
                              </p>
                            );
                          })()}
                        </div>
                      </div>
                    </CosmicCard>
                  )}

                  {latestMetrics.body_fat_percentage && (
                    <CosmicCard className="p-4">
                      <div className="flex items-center gap-3">
                        <Activity className="w-8 h-8 text-blue-400" />
                        <div className="flex-1">
                          <p className="text-xs text-white/50">Body Fat</p>
                          <p className="text-2xl font-bold text-white">{latestMetrics.body_fat_percentage}%</p>
                          {previousMetrics?.body_fat_percentage && (() => {
                            const change = getChange(latestMetrics.body_fat_percentage, previousMetrics.body_fat_percentage);
                            return change && (
                              <p className={`text-xs flex items-center gap-1 ${change.isIncrease ? 'text-orange-400' : 'text-green-400'}`}>
                                <TrendingUp className={`w-3 h-3 ${!change.isIncrease && 'rotate-180'}`} />
                                {change.value}%
                              </p>
                            );
                          })()}
                        </div>
                      </div>
                    </CosmicCard>
                  )}
                </div>

                <CosmicCard className="p-4">
                  <p className="text-sm text-white/70 mb-3 flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-indigo-400" />
                    Body Measurements
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {latestMetrics.waist && (
                      <div>
                        <p className="text-xs text-white/40">Waist</p>
                        <p className="text-lg font-semibold text-white">{latestMetrics.waist} cm</p>
                      </div>
                    )}
                    {latestMetrics.chest && (
                      <div>
                        <p className="text-xs text-white/40">Chest</p>
                        <p className="text-lg font-semibold text-white">{latestMetrics.chest} cm</p>
                      </div>
                    )}
                    {latestMetrics.hips && (
                      <div>
                        <p className="text-xs text-white/40">Hips</p>
                        <p className="text-lg font-semibold text-white">{latestMetrics.hips} cm</p>
                      </div>
                    )}
                    {latestMetrics.arms && (
                      <div>
                        <p className="text-xs text-white/40">Arms</p>
                        <p className="text-lg font-semibold text-white">{latestMetrics.arms} cm</p>
                      </div>
                    )}
                    {latestMetrics.thighs && (
                      <div>
                        <p className="text-xs text-white/40">Thighs</p>
                        <p className="text-lg font-semibold text-white">{latestMetrics.thighs} cm</p>
                      </div>
                    )}
                    {latestMetrics.muscle_mass && (
                      <div>
                        <p className="text-xs text-white/40">Muscle Mass</p>
                        <p className="text-lg font-semibold text-white">{latestMetrics.muscle_mass} kg</p>
                      </div>
                    )}
                  </div>
                </CosmicCard>
              </motion.div>
            )}

            {/* Metrics History */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="text-lg font-semibold text-white mb-4">Measurement History</h2>
              
              {loadingMetrics ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : metrics.length === 0 ? (
                <div className="text-center py-16">
                  <User className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Metrics Yet</h3>
                  <p className="text-white/50 mb-6">Track your body transformation</p>
                  <GlowButton onClick={() => setShowMetricsDialog(true)}>
                    Add Measurements
                  </GlowButton>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {metrics.map((metric, index) => (
                      <motion.div
                        key={metric.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <CosmicCard className="group">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-white font-medium">{format(new Date(metric.date), 'MMMM d, yyyy')}</p>
                            <button
                              onClick={() => deleteMetricsMutation.mutate(metric.id)}
                              className="p-1 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4 text-white/40 hover:text-red-400" />
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            {metric.weight && (
                              <div>
                                <p className="text-white/40">Weight</p>
                                <p className="text-white font-semibold">{metric.weight} kg</p>
                              </div>
                            )}
                            {metric.waist && (
                              <div>
                                <p className="text-white/40">Waist</p>
                                <p className="text-white font-semibold">{metric.waist} cm</p>
                              </div>
                            )}
                            {metric.body_fat_percentage && (
                              <div>
                                <p className="text-white/40">Body Fat</p>
                                <p className="text-white font-semibold">{metric.body_fat_percentage}%</p>
                              </div>
                            )}
                          </div>
                        </CosmicCard>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Workout Dialog */}
        <Dialog open={showWorkoutDialog} onOpenChange={setShowWorkoutDialog}>
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
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-purple-200/70 mb-2 block">Duration (min)</label>
                  <CosmicInput
                    type="number"
                    value={newWorkout.duration_minutes}
                    onChange={(e) => setNewWorkout({ ...newWorkout, duration_minutes: e.target.value })}
                    placeholder="30"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-purple-200/70 mb-2 block">Calories</label>
                  <CosmicInput
                    type="number"
                    value={newWorkout.calories_burned}
                    onChange={(e) => setNewWorkout({ ...newWorkout, calories_burned: e.target.value })}
                    placeholder="200"
                  />
                </div>
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
                onClick={() => createWorkoutMutation.mutate(newWorkout)}
                disabled={!newWorkout.duration_minutes || createWorkoutMutation.isPending}
                className="w-full"
              >
                {createWorkoutMutation.isPending ? 'Logging...' : 'Log Workout'}
              </GlowButton>
            </div>
          </DialogContent>
        </Dialog>

        {/* Body Metrics Dialog */}
        <Dialog open={showMetricsDialog} onOpenChange={setShowMetricsDialog}>
          <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-purple-500/30 text-white max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                Body Measurements
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Date</label>
                <CosmicInput
                  type="date"
                  value={newMetrics.date}
                  onChange={(e) => setNewMetrics({ ...newMetrics, date: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-purple-200/70 mb-2 block">Weight (kg)</label>
                  <CosmicInput
                    type="number"
                    step="0.1"
                    value={newMetrics.weight}
                    onChange={(e) => setNewMetrics({ ...newMetrics, weight: e.target.value })}
                    placeholder="70.5"
                  />
                </div>
                <div>
                  <label className="text-sm text-purple-200/70 mb-2 block">Body Fat %</label>
                  <CosmicInput
                    type="number"
                    step="0.1"
                    value={newMetrics.body_fat_percentage}
                    onChange={(e) => setNewMetrics({ ...newMetrics, body_fat_percentage: e.target.value })}
                    placeholder="20"
                  />
                </div>
              </div>

              <p className="text-xs text-white/40 border-t border-white/10 pt-3">Body Measurements (cm)</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-purple-200/70 mb-2 block">Waist</label>
                  <CosmicInput
                    type="number"
                    step="0.1"
                    value={newMetrics.waist}
                    onChange={(e) => setNewMetrics({ ...newMetrics, waist: e.target.value })}
                    placeholder="80"
                  />
                </div>
                <div>
                  <label className="text-sm text-purple-200/70 mb-2 block">Chest</label>
                  <CosmicInput
                    type="number"
                    step="0.1"
                    value={newMetrics.chest}
                    onChange={(e) => setNewMetrics({ ...newMetrics, chest: e.target.value })}
                    placeholder="95"
                  />
                </div>
                <div>
                  <label className="text-sm text-purple-200/70 mb-2 block">Hips</label>
                  <CosmicInput
                    type="number"
                    step="0.1"
                    value={newMetrics.hips}
                    onChange={(e) => setNewMetrics({ ...newMetrics, hips: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="text-sm text-purple-200/70 mb-2 block">Arms</label>
                  <CosmicInput
                    type="number"
                    step="0.1"
                    value={newMetrics.arms}
                    onChange={(e) => setNewMetrics({ ...newMetrics, arms: e.target.value })}
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="text-sm text-purple-200/70 mb-2 block">Thighs</label>
                  <CosmicInput
                    type="number"
                    step="0.1"
                    value={newMetrics.thighs}
                    onChange={(e) => setNewMetrics({ ...newMetrics, thighs: e.target.value })}
                    placeholder="55"
                  />
                </div>
                <div>
                  <label className="text-sm text-purple-200/70 mb-2 block">Muscle Mass (kg)</label>
                  <CosmicInput
                    type="number"
                    step="0.1"
                    value={newMetrics.muscle_mass}
                    onChange={(e) => setNewMetrics({ ...newMetrics, muscle_mass: e.target.value })}
                    placeholder="45"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Notes</label>
                <Textarea
                  value={newMetrics.notes}
                  onChange={(e) => setNewMetrics({ ...newMetrics, notes: e.target.value })}
                  placeholder="Any observations..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              
              <GlowButton
                onClick={() => createMetricsMutation.mutate(newMetrics)}
                disabled={createMetricsMutation.isPending}
                className="w-full"
              >
                {createMetricsMutation.isPending ? 'Saving...' : 'Save Measurements'}
              </GlowButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CosmicBackground>
  );
}