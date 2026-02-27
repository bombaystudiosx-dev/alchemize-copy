import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { ArrowLeft, Camera, Sparkles, Plus, SlidersHorizontal } from 'lucide-react';
import PremiumGate from '@/components/subscription/PremiumGate';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import MacroDashboard from '@/components/diet/MacroDashboard';
import WeekCalendar from '@/components/diet/WeekCalendar';
import MealSection from '@/components/diet/MealSection';
import FullScreenScanner from '@/components/diet/FullScreenScanner';
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
  const [showScanner, setShowScanner] = useState(false);
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

  const handleFoodScanned = (foodData) => {
    createFoodMutation.mutate({ ...foodData, meal_type: activeMealType });
  };

  const handleQuickFoodAdd = (foodData) => {
    createFoodMutation.mutate({ ...foodData, meal_type: activeMealType });
  };

  const handleSaveFood = (food) => {
    saveFoodMutation.mutate({
      food_name: food.food_name, serving_description: food.serving_description,
      calories: food.calories, protein_grams: food.protein_grams,
      carb_grams: food.carb_grams, fat_grams: food.fat_grams,
      sugar_grams: food.sugar_grams, fiber_grams: food.fiber_grams, tags: []
    });
  };

  const handleRefresh = () => Promise.all([
    queryClient.invalidateQueries(['foodLogs']),
    queryClient.invalidateQueries(['savedFoods']),
    queryClient.invalidateQueries(['nutritionGoals']),
  ]);

  return (
    <PremiumGate featureId="calories">
    <PullToRefresh onRefresh={handleRefresh} className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#1a0a2e] to-[#0d0620]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0118]/90 backdrop-blur-lg px-5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-white/60" />
          </Link>
          <span className="text-white font-semibold text-sm">Nutrition</span>
          <button
            onClick={() => { setGoalDraft({ ...goals }); setShowGoalsDialog(true); }}
            className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center"
          >
            <SlidersHorizontal className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      <div className="px-5 space-y-5" style={{ paddingBottom: 'calc(140px + env(safe-area-inset-bottom))' }}>
        <WeekCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          dailyData={dailyData}
          calorieGoal={goals.daily_calories}
        />

        <MacroDashboard totals={totals} goals={goals} />

        {/* Quick actions */}
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveMealType('snack'); setShowScanner(true); }}
            className="flex-1 h-12 rounded-xl bg-white flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4 text-black" />
            <span className="text-black text-sm font-semibold">Scan</span>
          </button>
          <button
            onClick={() => setShowMealPlanner(true)}
            className="h-12 w-12 rounded-xl bg-white/[0.06] flex items-center justify-center"
          >
            <Sparkles className="w-4 h-4 text-white/50" />
          </button>
          <button
            onClick={() => { setActiveMealType('snack'); setShowQuickAdd(true); }}
            className="h-12 w-12 rounded-xl bg-white/[0.06] flex items-center justify-center"
          >
            <Plus className="w-4 h-4 text-white/50" />
          </button>
        </div>

        {/* Meals */}
        <div className="space-y-5">
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

      {/* Full screen scanner */}
      <AnimatePresence>
        {showScanner && (
          <FullScreenScanner
            open={showScanner}
            onClose={() => setShowScanner(false)}
            onFoodLogged={handleFoodScanned}
          />
        )}
      </AnimatePresence>

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
        <DialogContent className="bg-[#1a0a2e] border-purple-500/20 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Daily Goals</DialogTitle>
          </DialogHeader>
          {goalDraft && (
            <div className="space-y-3 mt-2">
              {[
                { label: 'Calories', key: 'daily_calories', unit: 'kcal' },
                { label: 'Protein', key: 'daily_protein', unit: 'g' },
                { label: 'Carbs', key: 'daily_carbs', unit: 'g' },
                { label: 'Fat', key: 'daily_fat', unit: 'g' },
              ].map(({ label, key, unit }) => (
                <div key={key}>
                  <label className="text-white/40 text-xs mb-1 block">{label} ({unit})</label>
                  <Input
                    type="number"
                    value={goalDraft[key] || ''}
                    onChange={(e) => setGoalDraft({ ...goalDraft, [key]: parseInt(e.target.value) || 0 })}
                    className="bg-white/[0.08] border-purple-500/20 text-white"
                  />
                </div>
              ))}
              <button
                onClick={() => updateGoalsMutation.mutate(goalDraft)}
                className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm mt-2"
              >
                Save
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PullToRefresh>
    </PremiumGate>
  );
}