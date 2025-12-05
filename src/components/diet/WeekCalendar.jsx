import React from 'react';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import ProgressRing from './ProgressRing';

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
    <div className="flex justify-between px-2 py-4 bg-white rounded-2xl shadow-sm">
      {days.map((day) => {
        const dayCalories = dailyData[day.dateStr] || 0;
        const percent = calorieGoal ? (dayCalories / calorieGoal) * 100 : 0;
        
        return (
          <button
            key={day.dateStr}
            onClick={() => onSelectDate(day.dateStr)}
            className={`flex flex-col items-center p-1 rounded-xl transition-all ${
              day.isSelected ? 'bg-green-50' : ''
            }`}
          >
            <span className={`text-xs mb-1 ${day.isToday ? 'font-bold text-green-600' : 'text-gray-400'}`}>
              {day.dayName}
            </span>
            <ProgressRing
              progress={percent}
              size={36}
              strokeWidth={3}
              color={percent > 100 ? '#ef4444' : '#22c55e'}
              bgColor={day.isSelected ? 'rgba(34,197,94,0.2)' : 'rgba(0,0,0,0.05)'}
            >
              <span className={`text-xs font-semibold ${day.isSelected ? 'text-green-600' : 'text-gray-600'}`}>
                {day.dayNum}
              </span>
            </ProgressRing>
          </button>
        );
      })}
    </div>
  );
}