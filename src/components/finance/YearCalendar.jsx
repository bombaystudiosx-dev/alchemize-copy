import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addMonths, subMonths, startOfYear } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CosmicCard from '@/components/cosmic/CosmicCard';

function MiniMonth({ month, incomes, expenses, selectedMonth, onSelect }) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = getDay(monthStart);
  const today = new Date();
  const isCurrentMonth = month.getMonth() === today.getMonth() && month.getFullYear() === today.getFullYear();
  const isSelected = selectedMonth && month.getMonth() === selectedMonth.getMonth() && month.getFullYear() === selectedMonth.getFullYear();

  const monthIncomeTotal = incomes
    .filter(i => { const d = new Date(i.income_date); return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear(); })
    .reduce((sum, i) => sum + (i.income_net || i.income_gross || 0), 0);

  const monthExpenseTotal = expenses
    .filter(e => { const d = new Date(e.expense_date); return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear(); })
    .reduce((sum, e) => sum + (e.expense_amount || 0), 0);

  const hasActivity = monthIncomeTotal > 0 || monthExpenseTotal > 0;

  return (
    <button
      onClick={() => onSelect(month)}
      className={`rounded-xl p-2.5 text-left transition-all ${
        isSelected
          ? 'bg-purple-500/20 border border-purple-500/40 ring-1 ring-purple-500/30'
          : isCurrentMonth
          ? 'bg-white/[0.06] border border-purple-500/20'
          : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06]'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-xs font-semibold ${isCurrentMonth ? 'text-purple-300' : 'text-white/60'}`}>
          {format(month, 'MMM')}
        </span>
        {hasActivity && (
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
        )}
      </div>

      {/* Mini day grid */}
      <div className="grid grid-cols-7 gap-px">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`e-${i}`} className="w-2.5 h-2.5" />
        ))}
        {days.map((day) => {
          const isToday = isSameDay(day, today);
          const dayHasIncome = incomes.some(i => isSameDay(new Date(i.income_date), day));
          const dayHasExpense = expenses.some(e => isSameDay(new Date(e.expense_date), day));

          return (
            <div
              key={day.toISOString()}
              className={`w-2.5 h-2.5 rounded-[2px] ${
                isToday ? 'bg-purple-400' :
                dayHasIncome && dayHasExpense ? 'bg-amber-400/60' :
                dayHasIncome ? 'bg-green-400/50' :
                dayHasExpense ? 'bg-red-400/50' :
                'bg-white/[0.06]'
              }`}
            />
          );
        })}
      </div>

      {/* Totals */}
      {hasActivity && (
        <div className="mt-1.5 space-y-0.5">
          {monthIncomeTotal > 0 && (
            <p className="text-[9px] text-green-400/80 tabular-nums">+${monthIncomeTotal.toFixed(0)}</p>
          )}
          {monthExpenseTotal > 0 && (
            <p className="text-[9px] text-red-400/80 tabular-nums">-${monthExpenseTotal.toFixed(0)}</p>
          )}
        </div>
      )}
    </button>
  );
}

