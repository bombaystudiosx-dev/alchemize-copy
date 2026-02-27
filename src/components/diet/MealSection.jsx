import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, ChevronDown, ChevronUp } from 'lucide-react';

const mealConfig = {
  breakfast: { emoji: '🌅', label: 'Breakfast', gradient: 'from-orange-500/30 to-amber-500/10' },
  lunch: { emoji: '☀️', label: 'Lunch', gradient: 'from-yellow-500/30 to-amber-500/10' },
  dinner: { emoji: '🌙', label: 'Dinner', gradient: 'from-indigo-500/30 to-purple-500/10' },
  snack: { emoji: '🍎', label: 'Snacks', gradient: 'from-emerald-500/30 to-green-500/10' }
};

export default function MealSection({ mealType, foods, onAddFood, onDeleteFood, onSaveFood }) {
  const config = mealConfig[mealType];
  const totalCalories = foods.reduce((sum, f) => sum + (f.calories || 0), 0);
  const [expanded, setExpanded] = useState(foods.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${config.gradient} backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.emoji}</span>
          <div className="text-left">
            <span className="font-semibold text-white">{config.label}</span>
            <span className="text-xs text-white/40 ml-2">{foods.length} items</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white/70">{totalCalories} cal</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-white/40" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/40" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {foods.length > 0 ? (
                foods.map((food) => (
                  <div key={food.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    {food.image_url && (
                      <img src={food.image_url} alt={food.food_name} className="w-11 h-11 rounded-lg object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{food.food_name}</p>
                      <p className="text-xs text-white/40">{food.serving_description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-white text-sm">{Math.round(food.calories)}</p>
                      <p className="text-[10px] text-white/40">cal</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {!food.saved_food_id && onSaveFood && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onSaveFood(food); }}
                          className="p-1.5 text-white/30 hover:text-amber-400 transition-colors"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteFood(food.id); }}
                        className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/30 text-center py-2">No foods logged</p>
              )}

              <button
                onClick={() => onAddFood(mealType)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/15 text-white/50 hover:text-white/80 hover:border-white/30 transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Food
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}