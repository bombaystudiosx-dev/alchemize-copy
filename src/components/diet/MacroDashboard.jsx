import React from 'react';
import { motion } from 'framer-motion';
import ProgressRing from './ProgressRing';

export default function MacroDashboard({ totals, goals }) {
  const caloriePercent = goals.daily_calories ? (totals.calories / goals.daily_calories) * 100 : 0;
  const proteinPercent = goals.daily_protein ? (totals.protein / goals.daily_protein) * 100 : 0;
  const carbsPercent = goals.daily_carbs ? (totals.carbs / goals.daily_carbs) * 100 : 0;
  const fatPercent = goals.daily_fat ? (totals.fat / goals.daily_fat) * 100 : 0;

  const macros = [
    { label: 'Protein', value: totals.protein, goal: goals.daily_protein, percent: proteinPercent, color: '#f97316', unit: 'g' },
    { label: 'Carbs', value: totals.carbs, goal: goals.daily_carbs, percent: carbsPercent, color: '#3b82f6', unit: 'g' },
    { label: 'Fat', value: totals.fat, goal: goals.daily_fat, percent: fatPercent, color: '#eab308', unit: 'g' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 shadow-lg"
    >
      {/* Main Calorie Ring */}
      <div className="flex justify-center mb-6">
        <ProgressRing 
          progress={caloriePercent} 
          size={140} 
          strokeWidth={12}
          color={caloriePercent > 100 ? '#ef4444' : '#22c55e'}
          bgColor="rgba(0,0,0,0.05)"
        >
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800">{Math.round(totals.calories)}</p>
            <p className="text-xs text-gray-500">/ {goals.daily_calories} kcal</p>
          </div>
        </ProgressRing>
      </div>

      {/* Remaining */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-500">
          {goals.daily_calories - totals.calories > 0 
            ? `${Math.round(goals.daily_calories - totals.calories)} kcal remaining`
            : `${Math.round(totals.calories - goals.daily_calories)} kcal over`
          }
        </p>
      </div>

      {/* Macro Rings */}
      <div className="flex justify-around">
        {macros.map((macro) => (
          <div key={macro.label} className="text-center">
            <ProgressRing 
              progress={macro.percent} 
              size={60} 
              strokeWidth={6}
              color={macro.color}
              bgColor="rgba(0,0,0,0.05)"
            >
              <span className="text-xs font-semibold text-gray-700">{Math.round(macro.value)}</span>
            </ProgressRing>
            <p className="text-xs text-gray-500 mt-2">{macro.label}</p>
            <p className="text-xs text-gray-400">{macro.goal}{macro.unit}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}