function MonthDetail({ month, incomes, expenses, onClose }) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = getDay(monthStart);
  const today = new Date();

  const monthIncomes = incomes.filter(i => {
    const d = new Date(i.income_date);
    return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
  });
  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.expense_date);
    return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
  });

  const totalIncome = monthIncomes.reduce((sum, i) => sum + (i.income_net || i.income_gross || 0), 0);
  const totalExpense = monthExpenses.reduce((sum, e) => sum + (e.expense_amount || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="pt-3 pb-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-semibold text-sm">{format(month, 'MMMM yyyy')}</span>
          <button onClick={onClose} className="text-white/40 text-xs hover:text-white/60">Close</button>
        </div>

        {/* Summary */}
        <div className="flex gap-3 mb-3">
          <div className="flex-1 bg-green-500/10 rounded-lg p-2 text-center">
            <p className="text-green-400 text-sm font-bold tabular-nums">${totalIncome.toFixed(0)}</p>
            <p className="text-white/30 text-[10px]">Income</p>
          </div>
          <div className="flex-1 bg-red-500/10 rounded-lg p-2 text-center">
            <p className="text-red-400 text-sm font-bold tabular-nums">${totalExpense.toFixed(0)}</p>
            <p className="text-white/30 text-[10px]">Expenses</p>
          </div>
          <div className={`flex-1 rounded-lg p-2 text-center ${totalIncome - totalExpense >= 0 ? 'bg-purple-500/10' : 'bg-red-500/10'}`}>
            <p className={`text-sm font-bold tabular-nums ${totalIncome - totalExpense >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
              ${(totalIncome - totalExpense).toFixed(0)}
            </p>
            <p className="text-white/30 text-[10px]">Net</p>
          </div>
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] text-white/30 py-0.5">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`e-${i}`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            const dayInc = incomes.filter(i => isSameDay(new Date(i.income_date), day));
            const dayExp = expenses.filter(e => isSameDay(new Date(e.expense_date), day));
            const hasData = dayInc.length > 0 || dayExp.length > 0;

            return (
              <div
                key={day.toISOString()}
                className={`aspect-square rounded-md flex flex-col items-center justify-center text-[10px] ${
                  isToday ? 'bg-purple-500/30 ring-1 ring-purple-400/50' :
                  hasData ? 'bg-white/[0.06]' : ''
                }`}
              >
                <span className={isToday ? 'text-white font-bold' : 'text-white/50'}>{format(day, 'd')}</span>
                {dayInc.length > 0 && <div className="w-1 h-1 rounded-full bg-green-400 mt-0.5" />}
                {dayExp.length > 0 && <div className="w-1 h-1 rounded-full bg-red-400 mt-0.5" />}
              </div>
            );
          })}
        </div>

        {/* Transactions list */}
        {(monthIncomes.length > 0 || monthExpenses.length > 0) && (
          <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto">
            {monthIncomes.map(i => (
              <div key={i.id} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                <div>
                  <span className="text-white/60">{i.income_category}</span>
                  <span className="text-white/25 ml-1.5">{format(new Date(i.income_date), 'MMM d')}</span>
                </div>
                <span className="text-green-400 font-medium tabular-nums">+${(i.income_net || i.income_gross || 0).toFixed(0)}</span>
              </div>
            ))}
            {monthExpenses.map(e => (
              <div key={e.id} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                <div>
                  <span className="text-white/60">{e.expense_name}</span>
                  <span className="text-white/25 ml-1.5">{format(new Date(e.expense_date), 'MMM d')}</span>
                </div>
                <span className="text-red-400 font-medium tabular-nums">-${e.expense_amount.toFixed(0)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function YearCalendar({ incomes, expenses }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);

  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

  const yearIncome = incomes
    .filter(i => new Date(i.income_date).getFullYear() === year)
    .reduce((sum, i) => sum + (i.income_net || i.income_gross || 0), 0);
  const yearExpense = expenses
    .filter(e => new Date(e.expense_date).getFullYear() === year)
    .reduce((sum, e) => sum + (e.expense_amount || 0), 0);

  return (
    <CosmicCard>
      {/* Year nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => { setYear(y => y - 1); setSelectedMonth(null); }} className="p-1.5 rounded-lg hover:bg-white/10">
          <ChevronLeft className="w-4 h-4 text-white/50" />
        </button>
        <div className="text-center">
          <span className="text-white font-bold text-lg">{year}</span>
          <div className="flex gap-3 justify-center mt-0.5">
            <span className="text-green-400 text-[10px] tabular-nums">${yearIncome.toFixed(0)} in</span>
            <span className="text-red-400 text-[10px] tabular-nums">${yearExpense.toFixed(0)} out</span>
          </div>
        </div>
        <button onClick={() => { setYear(y => y + 1); setSelectedMonth(null); }} className="p-1.5 rounded-lg hover:bg-white/10">
          <ChevronRight className="w-4 h-4 text-white/50" />
        </button>
      </div>

      {/* 12 month grid */}
      <div className="grid grid-cols-3 gap-2">
        {months.map((month) => (
          <MiniMonth
            key={month.toISOString()}
            month={month}
            incomes={incomes}
            expenses={expenses}
            selectedMonth={selectedMonth}
            onSelect={(m) => setSelectedMonth(prev => prev && prev.getMonth() === m.getMonth() ? null : m)}
          />
        ))}
      </div>

      {/* Expanded month detail */}
      {selectedMonth && (
        <MonthDetail
          month={selectedMonth}
          incomes={incomes}
          expenses={expenses}
          onClose={() => setSelectedMonth(null)}
        />
      )}

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-white/[0.06] flex gap-4 text-[10px] text-white/30">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-green-400/50" /> Income</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-red-400/50" /> Expense</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-amber-400/60" /> Both</div>
      </div>
    </CosmicCard>
  );
}