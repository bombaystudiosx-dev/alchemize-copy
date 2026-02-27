import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Loader2, Sparkles, AlertTriangle, Check, Pencil } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function FoodPhotoAnalyzer({ onAnalyzed, onClose }) {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [correctionNotes, setCorrectionNotes] = useState('');
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImage(URL.createObjectURL(file));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);
  };

  const analyzeFood = async () => {
    if (!imageUrl) return;
    setAnalyzing(true);
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert nutritionist and food scientist. Analyze this food image with extreme precision.

INSTRUCTIONS:
1. Identify EVERY food item visible in the image
2. Estimate portion size based on plate/container size and visual cues
3. Use your knowledge of USDA nutrition databases to provide accurate macros
4. Cross-reference with common restaurant/home serving sizes
5. Account for cooking methods visible (fried, grilled, baked, raw)
6. If sauces, dressings, or oils are visible, include their calories

ACCURACY RULES:
- Use real USDA data where possible
- Calories should match: (protein * 4) + (carbs * 4) + (fat * 9) approximately
- Be conservative — slightly underestimate rather than wildly overestimate
- Confidence below 0.7 if image is blurry, unclear, or unusual food

Provide per-item breakdown AND totals.`,
      file_urls: [imageUrl],
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          food_name: { type: "string", description: "Primary food name or meal description" },
          serving_description: { type: "string", description: "Estimated total serving size" },
          calories: { type: "number" },
          protein_grams: { type: "number" },
          carb_grams: { type: "number" },
          fat_grams: { type: "number" },
          sugar_grams: { type: "number" },
          fiber_grams: { type: "number" },
          confidence_score: { type: "number", description: "0 to 1" },
          items_detected: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                portion: { type: "string" },
                calories: { type: "number" }
              }
            }
          },
          health_tip: { type: "string", description: "One brief health tip about this meal" }
        }
      }
    });

    // Sanity check macros
    const macroCalories = (response.protein_grams * 4) + (response.carb_grams * 4) + (response.fat_grams * 9);
    if (Math.abs(macroCalories - response.calories) > response.calories * 0.3) {
      response.confidence_score = Math.min(response.confidence_score, 0.6);
    }

    setResult({ ...response, image_url: imageUrl });
    setAnalyzing(false);
  };

  const handleConfirm = () => {
    if (!result) return;
    const finalData = editMode 
      ? { ...result, is_corrected: true, correction_notes: correctionNotes } 
      : { ...result, is_corrected: false };
    onAnalyzed(finalData);
  };

  return (
    <div className="space-y-4">
      {!image ? (
        <div className="space-y-3">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold shadow-lg shadow-emerald-500/20"
          >
            <Camera className="w-6 h-6" />
            Take Photo
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gray-100 text-gray-700 font-medium"
          >
            <Upload className="w-5 h-5" />
            Upload from Gallery
          </button>
          
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
        </div>
      ) : !result ? (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden">
            <img src={image} alt="Food" className="w-full h-48 object-cover" />
            <button
              onClick={() => { setImage(null); setImageUrl(null); }}
              className="absolute top-2 right-2 p-2 bg-black/50 rounded-full"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <button
            onClick={analyzeFood}
            disabled={analyzing || !imageUrl}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze Food
              </>
            )}
          </button>
        </div>
      ) : !editMode ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden h-32">
            <img src={image} alt="Food" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
            <div className="absolute bottom-3 left-3">
              <p className="text-white font-bold text-lg">{result.food_name}</p>
              <p className="text-white/60 text-xs">{result.serving_description}</p>
            </div>
          </div>

          {result.confidence_score < 0.7 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Low confidence scan</p>
                <p className="text-xs">Please review values before saving</p>
              </div>
            </div>
          )}

          {/* Macro cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-emerald-700">{Math.round(result.calories)}</p>
              <p className="text-[10px] text-emerald-600/70 font-medium">CALORIES</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-orange-700">{Math.round(result.protein_grams)}g</p>
              <p className="text-[10px] text-orange-600/70 font-medium">PROTEIN</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{Math.round(result.carb_grams)}g</p>
              <p className="text-[10px] text-blue-600/70 font-medium">CARBS</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-yellow-50 rounded-xl p-2 text-center">
              <p className="text-sm font-bold text-yellow-700">{Math.round(result.fat_grams)}g</p>
              <p className="text-[10px] text-yellow-600/60">Fat</p>
            </div>
            <div className="bg-pink-50 rounded-xl p-2 text-center">
              <p className="text-sm font-bold text-pink-700">{Math.round(result.sugar_grams)}g</p>
              <p className="text-[10px] text-pink-600/60">Sugar</p>
            </div>
            <div className="bg-green-50 rounded-xl p-2 text-center">
              <p className="text-sm font-bold text-green-700">{Math.round(result.fiber_grams)}g</p>
              <p className="text-[10px] text-green-600/60">Fiber</p>
            </div>
          </div>

          {/* Detected items */}
          {result.items_detected?.length > 1 && (
            <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase">Items Detected</p>
              {result.items_detected.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{item.name} <span className="text-gray-400 text-xs">({item.portion})</span></span>
                  <span className="text-gray-500 font-medium">{item.calories} cal</span>
                </div>
              ))}
            </div>
          )}

          {result.health_tip && (
            <div className="bg-purple-50 rounded-xl p-3">
              <p className="text-sm text-purple-700">💡 {result.health_tip}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setEditMode(true)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium">
              <Pencil className="w-4 h-4" />
              Edit
            </button>
            <button onClick={handleConfirm} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-semibold">
              <Check className="w-4 h-4" />
              Add
            </button>
          </div>

          <button
            onClick={() => { setImage(null); setImageUrl(null); setResult(null); }}
            className="w-full text-center text-sm text-gray-400 py-1"
          >
            Scan different food
          </button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">Edit Nutrition Values</p>
          <input type="text" value={result.food_name} onChange={(e) => setResult({...result, food_name: e.target.value})} className="w-full px-3 py-2.5 border rounded-xl text-sm" placeholder="Food name" />
          <input type="text" value={result.serving_description} onChange={(e) => setResult({...result, serving_description: e.target.value})} className="w-full px-3 py-2.5 border rounded-xl text-sm" placeholder="Serving size" />
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'calories', label: 'Calories' },
              { key: 'protein_grams', label: 'Protein (g)' },
              { key: 'carb_grams', label: 'Carbs (g)' },
              { key: 'fat_grams', label: 'Fat (g)' },
              { key: 'sugar_grams', label: 'Sugar (g)' },
              { key: 'fiber_grams', label: 'Fiber (g)' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-[10px] text-gray-500 block mb-0.5">{label}</label>
                <input type="number" value={result[key]} onChange={(e) => setResult({...result, [key]: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            ))}
          </div>
          <textarea value={correctionNotes} onChange={(e) => setCorrectionNotes(e.target.value)} placeholder="What was wrong?" className="w-full px-3 py-2 border rounded-xl resize-none text-sm" rows={2} />
          <button onClick={handleConfirm} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold">
            Save Corrections
          </button>
          <button onClick={() => setEditMode(false)} className="w-full text-center text-sm text-gray-400 py-1">
            Cancel edit
          </button>
        </motion.div>
      )}
    </div>
  );
}