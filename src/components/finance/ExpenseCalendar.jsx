import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { motion } from 'framer-motion';
import { Trash2, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ExpenseCalendar({ expenses, onDeleteExpense, onEditExpense, onClearAll }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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

  const handleDayClick = (day) => {
    const dayExpenses = getExpensesForDay(day);
    if (dayExpenses.length > 0) {
      setSelectedDay(day);
      setShowDeleteDialog(true);
    }
  };

  return (
    <>
      <div className="bg-white/5 rounded-xl p-4 border border-red-500/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <span className="text-red-400">💸</span>
            Expense Calendar - {format(today, 'MMMM yyyy')}
          </h3>
          {expenses.length > 0 && onClearAll && (
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear All
            </button>
          )}
        </div>
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
              onClick={() => handleDayClick(day)}
              className={`
                aspect-square rounded-lg p-1 text-center text-xs relative
                ${isCurrentMonth ? 'text-white' : 'text-white/30'}
                ${isToday ? 'bg-red-500/30 border border-red-500/50' : 'bg-white/5'}
                ${totalExpense > 0 ? 'bg-red-500/20 cursor-pointer' : ''}
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

    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-red-500/30 text-white max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            Expenses on {selectedDay && format(selectedDay, 'MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-4">
          {selectedDay && getExpensesForDay(selectedDay).map(expense => (
            <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex-1">
                <p className="text-white font-medium">{expense.expense_name}</p>
                <p className="text-red-400 text-sm">${expense.expense_amount?.toFixed(2)}</p>
                <p className="text-white/50 text-xs">{expense.expense_category}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onEditExpense(expense);
                    setShowDeleteDialog(false);
                  }}
                  className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    onDeleteExpense(expense.id);
                    const remainingExpenses = getExpensesForDay(selectedDay).filter(e => e.id !== expense.id);
                    if (remainingExpenses.length === 0) {
                      setShowDeleteDialog(false);
                    }
                  }}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  </>
  );
}