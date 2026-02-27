import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { ArrowLeft, Camera, Settings, Plus, CalendarDays, Sparkles, X } from 'lucide-react';
import PremiumGate from '@/components/subscription/PremiumGate';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import MacroDashboard from '@/components/diet/MacroDashboard';
import WeekCalendar from '@/components/diet/WeekCalendar';
import MealSection from '@/components/diet/MealSection';
import FoodPhotoAnalyzer from '@/components/diet/FoodPhotoAnalyzer';
import QuickAddSheet from '@/components/diet/QuickAddSheet';
import MealPlanDialog from '@/components/diet/MealPlanDialog';
import PullToRefresh from '@/components/common/PullToRefresh';

const DEFAULT_GOALS = {
  daily_calories: 2000,
  daily_protein: 150,
  daily_carbs: 250,
  daily_fat: 65,
  daily_sugar: 50,
  daily_fiber: 30
};

export default function CalorieTracker() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showPhotoAnalyzer, setShowPhotoAnalyzer] = useState(false);
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);
  const [activeMealType, setActiveMealType] = useState('breakfast');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showMealPlanner, setShowMealPlanner] = useState(false);
  const [goalDraft, setGoalDraft] = useState(null);

  const queryClient = useQueryClient();

  const { data: foodLogs = [] } = useQuery({
    queryKey: ['foodLogs'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.FoodLog.filter({ created_by: user.email }, '-logged_at');
    }
  });

  const { data: savedFoods = [] } = useQuery({
    queryKey: ['savedFoods'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.SavedFood.filter({ created_by: user.email });
    }
  });

  const { data: goalsData = [] } = useQuery({
    queryKey: ['nutritionGoals'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.NutritionGoal.filter({ created_by: user.email });
    }
  });

  const goals = goalsData[0] || DEFAULT_GOALS;

  const createFoodMutation = useMutation({
    mutationFn: (data) => base44.entities.FoodLog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['foodLogs']);
      setShowPhotoAnalyzer(false);
      setShowQuickAdd(false);
    }
  });

  const deleteFoodMutation = useMutation({
    mutationFn: (id) => base44.entities.FoodLog.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['foodLogs'] });
      const prev = queryClient.getQueryData(['foodLogs']);
      queryClient.setQueryData(['foodLogs'], old => (old || []).filter(f => f.id !== id));
      return { prev };
    },
    onError: (err, id, ctx) => { if (ctx?.prev) queryClient.setQueryData(['foodLogs'], ctx.prev); },
    onSettled: () => queryClient.invalidateQueries(['foodLogs'])
  });

  const saveFoodMutation = useMutation({
    mutationFn: (data) => base44.entities.SavedFood.create(data),
    onSuccess: () => queryClient.invalidateQueries(['savedFoods'])
  });

  const updateGoalsMutation = useMutation({
    mutationFn: (data) => {
      if (goalsData[0]) return base44.entities.NutritionGoal.update(goalsData[0].id, data);
      return base44.entities.NutritionGoal.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['nutritionGoals']);
      setShowGoalsDialog(false);
      setGoalDraft(null);
    }
  });

  const todayLogs = useMemo(() => {
    const today = new Date(selectedDate);
    return foodLogs.filter(log => {
      const logDateStr = log.logged_at || log.date;
      if (!logDateStr) return false;
      const logDate = new Date(logDateStr);
      if (isNaN(logDate.getTime())) return false;
      return logDate.toDateString() === today.toDateString();
    });
  }, [foodLogs, selectedDate]);

  const totals = useMemo(() => ({
    calories: todayLogs.reduce((sum, f) => sum + (f.calories || 0), 0),
    protein: todayLogs.reduce((sum, f) => sum + (f.protein_grams || 0), 0),
    carbs: todayLogs.reduce((sum, f) => sum + (f.carb_grams || 0), 0),
    fat: todayLogs.reduce((sum, f) => sum + (f.fat_grams || 0), 0),
    sugar: todayLogs.reduce((sum, f) => sum + (f.sugar_grams || 0), 0),
    fiber: todayLogs.reduce((sum, f) => sum + (f.fiber_grams || 0), 0)
  }), [todayLogs]);

  const dailyData = useMemo(() => {
    const data = {};
    foodLogs.forEach(log => {
      const dateStr = log.logged_at || log.date;
      if (!dateStr) return;
      const logDate = new Date(dateStr);
      if (isNaN(logDate.getTime())) return;
      const dateKey = logDate.toISOString().split('T')[0];
      if (!data[dateKey]) data[dateKey] = 0;
      data[dateKey] += log.calories || 0;
    });
    return data;
  }, [foodLogs]);

  const mealGroups = useMemo(() => ({
    breakfast: todayLogs.filter(l => l.meal_type === 'breakfast'),
    lunch: todayLogs.filter(l => l.meal_type === 'lunch'),
    dinner: todayLogs.filter(l => l.meal_type === 'dinner'),
    snack: todayLogs.filter(l => l.meal_type === 'snack')
  }), [todayLogs]);

  const handleAddFood = (mealType) => {
    setActiveMealType(mealType);
    setShowQuickAdd(true);
  };

  const handlePhotoAnalyzed = (foodData) => {
    createFoodMutation.mutate({
      ...foodData,
      meal_type: activeMealType,
      logged_at: new Date().toISOString(),
      source_type: 'camera'
    });
  };

  const handleQuickFoodAdd = (foodData) => {
    createFoodMutation.mutate({
      ...foodData,
      meal_type: activeMealType,
    });
  };

  const handleSaveFood = (food) => {
    saveFoodMutation.mutate({
      food_name: food.food_name,
      serving_description: food.serving_description,
      calories: food.calories,
      protein_grams: food.protein_grams,
      carb_grams: food.carb_grams,
      fat_grams: food.fat_grams,
      sugar_grams: food.sugar_grams,
      fiber_grams: food.fiber_grams,
      tags: []
    });
  };

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries(['foodLogs']),
      queryClient.invalidateQueries(['savedFoods']),
      queryClient.invalidateQueries(['nutritionGoals']),
    ]);
  };

  return (
    <PremiumGate featureId="calories">
    <PullToRefresh onRefresh={handleRefresh} className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#1a0a2e] to-[#0d0620]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-b from-[#0a0118] to-transparent backdrop-blur-sm px-5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="p-2 -ml-2 rounded-full bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-lg font-bold text-white">Nutrition</h1>
          <button onClick={() => { setGoalDraft({ ...goals }); setShowGoalsDialog(true); }} className="p-2 -mr-2 rounded-full bg-white/10">
            <Settings className="w-5 h-5 text-white/70" />
          </button>
        </div>
      </div>

      <div className="px-5 space-y-4" style={{ paddingBottom: 'calc(120px + env(safe-area-inset-bottom))' }}>
        <WeekCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          dailyData={dailyData}
          calorieGoal={goals.daily_calories}
        />

        <MacroDashboard totals={totals} goals={goals} />

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setActiveMealType('snack');
              setShowPhotoAnalyzer(true);
            }}
            className="flex flex-col items-center gap-1.5 py-4 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-green-600/20 border border-emerald-500/20 text-white"
          >
            <Camera className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-medium">Scan</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMealPlanner(true)}
            className="flex flex-col items-center gap-1.5 py-4 rounded-2xl bg-gradient-to-br from-purple-500/30 to-indigo-600/20 border border-purple-500/20 text-white"
          >
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-medium">AI Plan</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setActiveMealType('snack');
              setShowQuickAdd(true);
            }}
            className="flex flex-col items-center gap-1.5 py-4 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-600/20 border border-amber-500/20 text-white"
          >
            <Plus className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-medium">Add</span>
          </motion.button>
        </div>

        {/* Meals */}
        <div className="space-y-3">
          {(['breakfast', 'lunch', 'dinner', 'snack']).map((mealType) => (
            <MealSection
              key={mealType}
              mealType={mealType}
              foods={mealGroups[mealType]}
              onAddFood={handleAddFood}
              onDeleteFood={(id) => deleteFoodMutation.mutate(id)}
              onSaveFood={handleSaveFood}
            />
          ))}
        </div>
      </div>

      {/* Photo Analyzer Dialog */}
      <Dialog open={showPhotoAnalyzer} onOpenChange={setShowPhotoAnalyzer}>
        <DialogContent className="bg-white max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" />
              Scan Food
            </DialogTitle>
          </DialogHeader>
          <FoodPhotoAnalyzer
            onAnalyzed={handlePhotoAnalyzed}
            onClose={() => setShowPhotoAnalyzer(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Quick Add Sheet */}
      <AnimatePresence>
        {showQuickAdd && (
          <QuickAddSheet
            open={showQuickAdd}
            onClose={() => setShowQuickAdd(false)}
            onAdd={handleQuickFoodAdd}
            savedFoods={savedFoods}
          />
        )}
      </AnimatePresence>

      {/* Meal Planner */}
      <MealPlanDialog
        open={showMealPlanner}
        onOpenChange={setShowMealPlanner}
        selectedDate={selectedDate}
        onAddFoods={(foodData) => createFoodMutation.mutate(foodData)}
      />

      {/* Goals Dialog */}
      <Dialog open={showGoalsDialog} onOpenChange={(o) => { setShowGoalsDialog(o); if (!o) setGoalDraft(null); }}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Daily Goals</DialogTitle>
          </DialogHeader>
          {goalDraft && (
            <div className="space-y-3 mt-3">
              {[
                { label: 'Calories', key: 'daily_calories', unit: 'kcal' },
                { label: 'Protein', key: 'daily_protein', unit: 'g' },
                { label: 'Carbs', key: 'daily_carbs', unit: 'g' },
                { label: 'Fat', key: 'daily_fat', unit: 'g' },
              ].map(({ label, key, unit }) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 mb-1 block">{label} ({unit})</label>
                  <Input
                    type="number"
                    value={goalDraft[key] || ''}
                    onChange={(e) => setGoalDraft({ ...goalDraft, [key]: parseInt(e.target.value) || 0 })}
                  />
                </div>
              ))}
              <button
                onClick={() => updateGoalsMutation.mutate(goalDraft)}
                className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold mt-2"
              >
                Save Goals
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PullToRefresh>
    </PremiumGate>
  );
}