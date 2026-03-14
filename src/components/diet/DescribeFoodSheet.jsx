import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Check, Pencil, X } from 'lucide-react';
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

export default function DescribeFoodSheet({ open, onClose, onAdd }) {
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

  const handleClose = () => {
    reset();
    onClose();
  };

  const estimateFood = async () => {
    if (!description.trim()) return;
    setAnalyzing(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Estimate nutrition for this food description: "${description.trim()}".

Return a realistic single combined meal estimate.
- Infer portions from common serving sizes
- Estimate calories, protein, carbs, fat
- Include sugar, fiber, and sodium when reasonable
- Keep values realistic and internally consistent
- Make it clear this is an estimate`,
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
            health_tip: { type: 'string' },
          },
        },
      });

      setResult(response);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAdd = () => {
    if (!result) return;
    onAdd({
      ...result,
      description_text: description.trim(),
      logged_at: new Date().toISOString(),
      source_type: 'description',
      is_estimated: true,
      estimation_source: 'description',
    });
    handleClose();
  };

  if (!open) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-[60] bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] rounded-t-3xl border-t border-purple-500/20 flex flex-col"
        style={{ maxHeight: '90dvh' }}
      >
        <div className="flex justify-center pt-2 pb-1 flex-shrink-0">
          <div className="w-9 h-1 rounded-full bg-white/15" />
        </div>

        <div className="px-5 pb-4 flex-shrink-0 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">Describe Food</p>
            <p className="text-white/35 text-xs mt-1">Get an AI nutrition estimate, then review before saving.</p>
          </div>
          <button onClick={handleClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-4">
          {!result ? (
            <>
              <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-4">
                <label className="text-[11px] uppercase tracking-[0.2em] text-white/40 block mb-2">What did you eat?</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="2 eggs, toast, and bacon"
                  rows={4}
                  className="w-full bg-transparent text-white placeholder:text-white/25 text-sm outline-none resize-none"
                />
              </div>

              <button
                onClick={estimateFood}
                disabled={!description.trim() || analyzing}
                className="w-full h-12 rounded-2xl bg-white text-black font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {analyzing ? 'Estimating...' : 'Estimate Nutrition'}
              </button>
            </>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="rounded-2xl bg-purple-500/10 border border-purple-400/20 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-purple-300">AI Estimated Values</p>
                  <p className="text-white font-semibold mt-2">{result.food_name}</p>
                  <p className="text-white/45 text-xs mt-1">{result.serving_description}</p>
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

                <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 space-y-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.2em] text-white/40 block mb-2">Food Name</label>
                    <input
                      value={result.food_name || ''}
                      disabled={!editMode}
                      onChange={(e) => setResult({ ...result, food_name: e.target.value })}
                      className="w-full bg-transparent text-white outline-none disabled:opacity-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.2em] text-white/40 block mb-2">Serving Description</label>
                    <input
                      value={result.serving_description || ''}
                      disabled={!editMode}
                      onChange={(e) => setResult({ ...result, serving_description: e.target.value })}
                      className="w-full bg-transparent text-white outline-none disabled:opacity-100"
                    />
                  </div>
                  {result.health_tip && <p className="text-white/45 text-xs leading-relaxed">{result.health_tip}</p>}
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
                    onClick={handleAdd}
                    className="flex-1 h-12 rounded-2xl bg-white text-black font-semibold flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Save to Log
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </>
  );
}