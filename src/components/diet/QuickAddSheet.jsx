import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const COMMON_FOODS = [
  { name: 'Banana', cal: 105, p: 1.3, c: 27, f: 0.4, serving: '1 medium (118g)' },
  { name: 'Apple', cal: 95, p: 0.5, c: 25, f: 0.3, serving: '1 medium (182g)' },
  { name: 'Egg, boiled', cal: 78, p: 6, c: 0.6, f: 5, serving: '1 large' },
  { name: 'White Rice', cal: 206, p: 4.3, c: 45, f: 0.4, serving: '1 cup cooked' },
  { name: 'Chicken Breast', cal: 165, p: 31, c: 0, f: 3.6, serving: '100g grilled' },
  { name: 'Oatmeal', cal: 154, p: 5, c: 27, f: 2.6, serving: '1 cup cooked' },
  { name: 'Greek Yogurt', cal: 100, p: 17, c: 6, f: 0.7, serving: '170g nonfat' },
  { name: 'Avocado', cal: 240, p: 3, c: 13, f: 22, serving: '1 whole' },
  { name: 'Almonds', cal: 164, p: 6, c: 6, f: 14, serving: '1 oz (28g)' },
  { name: 'Protein Shake', cal: 120, p: 25, c: 3, f: 1, serving: '1 scoop + water' },
  { name: 'Whole Wheat Toast', cal: 80, p: 4, c: 14, f: 1, serving: '1 slice' },
  { name: 'Salmon Fillet', cal: 208, p: 20, c: 0, f: 13, serving: '100g baked' },
  { name: 'Sweet Potato', cal: 103, p: 2, c: 24, f: 0.1, serving: '1 medium baked' },
  { name: 'Broccoli', cal: 55, p: 3.7, c: 11, f: 0.6, serving: '1 cup chopped' },
  { name: 'Peanut Butter', cal: 190, p: 7, c: 8, f: 16, serving: '2 tbsp' },
];

export default function QuickAddSheet({ open, onClose, onAdd, savedFoods = [] }) {
  const [search, setSearch] = useState('');
  const [aiSearching, setAiSearching] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const filtered = COMMON_FOODS.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredSaved = savedFoods.filter(f =>
    f.food_name.toLowerCase().includes(search.toLowerCase())
  );

  const logFood = (data) => {
    onAdd({ ...data, logged_at: new Date().toISOString() });
  };

  const handleAiSearch = async () => {
    if (!search.trim()) return;
    setAiSearching(true);
    setAiResult(null);
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Provide accurate USDA-based nutrition for: "${search}". Standard serving. Be precise with all macros.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          food_name: { type: "string" },
          serving_description: { type: "string" },
          calories: { type: "number" },
          protein_grams: { type: "number" },
          carb_grams: { type: "number" },
          fat_grams: { type: "number" },
          sugar_grams: { type: "number" },
          fiber_grams: { type: "number" }
        }
      }
    });
    setAiResult(response);
    setAiSearching(false);
  };

  if (!open) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-[60] bg-[#0c0c0c] rounded-t-2xl flex flex-col"
        style={{ maxHeight: '88dvh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-1 flex-shrink-0">
          <div className="w-9 h-1 rounded-full bg-white/15" />
        </div>

        {/* Search */}
        <div className="px-5 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-white font-semibold">Add Food</span>
            <div className="flex-1" />
            <button onClick={onClose} className="text-white/30 text-sm">Done</button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="text"
              placeholder="Search any food..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setAiResult(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
              autoFocus
              className="w-full bg-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:bg-white/[0.08] transition-colors"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {/* AI searching */}
          {aiSearching && (
            <div className="flex items-center gap-3 py-6 justify-center">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
              <span className="text-white/40 text-sm">Looking up nutrition data...</span>
            </div>
          )}

          {/* AI result */}
          {aiResult && (
            <div className="mb-5">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-[10px] text-purple-400 uppercase tracking-wider font-medium">AI Result</span>
              </div>
              <button
                onClick={() => logFood({ ...aiResult, source_type: 'manual' })}
                className="w-full flex items-center gap-3 p-3.5 bg-purple-500/10 border border-purple-500/15 rounded-xl text-left"
              >
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{aiResult.food_name}</p>
                  <p className="text-white/30 text-xs mt-0.5">{aiResult.serving_description}</p>
                  <div className="flex gap-3 mt-1.5 text-[10px] text-white/25 tabular-nums">
                    <span>P {aiResult.protein_grams}g</span>
                    <span>C {aiResult.carb_grams}g</span>
                    <span>F {aiResult.fat_grams}g</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-semibold tabular-nums">{aiResult.calories}</p>
                  <p className="text-white/20 text-[10px]">cal</p>
                </div>
              </button>
            </div>
          )}

          {/* Saved foods */}
          {filteredSaved.length > 0 && (
            <div className="mb-5">
              <span className="text-[10px] text-white/25 uppercase tracking-wider font-medium">Saved</span>
              <div className="mt-2 space-y-0.5">
                {filteredSaved.map(food => (
                  <button
                    key={food.id}
                    onClick={() => logFood({
                      food_name: food.food_name,
                      serving_description: food.serving_description,
                      calories: food.calories,
                      protein_grams: food.protein_grams,
                      carb_grams: food.carb_grams,
                      fat_grams: food.fat_grams,
                      sugar_grams: food.sugar_grams || 0,
                      fiber_grams: food.fiber_grams || 0,
                      source_type: 'saved_food',
                      saved_food_id: food.id
                    })}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors text-left"
                  >
                    <div className="flex-1">
                      <p className="text-white/70 text-sm">{food.food_name}</p>
                      <p className="text-white/20 text-xs">{food.serving_description}</p>
                    </div>
                    <span className="text-white/30 text-sm tabular-nums">{food.calories}</span>
                    <Plus className="w-4 h-4 text-white/15" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Common foods */}
          <div>
            <span className="text-[10px] text-white/25 uppercase tracking-wider font-medium">Common</span>
            <div className="mt-2 space-y-0.5">
              {filtered.map((food, i) => (
                <button
                  key={i}
                  onClick={() => logFood({
                    food_name: food.name,
                    serving_description: food.serving,
                    calories: food.cal,
                    protein_grams: food.p,
                    carb_grams: food.c,
                    fat_grams: food.f,
                    sugar_grams: 0,
                    fiber_grams: 0,
                    source_type: 'manual'
                  })}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors text-left"
                >
                  <div className="flex-1">
                    <p className="text-white/70 text-sm">{food.name}</p>
                    <p className="text-white/20 text-xs">{food.serving}</p>
                  </div>
                  <span className="text-white/30 text-sm tabular-nums">{food.cal}</span>
                  <Plus className="w-4 h-4 text-white/15" />
                </button>
              ))}
            </div>
          </div>

          {/* AI search fallback */}
          {search && filtered.length === 0 && filteredSaved.length === 0 && !aiResult && !aiSearching && (
            <button
              onClick={handleAiSearch}
              className="w-full flex items-center justify-center gap-2 py-4 mt-2 bg-white/[0.04] rounded-xl text-white/40 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Look up "{search}" with AI
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}