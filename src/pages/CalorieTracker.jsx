import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { ArrowLeft, Camera, Settings, Plus, CalendarDays, BookMarked, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import MacroDashboard from '@/components/diet/MacroDashboard';
import WeekCalendar from '@/components/diet/WeekCalendar';
import MealSection from '@/components/diet/MealSection';
import FoodPhotoAnalyzer from '@/components/diet/FoodPhotoAnalyzer';
import MealPlanDialog from '@/components/diet/MealPlanDialog';

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
  const [showAddFood, setShowAddFood] = useState(false);
  const [showSavedFoods, setShowSavedFoods] = useState(false);
  const [manualFood, setManualFood] = useState({
    food_name: '',
    serving_description: '',
    calories: '',
    protein_grams: '',
    carb_grams: '',
    fat_grams: '',
    sugar_grams: '',
    fiber_grams: ''
  });
  const [showMealPlanner, setShowMealPlanner] = useState(false);

  const queryClient = useQueryClient();

  const { data: foodLogs = [] } = useQuery({
    queryKey: ['foodLogs'],
    queryFn: () => base44.entities.FoodLog.list('-date')
  });

  const { data: savedFoods = [] } = useQuery({
    queryKey: ['savedFoods'],
    queryFn: () => base44.entities.SavedFood.list()
  });

  const { data: goalsData = [] } = useQuery({
    queryKey: ['nutritionGoals'],
    queryFn: () => base44.entities.NutritionGoal.list()
  });

  const goals = goalsData[0] || DEFAULT_GOALS;

  const createFoodMutation = useMutation({
    mutationFn: (data) => base44.entities.FoodLog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['foodLogs']);
      setShowAddFood(false);
      setShowPhotoAnalyzer(false);
      setManualFood({ food_name: '', serving_description: '', calories: '', protein_grams: '', carb_grams: '', fat_grams: '', sugar_grams: '', fiber_grams: '' });
    }
  });

  const deleteFoodMutation = useMutation({
    mutationFn: (id) => base44.entities.FoodLog.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['foodLogs'])
  });

  const saveFoodMutation = useMutation({
    mutationFn: (data) => base44.entities.SavedFood.create(data),
    onSuccess: () => queryClient.invalidateQueries(['savedFoods'])
  });

  const updateGoalsMutation = useMutation({
    mutationFn: (data) => {
      if (goalsData[0]) {
        return base44.entities.NutritionGoal.update(goalsData[0].id, data);
      }
      return base44.entities.NutritionGoal.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['nutritionGoals']);
      setShowGoalsDialog(false);
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
    setShowAddFood(true);
  };

  const handlePhotoAnalyzed = (foodData) => {
    createFoodMutation.mutate({
      ...foodData,
      logged_at: new Date().toISOString(),
      source_type: 'camera'
    });
  };

  const handleManualAdd = () => {
    createFoodMutation.mutate({
      food_name: manualFood.food_name,
      serving_description: manualFood.serving_description || '1 serving',
      calories: parseFloat(manualFood.calories) || 0,
      protein_grams: parseFloat(manualFood.protein_grams) || 0,
      carb_grams: parseFloat(manualFood.carb_grams) || 0,
      fat_grams: parseFloat(manualFood.fat_grams) || 0,
      sugar_grams: parseFloat(manualFood.sugar_grams) || 0,
      fiber_grams: parseFloat(manualFood.fiber_grams) || 0,
      logged_at: new Date().toISOString(),
      source_type: 'manual'
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

  const handleUseSavedFood = (savedFood) => {
    createFoodMutation.mutate({
      food_name: savedFood.food_name,
      serving_description: savedFood.serving_description,
      calories: savedFood.calories,
      protein_grams: savedFood.protein_grams,
      carb_grams: savedFood.carb_grams,
      fat_grams: savedFood.fat_grams,
      sugar_grams: savedFood.sugar_grams,
      fiber_grams: savedFood.fiber_grams,
      logged_at: new Date().toISOString(),
      source_type: 'saved_food',
      saved_food_id: savedFood.id
    });
    setShowSavedFoods(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white px-4 py-4 flex items-center justify-between shadow-sm"
      >
        <Link to={createPageUrl('Home')} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">Nutrition Tracker</h1>
        <button onClick={() => setShowGoalsDialog(true)} className="p-2 -mr-2">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </motion.header>

      <div className="px-4 py-4 space-y-4">
        <WeekCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          dailyData={dailyData}
          calorieGoal={goals.daily_calories}
        />

        <MacroDashboard totals={totals} goals={goals} />

        <div className="grid grid-cols-3 gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveMealType('snack');
              setShowPhotoAnalyzer(true);
            }}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium shadow-lg"
          >
            <Camera className="w-5 h-5" />
            Scan
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowMealPlanner(true)}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium shadow-lg"
          >
            <CalendarDays className="w-5 h-5" />
            Plan
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveMealType('snack');
              setShowSavedFoods(true);
            }}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium shadow-lg"
          >
            <BookMarked className="w-5 h-5" />
            Saved
          </motion.button>
        </div>

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

      <Dialog open={showPhotoAnalyzer} onOpenChange={setShowPhotoAnalyzer}>
        <DialogContent className="bg-white max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-green-600" />
              Scan Food
            </DialogTitle>
          </DialogHeader>
          <FoodPhotoAnalyzer
            onAnalyzed={handlePhotoAnalyzed}
            onClose={() => setShowPhotoAnalyzer(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showAddFood} onOpenChange={setShowAddFood}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Add Food Manually</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Food Name</label>
              <Input placeholder="e.g., Grilled Chicken" value={manualFood.food_name} onChange={(e) => setManualFood({ ...manualFood, food_name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Serving</label>
              <Input placeholder="e.g., 1 cup, 100g" value={manualFood.serving_description} onChange={(e) => setManualFood({ ...manualFood, serving_description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Calories (kcal)</label>
                <Input type="number" placeholder="0" value={manualFood.calories} onChange={(e) => setManualFood({ ...manualFood, calories: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Protein (g)</label>
                <Input type="number" placeholder="0" value={manualFood.protein_grams} onChange={(e) => setManualFood({ ...manualFood, protein_grams: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Carbs (g)</label>
                <Input type="number" placeholder="0" value={manualFood.carb_grams} onChange={(e) => setManualFood({ ...manualFood, carb_grams: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Fat (g)</label>
                <Input type="number" placeholder="0" value={manualFood.fat_grams} onChange={(e) => setManualFood({ ...manualFood, fat_grams: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Sugar (g)</label>
                <Input type="number" placeholder="0" value={manualFood.sugar_grams} onChange={(e) => setManualFood({ ...manualFood, sugar_grams: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Fiber (g)</label>
                <Input type="number" placeholder="0" value={manualFood.fiber_grams} onChange={(e) => setManualFood({ ...manualFood, fiber_grams: e.target.value })} />
              </div>
            </div>
            <button onClick={handleManualAdd} disabled={!manualFood.food_name || !manualFood.calories} className="w-full py-3 rounded-xl bg-green-600 text-white font-medium disabled:opacity-50">
              Add Food
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSavedFoods} onOpenChange={setShowSavedFoods}>
        <DialogContent className="bg-white max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Saved Foods</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 overflow-y-auto max-h-[60vh]">
            {savedFoods.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No saved foods yet</p>
            ) : (
              savedFoods.map(food => (
                <div key={food.id} onClick={() => handleUseSavedFood(food)} className="p-4 rounded-lg border border-gray-200 hover:border-green-500 cursor-pointer transition-all">
                  <p className="font-medium text-gray-900">{food.food_name}</p>
                  <p className="text-sm text-gray-500">{food.serving_description}</p>
                  <div className="flex gap-3 mt-2 text-xs text-gray-600">
                    <span>{food.calories} cal</span>
                    <span>P: {food.protein_grams}g</span>
                    <span>C: {food.carb_grams}g</span>
                    <span>F: {food.fat_grams}g</span>
                    <span>Fiber: {food.fiber_grams}g</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <MealPlanDialog
        open={showMealPlanner}
        onOpenChange={setShowMealPlanner}
        selectedDate={selectedDate}
        onAddFoods={(foodData) => createFoodMutation.mutate(foodData)}
      />

      <Dialog open={showGoalsDialog} onOpenChange={setShowGoalsDialog}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Daily Nutrition Goals</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {[
              { label: 'Calories', key: 'daily_calories' },
              { label: 'Protein (g)', key: 'daily_protein' },
              { label: 'Carbs (g)', key: 'daily_carbs' },
              { label: 'Fat (g)', key: 'daily_fat' },
              { label: 'Sugar (g)', key: 'daily_sugar' },
              { label: 'Fiber (g)', key: 'daily_fiber' }
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-sm text-gray-600 mb-1 block">{label}</label>
                <Input type="number" defaultValue={goals[key]} onChange={(e) => goals[key] = parseInt(e.target.value)} />
              </div>
            ))}
            <button onClick={() => updateGoalsMutation.mutate(goals)} className="w-full py-3 rounded-xl bg-green-600 text-white font-medium">
              Save Goals
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}