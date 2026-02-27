import React from 'react';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';

export default function WeekCalendar({ selectedDate, onSelectDate, dailyData, calorieGoal }) {
  const today = new Date();
  const days = [-3, -2, -1, 0, 1, 2, 3].map(offset => {
    const date = offset === 0 ? today : offset > 0 ? addDays(today, offset) : subDays(today, Math.abs(offset));
    return {
      date,
      dateStr: format(date, 'yyyy-MM-dd'),
      dayName: format(date, 'EEE'),
      dayNum: format(date, 'd'),
      isToday: offset === 0,
      isSelected: isSameDay(date, new Date(selectedDate))
    };
  });

  return (
    <div className="flex justify-between gap-1 py-3 px-1 bg-gradient-to-br from-purple-900/30 to-indigo-900/20 backdrop-blur-xl rounded-2xl border border-white/10">
      {days.map((day) => {
        const dayCalories = dailyData[day.dateStr] || 0;
        const pct = calorieGoal ? Math.min((dayCalories / calorieGoal) * 100, 100) : 0;
        
        return (
          <button
            key={day.dateStr}
            onClick={() => onSelectDate(day.dateStr)}
            className={`flex flex-col items-center flex-1 py-2 rounded-xl transition-all ${
              day.isSelected 
                ? 'bg-purple-600/40 border border-purple-400/30' 
                : 'hover:bg-white/5'
            }`}
          >
            <span className={`text-[10px] mb-1 ${day.isToday ? 'font-bold text-purple-300' : 'text-white/40'}`}>
              {day.dayName}
            </span>
            <div className="relative w-9 h-9 flex items-center justify-center">
              {/* Background ring */}
              <svg className="absolute inset-0" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                <circle 
                  cx="18" cy="18" r="15" fill="none" 
                  stroke={pct > 100 ? '#ef4444' : day.isSelected ? '#a855f7' : '#22c55e'} 
                  strokeWidth="3"
                  strokeDasharray={`${pct * 0.94} 100`}
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                  className="transition-all duration-500"
                />
              </svg>
              <span className={`text-xs font-bold relative z-10 ${day.isSelected ? 'text-purple-200' : 'text-white/70'}`}>
                {day.dayNum}
              </span>
            </div>
            {dayCalories > 0 && (
              <span className="text-[9px] text-white/30 mt-0.5">{dayCalories}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}