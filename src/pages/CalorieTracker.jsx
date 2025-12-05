import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { ArrowLeft, Camera, Settings, Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import MacroDashboard from '@/components/diet/MacroDashboard';
import WeekCalendar from '@/components/diet/WeekCalendar';
import MealSection from '@/components/diet/MealSection';
import FoodPhotoAnalyzer from '@/components/diet/FoodPhotoAnalyzer';
import ProgressRing from '@/components/diet/ProgressRing';

const DEFAULT_GOALS = {
  daily_calories: 2000,
  daily_protein: 150,
  daily_carbs: 250,
  daily_fat: 65
};

export default function CalorieTracker() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showPhotoAnalyzer, setShowPhotoAnalyzer] = useState(false);
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);
  const [activeMealType, setActiveMealType] = useState('breakfast');
  const [showAddFood, setShowAddFood] = useState(false);
  const [manualFood, setManualFood] = useState({
    food_name: '',
    portion_size: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  const queryClient = useQueryClient();

  // Fetch food logs
  const { data: foodLogs = [] } = useQuery({
    queryKey: ['foodLogs'],
    queryFn: () => base44.entities.FoodLog.list('-date')
  });

  // Fetch goals
  const { data: goalsData = [] } = useQuery({
    queryKey: ['nutritionGoals'],
    queryFn: () => base44.entities.NutritionGoal.list()
  });

  const goals = goalsData[0] || DEFAULT_GOALS;

  // Mutations
  const createFoodMutation = useMutation({
    mutationFn: (data) => base44.entities.FoodLog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['foodLogs']);
      setShowAddFood(false);
      setShowPhotoAnalyzer(false);
      setManualFood({ food_name: '', portion_size: '', calories: '', protein: '', carbs: '', fat: '' });
    }
  });

  const deleteFoodMutation = useMutation({
    mutationFn: (id) => base44.entities.FoodLog.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['foodLogs'])
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

  // Filter logs by selected date
  const todayLogs = useMemo(() => 
    foodLogs.filter(log => log.date === selectedDate),
    [foodLogs, selectedDate]
  );

  // Calculate totals
  const totals = useMemo(() => ({
    calories: todayLogs.reduce((sum, f) => sum + (f.calories || 0), 0),
    protein: todayLogs.reduce((sum, f) => sum + (f.protein || 0), 0),
    carbs: todayLogs.reduce((sum, f) => sum + (f.carbs || 0), 0),
    fat: todayLogs.reduce((sum, f) => sum + (f.fat || 0), 0)
  }), [todayLogs]);

  // Daily data for calendar
  const dailyData = useMemo(() => {
    const data = {};
    foodLogs.forEach(log => {
      if (!data[log.date]) data[log.date] = 0;
      data[log.date] += log.calories || 0;
    });
    return data;
  }, [foodLogs]);

  // Group by meal type
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
      date: selectedDate,
      meal_type: activeMealType,
      food_name: foodData.food_name,
      portion_size: foodData.portion_size,
      calories: foodData.calories,
      protein: foodData.protein,
      carbs: foodData.carbs,
      fat: foodData.fat,
      image_url: foodData.image_url
    });
  };

  const handleManualAdd = () => {
    createFoodMutation.mutate({
      date: selectedDate,
      meal_type: activeMealType,
      food_name: manualFood.food_name,
      portion_size: manualFood.portion_size || '1 serving',
      calories: parseInt(manualFood.calories) || 0,
      protein: parseInt(manualFood.protein) || 0,
      carbs: parseInt(manualFood.carbs) || 0,
      fat: parseInt(manualFood.fat) || 0
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white px-4 py-4 flex items-center justify-between shadow-sm"
      >
        <Link to={createPageUrl('Home')} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">Calorie Tracker</h1>
        <button onClick={() => setShowGoalsDialog(true)} className="p-2 -mr-2">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </motion.header>

      <div className="px-4 py-4 space-y-4">
        {/* Week Calendar */}
        <WeekCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          dailyData={dailyData}
          calorieGoal={goals.daily_calories}
        />

        {/* Macro Dashboard */}
        <MacroDashboard totals={totals} goals={goals} />

        {/* Quick Add Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setActiveMealType('snack');
            setShowPhotoAnalyzer(true);
          }}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium shadow-lg shadow-green-500/30"
        >
          <Camera className="w-5 h-5" />
          Snap Your Food
        </motion.button>

        {/* Meal Sections */}
        <div className="space-y-3">
          {(['breakfast', 'lunch', 'dinner', 'snack']).map((mealType) => (
            <MealSection
              key={mealType}
              mealType={mealType}
              foods={mealGroups[mealType]}
              onAddFood={handleAddFood}
              onDeleteFood={(id) => deleteFoodMutation.mutate(id)}
            />
          ))}
        </div>
      </div>

      {/* Photo Analyzer Dialog */}
      <Dialog open={showPhotoAnalyzer} onOpenChange={setShowPhotoAnalyzer}>
        <DialogContent className="bg-white max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-green-600" />
              Analyze Food
            </DialogTitle>
          </DialogHeader>
          <FoodPhotoAnalyzer
            onAnalyzed={handlePhotoAnalyzed}
            onClose={() => setShowPhotoAnalyzer(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Add Food Dialog */}
      <Dialog open={showAddFood} onOpenChange={setShowAddFood}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Add Food</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <button
              onClick={() => {
                setShowAddFood(false);
                setShowPhotoAnalyzer(true);
              }}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium"
            >
              <Camera className="w-5 h-5" />
              Take Photo
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or add manually</span>
              </div>
            </div>

            <Input
              placeholder="Food name"
              value={manualFood.food_name}
              onChange={(e) => setManualFood({ ...manualFood, food_name: e.target.value })}
            />
            <Input
              placeholder="Portion size (e.g., 1 cup)"
              value={manualFood.portion_size}
              onChange={(e) => setManualFood({ ...manualFood, portion_size: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Calories"
                value={manualFood.calories}
                onChange={(e) => setManualFood({ ...manualFood, calories: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Protein (g)"
                value={manualFood.protein}
                onChange={(e) => setManualFood({ ...manualFood, protein: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Carbs (g)"
                value={manualFood.carbs}
                onChange={(e) => setManualFood({ ...manualFood, carbs: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Fat (g)"
                value={manualFood.fat}
                onChange={(e) => setManualFood({ ...manualFood, fat: e.target.value })}
              />
            </div>
            <button
              onClick={handleManualAdd}
              disabled={!manualFood.food_name || !manualFood.calories}
              className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium disabled:opacity-50"
            >
              Add Food
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goals Dialog */}
      <Dialog open={showGoalsDialog} onOpenChange={setShowGoalsDialog}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Daily Goals</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Daily Calories</label>
              <Input
                type="number"
                defaultValue={goals.daily_calories}
                onChange={(e) => goals.daily_calories = parseInt(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Protein (g)</label>
              <Input
                type="number"
                defaultValue={goals.daily_protein}
                onChange={(e) => goals.daily_protein = parseInt(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Carbs (g)</label>
              <Input
                type="number"
                defaultValue={goals.daily_carbs}
                onChange={(e) => goals.daily_carbs = parseInt(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Fat (g)</label>
              <Input
                type="number"
                defaultValue={goals.daily_fat}
                onChange={(e) => goals.daily_fat = parseInt(e.target.value)}
              />
            </div>
            <button
              onClick={() => updateGoalsMutation.mutate({
                daily_calories: goals.daily_calories,
                daily_protein: goals.daily_protein,
                daily_carbs: goals.daily_carbs,
                daily_fat: goals.daily_fat
              })}
              className="w-full py-3 rounded-xl bg-green-600 text-white font-medium"
            >
              Save Goals
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}