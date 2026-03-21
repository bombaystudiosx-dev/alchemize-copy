import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const fields = [
  { key: 'calories', label: 'Calories' },
  { key: 'protein_grams', label: 'Protein (g)' },
  { key: 'carb_grams', label: 'Carbs (g)' },
  { key: 'fat_grams', label: 'Fat (g)' },
  { key: 'sugar_grams', label: 'Sugar (g)' },
  { key: 'fiber_grams', label: 'Fiber (g)' },
  { key: 'sodium_mg', label: 'Sodium (mg)' },
];

export default function EditFoodDialog({ open, onOpenChange, food, onSave, isSaving }) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    setForm(food ? { ...food } : null);
  }, [food]);

  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a0a2e] border-purple-500/20 max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Food</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-white/40 text-xs mb-1 block">Food Name</label>
            <input
              value={form.food_name || ''}
              onChange={(e) => setForm({ ...form, food_name: e.target.value })}
              className="w-full rounded-xl bg-white/[0.08] border border-purple-500/20 px-4 py-3 text-white outline-none"
            />
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1 block">Serving Description</label>
            <input
              value={form.serving_description || ''}
              onChange={(e) => setForm({ ...form, serving_description: e.target.value })}
              className="w-full rounded-xl bg-white/[0.08] border border-purple-500/20 px-4 py-3 text-white outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {fields.map(({ key, label }) => (
              <div key={key}>
                <label className="text-white/40 text-xs mb-1 block">{label}</label>
                <input
                  type="number"
                  value={form[key] ?? 0}
                  onChange={(e) => setForm({ ...form, [key]: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-xl bg-white/[0.08] border border-purple-500/20 px-4 py-3 text-white outline-none"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onSave(form)}
            disabled={!form.food_name?.trim() || isSaving}
            className="w-full py-3 rounded-xl bg-white text-black font-semibold disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Food'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}