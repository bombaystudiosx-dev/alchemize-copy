import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ENTITY_TYPES = [
  { name: 'TodoItem', label: 'To-Do Items' },
  { name: 'Habit', label: 'Habits' },
  { name: 'GratitudeEntry', label: 'Gratitude Entries' },
  { name: 'JournalEntry', label: 'Journal Entries' },
  { name: 'FoodLog', label: 'Food Logs' },
  { name: 'SavedFood', label: 'Saved Foods' },
  { name: 'NutritionGoal', label: 'Nutrition Goals' },
  { name: 'MealPlan', label: 'Meal Plans' },
  { name: 'Workout', label: 'Workouts' },
  { name: 'BodyMetrics', label: 'Body Metrics' },
  { name: 'FinancialIncome', label: 'Financial Income' },
  { name: 'FinancialExpense', label: 'Financial Expenses' },
  { name: 'Transaction', label: 'Transactions' },
  { name: 'FinanceNote', label: 'Finance Notes' },
  { name: 'FinancialNote', label: 'Financial Notes' },
  { name: 'Appointment', label: 'Appointments' },
  { name: 'ManifestationTile', label: 'Manifestation Tiles' },
  { name: 'Affirmation', label: 'Affirmations' },
  { name: 'Goal', label: 'Goals' },
  { name: 'HabitProgress', label: 'Habit Progress' },
];

export default function ResetDataDialog({ open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const [deleting, setDeleting] = useState(false);
  const [progress, setProgress] = useState('');

  const handleReset = () => {
    if (!open) return;
    setStep(1);
    setDeleting(false);
    setProgress('');
  };

  const handleOpenChange = (val) => {
    if (!val) {
      setStep(1);
      setDeleting(false);
      setProgress('');
    }
    onOpenChange(val);
  };

  const handleDelete = async () => {
    setDeleting(true);
    for (const entity of ENTITY_TYPES) {
      setProgress(`Deleting ${entity.label}...`);
      try {
        const items = await base44.entities[entity.name].list();
        for (const item of items) {
          await base44.entities[entity.name].delete(item.id);
        }
      } catch (e) {
        // Entity might not have data, skip
      }
    }
    
    // Clear local storage settings
    localStorage.removeItem('enabled_features');
    localStorage.removeItem('app_theme');
    localStorage.removeItem('show_calendar');
    
    setProgress('All data cleared!');
    setDeleting(false);
    
    setTimeout(() => {
      handleOpenChange(false);
      window.location.reload();
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-red-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Reset All Data
          </DialogTitle>
        </DialogHeader>
        
        {step === 1 && (
          <div className="space-y-4 mt-2">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-white/70">
                This will permanently delete all your app data including habits, goals, journal entries, financial records, and more. Your account will remain active.
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 font-medium hover:bg-red-500/30 transition-colors"
            >
              Continue
            </button>
            
            <button
              onClick={() => handleOpenChange(false)}
              className="w-full py-2 text-white/50 text-sm hover:text-white/70 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-white/70">
              Are you absolutely sure? This cannot be undone.
            </p>

            {deleting && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
                <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                <p className="text-sm text-white/60">{progress}</p>
              </div>
            )}

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Clearing Data...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete All Data
                </>
              )}
            </button>
            
            <button
              onClick={() => handleOpenChange(false)}
              disabled={deleting}
              className="w-full py-2 text-white/50 text-sm hover:text-white/70 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}