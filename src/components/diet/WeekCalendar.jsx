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
      isSelected: format(date, 'yyyy-MM-dd') === selectedDate
    };
  });

  return (
    <div className="flex gap-1.5">
      {days.map((day) => {
        const dayCalories = dailyData[day.dateStr] || 0;
        const pct = calorieGoal ? Math.min((dayCalories / calorieGoal) * 100, 100) : 0;
        const hasData = dayCalories > 0;
        
        return (
          <button
            key={day.dateStr}
            onClick={() => onSelectDate(day.dateStr)}
            className={`flex flex-col items-center flex-1 py-2.5 rounded-xl transition-all ${
              day.isSelected 
                ? 'bg-white/[0.08]' 
                : ''
            }`}
          >
            <span className={`text-[10px] mb-1.5 ${day.isToday ? 'text-white/60 font-semibold' : 'text-white/25'}`}>
              {day.isToday ? 'Today' : day.dayName.charAt(0)}
            </span>
            <span className={`text-sm font-semibold ${day.isSelected ? 'text-white' : 'text-white/50'}`}>
              {day.dayNum}
            </span>
            {/* Dot indicator */}
            <div className={`w-1 h-1 rounded-full mt-1.5 transition-all ${
              hasData 
                ? pct >= 80 ? 'bg-emerald-400' : 'bg-white/30'
                : 'bg-transparent'
            }`} />
          </button>
        );
      })}
    </div>
  );
}