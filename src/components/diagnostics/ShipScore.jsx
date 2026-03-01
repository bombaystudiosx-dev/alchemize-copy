import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const CATEGORIES = [
  { key: 'navigation', label: 'Navigation', weight: 15 },
  { key: 'forms', label: 'Forms & Buttons', weight: 15 },
  { key: 'calories', label: 'Calorie Tracker', weight: 15 },
  { key: 'camera', label: 'Camera', weight: 10 },
  { key: 'bluetooth', label: 'Bluetooth', weight: 5 },
  { key: 'network', label: 'Network Handling', weight: 15 },
  { key: 'compliance', label: 'Store Compliance', weight: 25 },
];

export default function ShipScore({ checks = {}, smokeResults = {} }) {
  // Calculate per-category scores
  const scores = {};
  let totalWeightedScore = 0;
  let totalWeight = 0;

  CATEGORIES.forEach(cat => {
    const catChecks = checks[cat.key] || {};
    const entries = Object.values(catChecks);
    if (entries.length === 0) {
      scores[cat.key] = { passed: 0, total: 0, pct: 0 };
      return;
    }
    const passed = entries.filter(v => v === 'pass').length;
    const pct = Math.round((passed / entries.length) * 100);
    scores[cat.key] = { passed, total: entries.length, pct };
    totalWeightedScore += (pct / 100) * cat.weight;
    totalWeight += cat.weight;
  });

  // Add smoke test results
  const smokeEntries = Object.values(smokeResults);
  const smokePassed = smokeEntries.filter(v => v === 'pass').length;
  const smokePct = smokeEntries.length > 0 ? Math.round((smokePassed / smokeEntries.length) * 100) : 0;

  const overallPct = totalWeight > 0
    ? Math.round((totalWeightedScore / totalWeight) * 100)
    : 0;

  const hasBlockers = CATEGORIES.some(cat => {
    const s = scores[cat.key];
    return s.total > 0 && s.pct < 60 && cat.weight >= 15;
  });

  const color = overallPct >= 90 ? 'text-green-400' : overallPct >= 70 ? 'text-amber-400' : 'text-red-400';
  const bgColor = overallPct >= 90 ? 'from-green-500/20' : overallPct >= 70 ? 'from-amber-500/20' : 'from-red-500/20';

  return (
    <div className={`bg-gradient-to-br ${bgColor} to-transparent border border-white/10 rounded-2xl p-5`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-lg">Ship Readiness</h2>
        {hasBlockers && (
          <div className="flex items-center gap-1 text-red-400 text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            Blockers found
          </div>
        )}
      </div>

      {/* Overall Score */}
      <div className="text-center mb-5">
        <motion.span
          key={overallPct}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-5xl font-black tabular-nums ${color}`}
        >
          {overallPct}%
        </motion.span>
        <p className="text-white/40 text-sm mt-1">
          {overallPct >= 90 ? 'Ready to ship' : overallPct >= 70 ? 'Almost ready' : 'Needs work'}
        </p>
      </div>

      {/* Category breakdown */}
      <div className="space-y-2">
        {CATEGORIES.map(cat => {
          const s = scores[cat.key];
          const catColor = s.total === 0 ? 'text-white/20' : s.pct >= 80 ? 'text-green-400' : s.pct >= 50 ? 'text-amber-400' : 'text-red-400';
          return (
            <div key={cat.key} className="flex items-center gap-2">
              {s.total === 0 ? (
                <div className="w-3.5 h-3.5 rounded-full border border-white/20" />
              ) : s.pct >= 80 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              ) : s.pct >= 50 ? (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-red-400" />
              )}
              <span className="text-white/60 text-sm flex-1">{cat.label}</span>
              <span className={`text-sm font-medium tabular-nums ${catColor}`}>
                {s.total === 0 ? '—' : `${s.passed}/${s.total}`}
              </span>
            </div>
          );
        })}

        {/* Smoke tests row */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/10 mt-2">
          {smokeEntries.length === 0 ? (
            <div className="w-3.5 h-3.5 rounded-full border border-white/20" />
          ) : smokePct >= 80 ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="text-white/60 text-sm flex-1">Manual Smoke Tests</span>
          <span className="text-sm font-medium tabular-nums text-white/40">
            {smokeEntries.length === 0 ? '—' : `${smokePassed}/${smokeEntries.length}`}
          </span>
        </div>
      </div>
    </div>
  );
}