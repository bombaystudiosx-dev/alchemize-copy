import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Bookmark, Pencil } from 'lucide-react';

const mealConfig = {
  breakfast: { label: 'Breakfast', time: 'Morning' },
  lunch: { label: 'Lunch', time: 'Afternoon' },
  dinner: { label: 'Dinner', time: 'Evening' },
  snack: { label: 'Snacks', time: 'Anytime' }
};

export default function MealSection({ mealType, foods, onAddFood, onDeleteFood, onSaveFood, onEditFood }) {
  const config = mealConfig[mealType];
  const totalCalories = foods.reduce((sum, f) => sum + (f.calories || 0), 0);

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-white/90 text-sm font-semibold">{config.label}</span>
          {totalCalories > 0 && (
            <span className="text-white/25 text-xs ml-2 tabular-nums">{totalCalories} cal</span>
          )}
        </div>
        <button
          onClick={() => onAddFood(mealType)}
          className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-white/40" />
        </button>
      </div>

      {/* Items */}
      {foods.length > 0 ? (
        <div className="space-y-1">
          {foods.map((food) => (
            <motion.div
              key={food.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-3.5 py-3 group"
            >
              {food.image_url && (
                <img src={food.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white/80 text-sm font-medium truncate">{food.food_name}</p>
                  {food.is_estimated && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-400/20 text-[10px] uppercase tracking-[0.15em] text-purple-200">
                      Estimated
                    </span>
                  )}
                </div>
                {food.serving_description && (
                  <p className="text-white/25 text-[10px] mt-1 truncate">{food.serving_description}</p>
                )}
                <div className="flex gap-3 mt-1">
                  <span className="text-white/20 text-[10px] tabular-nums">P {Math.round(food.protein_grams || 0)}g</span>
                  <span className="text-white/20 text-[10px] tabular-nums">C {Math.round(food.carb_grams || 0)}g</span>
                  <span className="text-white/20 text-[10px] tabular-nums">F {Math.round(food.fat_grams || 0)}g</span>
                </div>
              </div>
              <span className="text-white/50 text-sm font-semibold tabular-nums flex-shrink-0">{Math.round(food.calories)}</span>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                {onEditFood && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onEditFood(food); }}
                    className="p-1.5 text-white/20 hover:text-cyan-300 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                {!food.saved_food_id && onSaveFood && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onSaveFood(food); }}
                    className="p-1.5 text-white/20 hover:text-amber-400 transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteFood(food.id); }}
                  className="p-1.5 text-white/20 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <button
          onClick={() => onAddFood(mealType)}
          className="w-full py-3 rounded-xl border border-dashed border-white/[0.06] text-white/20 text-xs hover:border-white/15 hover:text-white/40 transition-all"
        >
          + Add food
        </button>
      )}
    </div>
  );
}