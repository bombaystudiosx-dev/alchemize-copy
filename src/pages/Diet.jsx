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
import { ArrowLeft, Plus, Apple, Coffee, Sun, Moon, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { format, addDays, subDays } from 'date-fns';

const mealIcons = {
  breakfast: { icon: Coffee, emoji: '☀️', label: 'Breakfast' },
  lunch: { icon: Sun, emoji: '🌤️', label: 'Lunch' },
  dinner: { icon: Moon, emoji: '🌙', label: 'Dinner' },
  snacks: { icon: Apple, emoji: '🍎', label: 'Snacks' }
};

export default function Diet() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showDialog, setShowDialog] = useState(false);
  const [newMealPlan, setNewMealPlan] = useState({ 
    date: selectedDate,
    breakfast: '',
    lunch: '',
    dinner: '',
    snacks: '',
    total_calories: '',
    notes: ''
  });
  const queryClient = useQueryClient();

  const { data: mealPlans = [], isLoading } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: () => base44.entities.MealPlan.list('-date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MealPlan.create({
      ...data,
      total_calories: data.total_calories ? parseInt(data.total_calories) : null
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['mealPlans']);
      setShowDialog(false);
      setNewMealPlan({ 
        date: selectedDate,
        breakfast: '',
        lunch: '',
        dinner: '',
        snacks: '',
        total_calories: '',
        notes: ''
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MealPlan.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['mealPlans'])
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MealPlan.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['mealPlans'])
  });

  const currentPlan = mealPlans.find(p => p.date === selectedDate);

  const openAddDialog = () => {
    setNewMealPlan({
      date: selectedDate,
      breakfast: currentPlan?.breakfast || '',
      lunch: currentPlan?.lunch || '',
      dinner: currentPlan?.dinner || '',
      snacks: currentPlan?.snacks || '',
      total_calories: currentPlan?.total_calories?.toString() || '',
      notes: currentPlan?.notes || ''
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (currentPlan) {
      updateMutation.mutate({ id: currentPlan.id, data: { 
        ...newMealPlan, 
        total_calories: newMealPlan.total_calories ? parseInt(newMealPlan.total_calories) : null 
      }});
    } else {
      createMutation.mutate(newMealPlan);
    }
  };

  const days = [-2, -1, 0, 1, 2].map(offset => {
    const date = offset === 0 ? new Date() : offset > 0 ? addDays(new Date(), offset) : subDays(new Date(), Math.abs(offset));
    return {
      date: format(date, 'yyyy-MM-dd'),
      dayName: format(date, 'EEE'),
      dayNum: format(date, 'd'),
      isToday: offset === 0
    };
  });

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
          <h1 className="text-xl font-bold text-white">Diet Planner</h1>
          <button 
            onClick={openAddDialog}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-lime-500 to-green-600 flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </motion.header>

        <div className="px-6">
          {/* Date Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-2 mb-8"
          >
            {days.map((day) => (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={`
                  flex flex-col items-center p-3 rounded-xl transition-all min-w-[60px]
                  ${selectedDate === day.date 
                    ? 'bg-gradient-to-br from-lime-500 to-green-600 text-white' 
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }
                `}
              >
                <span className="text-xs">{day.dayName}</span>
                <span className="text-lg font-bold">{day.dayNum}</span>
              </button>
            ))}
          </motion.div>

          {/* Meal Plan */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {currentPlan ? (
              <>
                {Object.entries(mealIcons).map(([key, { emoji, label }]) => (
                  <CosmicCard key={key} className="group">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{emoji}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-1">{label}</h3>
                        <p className="text-sm text-white/70">
                          {currentPlan[key] || 'Not planned yet'}
                        </p>
                      </div>
                    </div>
                  </CosmicCard>
                ))}

                {currentPlan.total_calories && (
                  <CosmicCard className="text-center py-4">
                    <p className="text-sm text-white/50 mb-1">Total Calories</p>
                    <p className="text-2xl font-bold text-lime-400">{currentPlan.total_calories} kcal</p>
                  </CosmicCard>
                )}

                <div className="flex gap-2">
                  <GlowButton onClick={openAddDialog} className="flex-1">
                    Edit Plan
                  </GlowButton>
                  <button
                    onClick={() => deleteMutation.mutate(currentPlan.id)}
                    className="p-3 rounded-xl bg-white/10 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-white/60 hover:text-red-400" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <Apple className="w-12 h-12 text-lime-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Plan for This Day</h3>
                <p className="text-white/50 mb-6">Plan your meals mindfully</p>
                <GlowButton onClick={openAddDialog}>
                  Create Meal Plan
                </GlowButton>
              </div>
            )}
          </motion.div>

          {/* Recent Plans */}
          {!isLoading && mealPlans.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8"
            >
              <h2 className="text-lg font-semibold text-white mb-4">Recent Plans</h2>
              <div className="space-y-2">
                {mealPlans.slice(0, 5).filter(p => p.date !== selectedDate).map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedDate(plan.date)}
                    className="w-full text-left"
                  >
                    <CosmicCard className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{format(new Date(plan.date), 'EEEE, MMM d')}</p>
                          <p className="text-xs text-white/50">
                            {[plan.breakfast, plan.lunch, plan.dinner].filter(Boolean).length}/3 meals planned
                          </p>
                        </div>
                        {plan.total_calories && (
                          <span className="text-lime-400 font-medium">{plan.total_calories} kcal</span>
                        )}
                      </div>
                    </CosmicCard>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-lime-500/30 text-white max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Apple className="w-5 h-5 text-lime-400" />
                {currentPlan ? 'Edit Meal Plan' : 'Create Meal Plan'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">☀️ Breakfast</label>
                <Textarea
                  value={newMealPlan.breakfast}
                  onChange={(e) => setNewMealPlan({ ...newMealPlan, breakfast: e.target.value })}
                  placeholder="What's for breakfast?"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">🌤️ Lunch</label>
                <Textarea
                  value={newMealPlan.lunch}
                  onChange={(e) => setNewMealPlan({ ...newMealPlan, lunch: e.target.value })}
                  placeholder="What's for lunch?"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">🌙 Dinner</label>
                <Textarea
                  value={newMealPlan.dinner}
                  onChange={(e) => setNewMealPlan({ ...newMealPlan, dinner: e.target.value })}
                  placeholder="What's for dinner?"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">🍎 Snacks</label>
                <Textarea
                  value={newMealPlan.snacks}
                  onChange={(e) => setNewMealPlan({ ...newMealPlan, snacks: e.target.value })}
                  placeholder="Any snacks?"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Total Calories (optional)</label>
                <CosmicInput
                  type="number"
                  value={newMealPlan.total_calories}
                  onChange={(e) => setNewMealPlan({ ...newMealPlan, total_calories: e.target.value })}
                  placeholder="2000"
                />
              </div>
              
              <GlowButton
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Plan'}
              </GlowButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CosmicBackground>
  );
}