import React from 'react';
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import MonthNavigator from '@/components/common/MonthNavigator';

export default function AppointmentMonthCalendar({ currentMonth, setCurrentMonth, appointments, onDaySelect }) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const today = new Date();

  const getCount = (day) => appointments.filter((item) => isSameDay(new Date(item.date), day)).length;

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-4">
      <MonthNavigator
        currentMonth={currentMonth}
        onPrev={() => setCurrentMonth(subMonths(currentMonth, 1))}
        onNext={() => setCurrentMonth(addMonths(currentMonth, 1))}
      />
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-white/40 uppercase tracking-[0.15em]">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-1">{day.slice(0, 1)}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const count = getCount(day);
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isToday = isSameDay(day, today);
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onDaySelect(format(day, 'yyyy-MM-dd'))}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs transition-all ${isCurrentMonth ? 'text-white' : 'text-white/25'} ${isToday ? 'ring-1 ring-blue-400 bg-blue-500/10' : 'bg-white/[0.04]'} ${count > 0 ? 'border border-blue-400/20 bg-blue-500/10' : 'border border-transparent'}`}
            >
              <span>{format(day, 'd')}</span>
              {count > 0 && <span className="text-[10px] text-blue-300 mt-0.5">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}