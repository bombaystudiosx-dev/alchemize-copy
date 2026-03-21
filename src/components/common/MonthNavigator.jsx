import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default function MonthNavigator({ currentMonth, onPrev, onNext, className = '' }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <button
        type="button"
        onClick={onPrev}
        className="w-11 h-11 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/70"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div className="text-center flex-1">
        <p className="text-white font-semibold">{format(currentMonth, 'MMMM yyyy')}</p>
      </div>
      <button
        type="button"
        onClick={onNext}
        className="w-11 h-11 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/70"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}