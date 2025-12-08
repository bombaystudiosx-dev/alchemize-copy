import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, AlertCircle } from 'lucide-react';

const mealConfig = {
  breakfast: { emoji: '🌅', label: 'Breakfast', color: 'from-orange-400 to-yellow-500' },
  lunch: { emoji: '☀️', label: 'Lunch', color: 'from-yellow-400 to-amber-500' },
  dinner: { emoji: '🌙', label: 'Dinner', color: 'from-indigo-400 to-purple-500' },
  snack: { emoji: '🍎', label: 'Snacks', color: 'from-green-400 to-emerald-500' }
};

export default function MealSection({ mealType, foods, onAddFood, onDeleteFood, onSaveFood }) {
  const config = mealConfig[mealType];
  const totalCalories = foods.reduce((sum, f) => sum + (f.calories || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.emoji}</span>
          <span className="font-semibold text-gray-800">{config.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{totalCalories} cal</span>
          <button
            onClick={() => onAddFood(mealType)}
            className={`p-2 rounded-full bg-gradient-to-r ${config.color} text-white`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {foods.length > 0 ? (
        <div className="space-y-2">
          {foods.map((food) => (
            <div key={food.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
              {food.image_url && (
                <img src={food.image_url} alt={food.food_name} className="w-12 h-12 rounded-lg object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{food.food_name}</p>
                <p className="text-xs text-gray-500">{food.portion_size}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800">{food.calories}</p>
                <p className="text-xs text-gray-400">cal</p>
              </div>
              <button
                onClick={() => onDeleteFood(food.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-2">No foods logged yet</p>
      )}
    </motion.div>
  );
}