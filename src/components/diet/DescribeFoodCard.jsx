import React, { useState } from 'react';
import { Sparkles, Loader2, Check, Pencil } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const fields = [
  { key: 'calories', label: 'Calories', suffix: '' },
  { key: 'protein_grams', label: 'Protein', suffix: 'g' },
  { key: 'carb_grams', label: 'Carbs', suffix: 'g' },
  { key: 'fat_grams', label: 'Fat', suffix: 'g' },
  { key: 'sugar_grams', label: 'Sugar', suffix: 'g' },
  { key: 'fiber_grams', label: 'Fiber', suffix: 'g' },
  { key: 'sodium_mg', label: 'Sodium', suffix: 'mg' },
];

export default function DescribeFoodCard({ mealType, selectedDate, onAdd, isSaving }) {
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const reset = () => {
    setDescription('');
    setResult(null);
    setEditMode(false);
    setAnalyzing(false);
  };

  const estimateFood = async () => {
    if (!description.trim()) return;
    setAnalyzing(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Estimate nutrition for this food description: "${description.trim()}".

Return one combined realistic meal estimate.
- Infer portions from common serving sizes
- Estimate calories, protein, carbs, fat
- Include sugar, fiber, and sodium when reasonable
- Keep values realistic and internally consistent
- Use concise food names and serving descriptions`,
        response_json_schema: {
          type: 'object',
          properties: {
            food_name: { type: 'string' },
            serving_description: { type: 'string' },
            calories: { type: 'number' },
            protein_grams: { type: 'number' },
            carb_grams: { type: 'number' },
            fat_grams: { type: 'number' },
            sugar_grams: { type: 'number' },
            fiber_grams: { type: 'number' },
            sodium_mg: { type: 'number' },
          },
        },
      });

      setResult(response);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    onAdd({
      ...result,
      description_text: description.trim(),
      logged_at: `${selectedDate}T12:00:00`,
      meal_type: mealType,
      source_type: 'description',
      is_estimated: true,
      estimation_source: 'description',
    });
    reset();
  };

  return (
    <div className="rounded-3xl bg-white/[0.05] border border-white/10 p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-white font-semibold text-base">Describe Food</p>
          <p className="text-white/45 text-xs mt-1">Type what you ate and save it straight into your {mealType} log for {selectedDate}.</p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-400/20 text-[10px] uppercase tracking-[0.2em] text-purple-200">
          AI
        </div>
      </div>

      <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="2 eggs, toast, and bacon"
          rows={3}
          className="w-full bg-transparent text-white placeholder:text-white/25 text-sm outline-none resize-none"
        />
      </div>

      {!result ? (
        <button
          onClick={estimateFood}
          disabled={!description.trim() || analyzing}
          className="w-full h-12 rounded-2xl bg-white text-black font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {analyzing ? 'Estimating...' : 'Estimate Nutrition'}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl bg-purple-500/10 border border-purple-400/20 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-purple-300">AI Estimated Values</p>
            <div className="mt-2 space-y-2">
              <input
                value={result.food_name || ''}
                disabled={!editMode}
                onChange={(e) => setResult({ ...result, food_name: e.target.value })}
                className="w-full bg-transparent text-white font-semibold outline-none disabled:opacity-100"
              />
              <input
                value={result.serving_description || ''}
                disabled={!editMode}
                onChange={(e) => setResult({ ...result, serving_description: e.target.value })}
                className="w-full bg-transparent text-white/60 text-xs outline-none disabled:opacity-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {fields.map(({ key, label, suffix }) => (
              <div key={key} className="rounded-2xl bg-white/[0.05] border border-white/10 p-3">
                <p className="text-[11px] uppercase tracking-[0.15em] text-white/35 mb-1">{label}</p>
                {editMode ? (
                  <input
                    type="number"
                    value={result[key] ?? 0}
                    onChange={(e) => setResult({ ...result, [key]: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-transparent text-white font-semibold outline-none"
                  />
                ) : (
                  <p className="text-white font-semibold">{Math.round(result[key] || 0)}{suffix}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setEditMode(!editMode)}
              className="flex-1 h-12 rounded-2xl bg-white/[0.06] text-white flex items-center justify-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              {editMode ? 'Done Editing' : 'Edit Values'}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 h-12 rounded-2xl bg-white text-black font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Food'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}