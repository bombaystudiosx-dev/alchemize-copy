import React from 'react';
import { CheckCircle2, XCircle, Shield, Lock } from 'lucide-react';

const ROUTES = [
  { name: 'Splash', path: '/Splash', auth: false, perms: [], ctas: ['Google Login', 'Apple Login', 'Email Sign In/Up'], forms: ['Email/Password'] },
  { name: 'Onboarding', path: '/Onboarding', auth: false, perms: [], ctas: ['Next', 'Skip'], forms: [] },
  { name: 'Premium', path: '/Premium', auth: false, perms: [], ctas: ['Subscribe', 'Restore Purchase'], forms: [] },
  { name: 'Home', path: '/Home', auth: true, perms: [], ctas: ['Feature Cards', 'Pull Refresh'], forms: [] },
  { name: 'Habits', path: '/Habits', auth: true, perms: [], ctas: ['Add Habit', 'Mark Complete', 'Timer'], forms: ['Habit Name'] },
  { name: 'ManifestationBoard', path: '/ManifestationBoard', auth: true, perms: [], ctas: ['Add Tile', 'Daily Ritual'], forms: ['Tile Form'] },
  { name: 'Settings', path: '/Settings', auth: true, perms: [], ctas: ['Logout', 'Delete Account', 'Reset Data'], forms: [] },
  { name: 'CalorieTracker', path: '/CalorieTracker', auth: true, perms: ['camera'], ctas: ['Scan', 'Quick Add', 'Meal Plan'], forms: ['Goals'] },
  { name: 'Finance', path: '/Finance', auth: true, perms: [], ctas: ['Add Income', 'Add Expense'], forms: ['Transaction Form'] },
  { name: 'Fitness', path: '/Fitness', auth: true, perms: [], ctas: ['Log Workout', 'Add Metrics'], forms: ['Workout Form'] },
  { name: 'Goals', path: '/Goals', auth: true, perms: [], ctas: ['Add Goal', 'Update Progress'], forms: ['Goal Form'] },
  { name: 'Journal', path: '/Journal', auth: true, perms: [], ctas: ['New Entry', 'Gratitude'], forms: ['Journal Form'] },
  { name: 'Affirmations', path: '/Affirmations', auth: true, perms: [], ctas: ['Add Affirmation', 'Favorite'], forms: ['Affirmation Text'] },
  { name: 'TodoList', path: '/TodoList', auth: true, perms: [], ctas: ['Add Todo', 'Complete', 'Delete'], forms: ['Todo Text'] },
  { name: 'Appointments', path: '/Appointments', auth: true, perms: [], ctas: ['Add Appointment'], forms: ['Appointment Form'] },
  { name: 'Profile', path: '/Profile', auth: true, perms: [], ctas: ['Save Profile'], forms: ['Profile Fields'] },
  { name: 'Terms', path: '/Terms', auth: false, perms: [], ctas: ['Back'], forms: [] },
  { name: 'Privacy', path: '/Privacy', auth: false, perms: [], ctas: ['Back'], forms: [] },
  { name: 'Diagnostics', path: '/Diagnostics', auth: true, perms: ['admin'], ctas: ['Run Diagnostics'], forms: [] },
];

export { ROUTES };

export default function RouteInventory() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <h2 className="text-white font-semibold mb-3">Route Inventory ({ROUTES.length} routes)</h2>
      <div className="space-y-1 max-h-80 overflow-y-auto">
        {ROUTES.map(r => (
          <div key={r.name} className="flex items-center gap-2 py-1.5 border-b border-white/5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
            <span className="text-white/80 text-sm flex-1 min-w-0 truncate">{r.name}</span>
            {r.auth && <Lock className="w-3 h-3 text-amber-400/60" />}
            {r.perms.includes('admin') && <Shield className="w-3 h-3 text-red-400/60" />}
            {r.perms.includes('camera') && <span className="text-[10px] text-white/25">📷</span>}
            <span className="text-white/20 text-[10px] tabular-nums">{r.ctas.length} CTAs</span>
          </div>
        ))}
      </div>
    </div>
  );
}