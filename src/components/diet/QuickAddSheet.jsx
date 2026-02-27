import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const QUICK_FOODS = [
  { name: 'Banana', cal: 105, p: 1.3, c: 27, f: 0.4, serving: '1 medium' },
  { name: 'Apple', cal: 95, p: 0.5, c: 25, f: 0.3, serving: '1 medium' },
  { name: 'Egg (boiled)', cal: 78, p: 6, c: 0.6, f: 5, serving: '1 large' },
  { name: 'Rice (white)', cal: 206, p: 4.3, c: 45, f: 0.4, serving: '1 cup cooked' },
  { name: 'Chicken Breast', cal: 165, p: 31, c: 0, f: 3.6, serving: '100g grilled' },
  { name: 'Oatmeal', cal: 154, p: 5, c: 27, f: 2.6, serving: '1 cup cooked' },
  { name: 'Greek Yogurt', cal: 100, p: 17, c: 6, f: 0.7, serving: '170g nonfat' },
  { name: 'Avocado', cal: 240, p: 3, c: 13, f: 22, serving: '1 whole' },
  { name: 'Almonds', cal: 164, p: 6, c: 6, f: 14, serving: '1 oz (23 nuts)' },
  { name: 'Protein Shake', cal: 120, p: 25, c: 3, f: 1, serving: '1 scoop + water' },
  { name: 'Toast (wheat)', cal: 80, p: 4, c: 14, f: 1, serving: '1 slice' },
  { name: 'Coffee (black)', cal: 2, p: 0.3, c: 0, f: 0, serving: '8 oz' },
];

export default function QuickAddSheet({ open, onClose, onAdd, savedFoods = [] }) {
  const [search, setSearch] = useState('');
  const [aiSearching, setAiSearching] = useState(false);
  const [aiResults, setAiResults] = useState(null);

  const filteredQuick = QUICK_FOODS.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredSaved = savedFoods.filter(f =>
    f.food_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleQuickAdd = (food) => {
    onAdd({
      food_name: food.name,
      serving_description: food.serving,
      calories: food.cal,
      protein_grams: food.p,
      carb_grams: food.c,
      fat_grams: food.f,
      sugar_grams: 0,
      fiber_grams: 0,
      source_type: 'manual',
      logged_at: new Date().toISOString()
    });
  };

  const handleSavedAdd = (food) => {
    onAdd({
      food_name: food.food_name,
      serving_description: food.serving_description,
      calories: food.calories,
      protein_grams: food.protein_grams,
      carb_grams: food.carb_grams,
      fat_grams: food.fat_grams,
      sugar_grams: food.sugar_grams || 0,
      fiber_grams: food.fiber_grams || 0,
      source_type: 'saved_food',
      saved_food_id: food.id,
      logged_at: new Date().toISOString()
    });
  };

  const handleAiSearch = async () => {
    if (!search.trim()) return;
    setAiSearching(true);
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Give me accurate USDA-based nutrition data for: "${search}". Use standard serving size. Be precise.`,
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
    setAiResults(response);
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] rounded-t-3xl border-t border-purple-500/20 flex flex-col"
        style={{ maxHeight: '85dvh' }}
      >
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-5 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-white">Add Food</h3>
            <button onClick={onClose} className="p-2 rounded-full bg-white/10">
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search food or ask AI..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setAiResults(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
              className="w-full bg-white/10 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {/* AI Search result */}
          {aiSearching && (
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-white/50 text-xs">Looking up nutrition data...</p>
              </div>
            </div>
          )}

          {aiResults && (
            <div className="mb-4">
              <p className="text-xs text-purple-300 font-medium mb-2 uppercase">AI Result</p>
              <button
                onClick={() => {
                  onAdd({ ...aiResults, source_type: 'manual', logged_at: new Date().toISOString() });
                  setAiResults(null);
                }}
                className="w-full p-3 bg-purple-600/20 border border-purple-500/30 rounded-xl text-left"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium text-sm">{aiResults.food_name}</p>
                    <p className="text-white/40 text-xs">{aiResults.serving_description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-300 font-bold">{aiResults.calories}</p>
                    <p className="text-white/30 text-[10px]">cal</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-2 text-[10px] text-white/40">
                  <span>P: {aiResults.protein_grams}g</span>
                  <span>C: {aiResults.carb_grams}g</span>
                  <span>F: {aiResults.fat_grams}g</span>
                </div>
              </button>
            </div>
          )}

          {/* Saved foods */}
          {filteredSaved.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-amber-300/70 font-medium mb-2 uppercase">Your Saved Foods</p>
              <div className="space-y-1.5">
                {filteredSaved.map(food => (
                  <button
                    key={food.id}
                    onClick={() => handleSavedAdd(food)}
                    className="w-full flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 text-left"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">{food.food_name}</p>
                      <p className="text-white/30 text-xs">{food.serving_description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white/50 text-sm font-medium">{food.calories} cal</span>
                      <Plus className="w-4 h-4 text-white/30" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick add */}
          <div>
            <p className="text-xs text-white/30 font-medium mb-2 uppercase">Quick Add</p>
            <div className="space-y-1.5">
              {filteredQuick.map((food, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickAdd(food)}
                  className="w-full flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 text-left"
                >
                  <div>
                    <p className="text-white text-sm">{food.name}</p>
                    <p className="text-white/30 text-xs">{food.serving}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/50 text-sm">{food.cal} cal</span>
                    <Plus className="w-4 h-4 text-white/30" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {search && filteredQuick.length === 0 && filteredSaved.length === 0 && !aiResults && !aiSearching && (
            <button
              onClick={handleAiSearch}
              className="w-full py-4 mt-2 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-300 font-medium text-sm"
            >
              🔍 Search "{search}" with AI
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}