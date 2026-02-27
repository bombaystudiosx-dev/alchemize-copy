import React from 'react';
import { motion } from 'framer-motion';
import ProgressRing from './ProgressRing';

export default function MacroDashboard({ totals, goals }) {
  const caloriePercent = goals.daily_calories ? (totals.calories / goals.daily_calories) * 100 : 0;
  const remaining = Math.round(goals.daily_calories - totals.calories);

  const macros = [
    { label: 'Protein', value: totals.protein, goal: goals.daily_protein, color: '#f97316', bg: 'from-orange-500/20 to-orange-600/10' },
    { label: 'Carbs', value: totals.carbs, goal: goals.daily_carbs, color: '#3b82f6', bg: 'from-blue-500/20 to-blue-600/10' },
    { label: 'Fat', value: totals.fat, goal: goals.daily_fat, color: '#eab308', bg: 'from-yellow-500/20 to-yellow-600/10' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-900/40 to-indigo-900/30 backdrop-blur-xl rounded-3xl p-5 border border-white/10"
    >
      {/* Main Calorie Ring */}
      <div className="flex justify-center mb-4">
        <ProgressRing 
          progress={caloriePercent} 
          size={150} 
          strokeWidth={14}
          color={caloriePercent > 100 ? '#ef4444' : '#a855f7'}
          bgColor="rgba(255,255,255,0.08)"
        >
          <div className="text-center">
            <p className="text-4xl font-bold text-white">{Math.round(totals.calories)}</p>
            <p className="text-xs text-purple-300/70">of {goals.daily_calories} kcal</p>
          </div>
        </ProgressRing>
      </div>

      <div className="text-center mb-5">
        <p className={`text-sm font-medium ${remaining > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {remaining > 0 
            ? `${remaining} kcal remaining`
            : `${Math.abs(remaining)} kcal over`
          }
        </p>
      </div>

      {/* Macro Bars */}
      <div className="space-y-3">
        {macros.map((macro) => {
          const pct = macro.goal ? Math.min((macro.value / macro.goal) * 100, 100) : 0;
          return (
            <div key={macro.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/70 font-medium">{macro.label}</span>
                <span className="text-xs text-white/50">
                  {Math.round(macro.value)}g / {macro.goal}g
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: macro.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}