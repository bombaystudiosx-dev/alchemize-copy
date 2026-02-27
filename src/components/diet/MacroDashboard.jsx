import React from 'react';
import { motion } from 'framer-motion';

export default function MacroDashboard({ totals, goals }) {
  const caloriePercent = goals.daily_calories ? Math.min((totals.calories / goals.daily_calories) * 100, 100) : 0;
  const remaining = Math.round(goals.daily_calories - totals.calories);

  const macros = [
    { label: 'Protein', value: totals.protein, goal: goals.daily_protein, color: '#22d3ee' },
    { label: 'Carbs', value: totals.carbs, goal: goals.daily_carbs, color: '#a78bfa' },
    { label: 'Fat', value: totals.fat, goal: goals.daily_fat, color: '#fbbf24' },
  ];

  const circumference = 2 * Math.PI * 58;
  const offset = circumference - (caloriePercent / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06]"
    >
      <div className="flex items-center gap-6">
        {/* Ring */}
        <div className="relative flex-shrink-0 w-[132px] h-[132px]">
          <svg viewBox="0 0 132 132" className="w-full h-full -rotate-90">
            <circle cx="66" cy="66" r="58" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <motion.circle
              cx="66" cy="66" r="58"
              fill="none"
              stroke={totals.calories > goals.daily_calories ? '#ef4444' : '#fff'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white tabular-nums leading-none">
              {Math.round(totals.calories)}
            </span>
            <span className="text-[10px] text-white/30 mt-0.5 uppercase tracking-wider">
              of {goals.daily_calories}
            </span>
          </div>
        </div>

        {/* Macros */}
        <div className="flex-1 space-y-3">
          {macros.map((macro) => {
            const pct = macro.goal ? Math.min((macro.value / macro.goal) * 100, 100) : 0;
            return (
              <div key={macro.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-white/40 font-medium">{macro.label}</span>
                  <span className="text-[11px] text-white/60 tabular-nums font-medium">
                    {Math.round(macro.value)}<span className="text-white/25">/{macro.goal}g</span>
                  </span>
                </div>
                <div className="h-[5px] bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: macro.color }}
                  />
                </div>
              </div>
            );
          })}
          <p className={`text-xs font-medium mt-1 ${remaining > 0 ? 'text-white/30' : 'text-red-400/80'}`}>
            {remaining > 0 ? `${remaining} cal left` : `${Math.abs(remaining)} cal over`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}