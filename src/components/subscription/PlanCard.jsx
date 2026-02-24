import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

export default function PlanCard({ plan, selected, onSelect, popular }) {
  return (
    <motion.button
      onClick={() => onSelect(plan.id)}
      whileTap={{ scale: 0.96 }}
      animate={selected ? { scale: 1.01 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative w-full rounded-2xl p-4 text-left ${
        selected
          ? 'bg-purple-600/25 border-2 border-purple-400 shadow-lg shadow-purple-500/20'
          : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
      }`}
      style={selected ? {
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      } : {}}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-bold text-white flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          BEST VALUE
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">{plan.name}</h3>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-white">${plan.price}</span>
            <span className="text-white/50 text-sm">/{plan.interval}</span>
          </div>
          {plan.perMonth && (
            <p className="text-purple-300/80 text-xs mt-1">
              ${plan.perMonth}/mo
            </p>
          )}
          {plan.savings && (
            <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
              Save {plan.savings}
            </span>
          )}
          {plan.trial && (
            <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
              7-day free trial
            </span>
          )}
        </div>

        <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-1 ${
          selected ? 'bg-purple-500' : 'border-2 border-white/20'
        }`}>
          {selected && <Check className="w-4 h-4 text-white" />}
        </div>
      </div>
    </motion.button>
  );
}