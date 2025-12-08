import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { motion } from 'framer-motion';

export default function ExpenseCalendar({ expenses }) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getExpensesForDay = (day) => {
    return expenses.filter(expense => 
      isSameDay(new Date(expense.expense_date), day)
    );
  };

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-red-500/30">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <span className="text-red-400">💸</span>
        Expense Calendar - {format(today, 'MMMM yyyy')}
      </h3>
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs text-white/50 py-1">{day}</div>
        ))}
        {days.map((day, idx) => {
          const dayExpenses = getExpensesForDay(day);
          const totalExpense = dayExpenses.reduce((sum, exp) => sum + (exp.expense_amount || 0), 0);
          const isCurrentMonth = day.getMonth() === today.getMonth();
          const isToday = isSameDay(day, today);

          return (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className={`
                aspect-square rounded-lg p-1 text-center text-xs relative
                ${isCurrentMonth ? 'text-white' : 'text-white/30'}
                ${isToday ? 'bg-red-500/30 border border-red-500/50' : 'bg-white/5'}
                ${totalExpense > 0 ? 'bg-red-500/20' : ''}
              `}
            >
              <div className="text-xs">{format(day, 'd')}</div>
              {totalExpense > 0 && (
                <div className="text-[10px] text-red-400 font-bold mt-0.5">
                  ${totalExpense.toFixed(0)}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}