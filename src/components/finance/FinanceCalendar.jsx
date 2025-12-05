import React from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns';
import CosmicCard from '@/components/cosmic/CosmicCard';

export default function FinanceCalendar({ transactions }) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for first day (0 = Sunday)
  const firstDayOfWeek = getDay(monthStart);

  // Get transactions by date
  const getTransactionsForDay = (day) => {
    return transactions.filter(t => isSameDay(new Date(t.date), day));
  };

  const getDayEmoji = (day) => {
    const dayTransactions = getTransactionsForDay(day);
    if (dayTransactions.length === 0) return null;

    const hasIncome = dayTransactions.some(t => t.type === 'income');
    const hasExpense = dayTransactions.some(t => t.type === 'expense');

    if (hasIncome && hasExpense) return '💸';
    if (hasIncome) return '💰';
    if (hasExpense) return '💳';
    return null;
  };

  const getDayTotal = (day) => {
    const dayTransactions = getTransactionsForDay(day);
    const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const expenses = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
    const total = income - expenses;
    
    if (total === 0) return null;
    return total;
  };

  return (
    <CosmicCard className="p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>📅</span>
        {format(today, 'MMMM yyyy')}
      </h3>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs text-white/40 font-medium py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Calendar days */}
        {days.map((day, index) => {
          const emoji = getDayEmoji(day);
          const total = getDayTotal(day);
          const isToday = isSameDay(day, today);

          return (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center
                transition-all relative
                ${isToday 
                  ? 'bg-gradient-to-br from-purple-600/40 to-indigo-600/40 ring-2 ring-purple-400/50' 
                  : 'bg-white/5 hover:bg-white/10'
                }
                ${emoji ? 'cursor-pointer' : ''}
              `}
            >
              <span className={`text-xs mb-0.5 ${isToday ? 'text-white font-bold' : 'text-white/70'}`}>
                {format(day, 'd')}
              </span>
              
              {emoji && (
                <span className="text-sm mb-0.5">{emoji}</span>
              )}
              
              {total !== null && (
                <span className={`text-[8px] font-bold ${total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {total >= 0 ? '+' : ''}{total > 999 ? '999+' : total.toFixed(0)}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1">
          <span>💰</span>
          <span className="text-white/60">Income</span>
        </div>
        <div className="flex items-center gap-1">
          <span>💳</span>
          <span className="text-white/60">Expense</span>
        </div>
        <div className="flex items-center gap-1">
          <span>💸</span>
          <span className="text-white/60">Both</span>
        </div>
      </div>
    </CosmicCard>
  );
}