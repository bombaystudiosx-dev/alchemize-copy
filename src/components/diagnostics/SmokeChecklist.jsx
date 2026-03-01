import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ExternalLink } from 'lucide-react';

const SMOKE_TESTS = [
  { key: 'gratitude', label: 'Gratitude Journal — add entry', page: 'Journal' },
  { key: 'affirmation', label: 'Affirmations — add new', page: 'Affirmations' },
  { key: 'goal', label: 'Goals — create goal', page: 'Goals' },
  { key: 'finance', label: 'Finance — add expense', page: 'Finance' },
  { key: 'habits', label: 'Habits — mark complete', page: 'Habits' },
  { key: 'fitness', label: 'Fitness — log workout', page: 'Fitness' },
  { key: 'calorie_add', label: 'Calorie Tracker — add food', page: 'CalorieTracker' },
  { key: 'calorie_scan', label: 'Calorie Tracker — scan photo', page: 'CalorieTracker' },
  { key: 'todo', label: 'To-Do — add + complete item', page: 'TodoList' },
  { key: 'manifestation', label: 'Manifestation — add tile', page: 'ManifestationBoard' },
  { key: 'premium', label: 'Premium paywall + Restore', page: 'Premium' },
  { key: 'logout', label: 'Settings — sign out + sign in', page: 'Settings' },
  { key: 'delete_account', label: 'Delete account flow (cancel before final)', page: 'Settings' },
  { key: 'reset_data', label: 'Reset data flow (cancel before final)', page: 'Settings' },
];

export default function SmokeChecklist({ results, onToggle }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <h2 className="text-white font-semibold mb-3">Manual Smoke Tests ({Object.values(results).filter(v => v === 'pass').length}/{SMOKE_TESTS.length})</h2>
      <div className="space-y-1 max-h-80 overflow-y-auto">
        {SMOKE_TESTS.map(t => (
          <div key={t.key} className="flex items-center gap-2 py-1.5 border-b border-white/5">
            <div className="flex gap-1">
              <button
                onClick={() => onToggle(t.key, 'pass')}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all ${results[t.key] === 'pass' ? 'bg-green-500 border-green-500 text-white' : 'border-white/20 text-white/20 hover:border-green-400'}`}
              >✓</button>
              <button
                onClick={() => onToggle(t.key, 'fail')}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all ${results[t.key] === 'fail' ? 'bg-red-500 border-red-500 text-white' : 'border-white/20 text-white/20 hover:border-red-400'}`}
              >✗</button>
            </div>
            <span className="text-white/80 text-sm flex-1">{t.label}</span>
            <Link to={createPageUrl(t.page)} className="text-white/20 hover:text-white/50">
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}