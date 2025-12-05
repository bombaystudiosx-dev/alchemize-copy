import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

const mealTypes = [
  { id: 'breakfast', emoji: '🌅', label: 'Breakfast' },
  { id: 'lunch', emoji: '☀️', label: 'Lunch' },
  { id: 'dinner', emoji: '🌙', label: 'Dinner' },
  { id: 'snack', emoji: '🍎', label: 'Snacks' }
];

export default function MealPlanDialog({ open, onOpenChange, selectedDate, onAddFoods }) {
  const [mealPlan, setMealPlan] = useState({
    breakfast: '',
    lunch: '',
    dinner: '',
    snack: ''
  });
  const [generating, setGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const generateMealPlan = async () => {
    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a healthy, balanced meal plan for one day. Include specific foods with estimated portions and nutritional info. Make it practical and delicious.`,
        response_json_schema: {
          type: "object",
          properties: {
            breakfast: {
              type: "object",
              properties: {
                description: { type: "string" },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      food_name: { type: "string" },
                      portion_size: { type: "string" },
                      calories: { type: "number" },
                      protein: { type: "number" },
                      carbs: { type: "number" },
                      fat: { type: "number" }
                    }
                  }
                }
              }
            },
            lunch: {
              type: "object",
              properties: {
                description: { type: "string" },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      food_name: { type: "string" },
                      portion_size: { type: "string" },
                      calories: { type: "number" },
                      protein: { type: "number" },
                      carbs: { type: "number" },
                      fat: { type: "number" }
                    }
                  }
                }
              }
            },
            dinner: {
              type: "object",
              properties: {
                description: { type: "string" },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      food_name: { type: "string" },
                      portion_size: { type: "string" },
                      calories: { type: "number" },
                      protein: { type: "number" },
                      carbs: { type: "number" },
                      fat: { type: "number" }
                    }
                  }
                }
              }
            },
            snack: {
              type: "object",
              properties: {
                description: { type: "string" },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      food_name: { type: "string" },
                      portion_size: { type: "string" },
                      calories: { type: "number" },
                      protein: { type: "number" },
                      carbs: { type: "number" },
                      fat: { type: "number" }
                    }
                  }
                }
              }
            },
            total_calories: { type: "number" }
          }
        }
      });
      setGeneratedPlan(response);
    } catch (e) {
      console.error('Failed to generate meal plan:', e);
    } finally {
      setGenerating(false);
    }
  };

  const addMealToLog = (mealType, items) => {
    items.forEach(item => {
      onAddFoods({
        date: selectedDate,
        meal_type: mealType,
        ...item
      });
    });
  };

  const addAllMeals = () => {
    if (!generatedPlan) return;
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach(mealType => {
      if (generatedPlan[mealType]?.items) {
        addMealToLog(mealType, generatedPlan[mealType].items);
      }
    });
    onOpenChange(false);
    setGeneratedPlan(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Meal Planner
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!generatedPlan ? (
            <>
              <p className="text-sm text-gray-500">
                Generate a personalized meal plan using AI, or create your own custom plan.
              </p>

              <button
                onClick={generateMealPlan}
                disabled={generating}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate AI Meal Plan
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or plan manually</span>
                </div>
              </div>

              {mealTypes.map(({ id, emoji, label }) => (
                <div key={id}>
                  <label className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <span>{emoji}</span> {label}
                  </label>
                  <Textarea
                    placeholder={`What's for ${label.toLowerCase()}?`}
                    value={mealPlan[id]}
                    onChange={(e) => setMealPlan({ ...mealPlan, [id]: e.target.value })}
                    className="min-h-[60px]"
                  />
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-purple-800 mb-1">AI Generated Plan</p>
                <p className="text-xs text-purple-600">~{generatedPlan.total_calories} calories total</p>
              </div>

              {mealTypes.map(({ id, emoji, label }) => {
                const meal = generatedPlan[id];
                if (!meal?.items?.length) return null;
                
                const mealCalories = meal.items.reduce((sum, i) => sum + (i.calories || 0), 0);
                
                return (
                  <div key={id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium flex items-center gap-2">
                        {emoji} {label}
                      </span>
                      <span className="text-sm text-gray-500">{mealCalories} cal</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{meal.description}</p>
                    <div className="space-y-1">
                      {meal.items.map((item, idx) => (
                        <div key={idx} className="text-xs text-gray-500 flex justify-between">
                          <span>{item.food_name} ({item.portion_size})</span>
                          <span>{item.calories} cal</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => addMealToLog(id, meal.items)}
                      className="mt-2 w-full py-2 text-sm text-purple-600 font-medium bg-purple-50 rounded-lg"
                    >
                      Add to Today
                    </button>
                  </div>
                );
              })}

              <button
                onClick={addAllMeals}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium"
              >
                Add All Meals to Today
              </button>

              <button
                onClick={() => setGeneratedPlan(null)}
                className="w-full py-2 text-sm text-gray-500"
              >
                Generate New Plan
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}