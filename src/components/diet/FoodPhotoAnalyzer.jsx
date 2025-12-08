import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function FoodPhotoAnalyzer({ onAnalyzed, onClose }) {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
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
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this food image and provide nutrition information. Be realistic and accurate:
- Food name
- Portion size (realistic estimate based on image)
- Calories
- Protein (grams)
- Carbs (grams)
- Fat (grams)
- Sugar (grams)
- Fiber (grams)
- Confidence score (0-1) based on image clarity

If you cannot clearly identify the food or portions, set confidence to <0.7.
DO NOT guess random numbers. Use realistic nutrition ranges only.`,
        file_urls: [imageUrl],
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
            fiber_grams: { type: "number" },
            confidence_score: { type: "number" }
          }
        }
      });
      
      // Validate macros
      const isValid = response.calories >= 0 && response.calories <= 2000 &&
                      response.protein_grams >= 0 && response.protein_grams <= 200 &&
                      response.carb_grams >= 0 && response.carb_grams <= 300 &&
                      response.fat_grams >= 0 && response.fat_grams <= 100;
      
      if (!isValid) {
        response.confidence_score = 0.3;
      }

      setResult({ ...response, image_url: imageUrl });
      setShowConfirm(true);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again or enter manually.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    if (result) {
      const finalData = editMode 
        ? { ...result, is_corrected: true, correction_notes: correctionNotes } 
        : { ...result, is_corrected: false };
      onAnalyzed(finalData);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setShowConfirm(false);
  };

  return (
    <div className="space-y-4">
      {!image ? (
        <div className="space-y-3">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-3 py-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium"
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
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden">
            <img src={image} alt="Food" className="w-full h-48 object-cover" />
            <button
              onClick={() => {
                setImage(null);
                setImageUrl(null);
                setResult(null);
                setShowConfirm(false);
                setEditMode(false);
              }}
              className="absolute top-2 right-2 p-2 bg-black/50 rounded-full"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {!result ? (
            <button
              onClick={analyzeFood}
              disabled={analyzing || !imageUrl}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze Food
                </>
              )}
            </button>
          ) : showConfirm && !editMode ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {result.confidence_score < 0.7 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Scan uncertain</p>
                    <p>Please review or edit manually before saving</p>
                  </div>
                </div>
              )}
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <p className="font-semibold text-gray-900">{result.food_name}</p>
                <p className="text-sm text-gray-600">{result.serving_description}</p>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div className="p-2 bg-white rounded"><span className="text-gray-500">Calories:</span> <span className="ml-2 font-semibold">{Math.round(result.calories)}</span></div>
                  <div className="p-2 bg-white rounded"><span className="text-gray-500">Protein:</span> <span className="ml-2 font-semibold">{Math.round(result.protein_grams)}g</span></div>
                  <div className="p-2 bg-white rounded"><span className="text-gray-500">Carbs:</span> <span className="ml-2 font-semibold">{Math.round(result.carb_grams)}g</span></div>
                  <div className="p-2 bg-white rounded"><span className="text-gray-500">Fat:</span> <span className="ml-2 font-semibold">{Math.round(result.fat_grams)}g</span></div>
                  <div className="p-2 bg-white rounded"><span className="text-gray-500">Sugar:</span> <span className="ml-2 font-semibold">{Math.round(result.sugar_grams)}g</span></div>
                  <div className="p-2 bg-white rounded"><span className="text-gray-500">Fiber:</span> <span className="ml-2 font-semibold">{Math.round(result.fiber_grams)}g</span></div>
                </div>
              </div>
              <p className="text-center text-sm font-medium text-gray-700">Was this accurate?</p>
              <div className="flex gap-3">
                <button onClick={handleEdit} className="flex-1 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50">
                  No, edit
                </button>
                <button onClick={handleConfirm} className="flex-1 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700">
                  Yes, add it
                </button>
              </div>
            </motion.div>
          ) : editMode ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <p className="text-sm font-medium text-gray-700">Edit the values below:</p>
              <input type="text" value={result.food_name} onChange={(e) => setResult({...result, food_name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Food name" />
              <input type="text" value={result.serving_description} onChange={(e) => setResult({...result, serving_description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Serving" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={result.calories} onChange={(e) => setResult({...result, calories: parseFloat(e.target.value) || 0})} className="px-3 py-2 border rounded-lg" placeholder="Calories" />
                <input type="number" value={result.protein_grams} onChange={(e) => setResult({...result, protein_grams: parseFloat(e.target.value) || 0})} className="px-3 py-2 border rounded-lg" placeholder="Protein (g)" />
                <input type="number" value={result.carb_grams} onChange={(e) => setResult({...result, carb_grams: parseFloat(e.target.value) || 0})} className="px-3 py-2 border rounded-lg" placeholder="Carbs (g)" />
                <input type="number" value={result.fat_grams} onChange={(e) => setResult({...result, fat_grams: parseFloat(e.target.value) || 0})} className="px-3 py-2 border rounded-lg" placeholder="Fat (g)" />
                <input type="number" value={result.sugar_grams} onChange={(e) => setResult({...result, sugar_grams: parseFloat(e.target.value) || 0})} className="px-3 py-2 border rounded-lg" placeholder="Sugar (g)" />
                <input type="number" value={result.fiber_grams} onChange={(e) => setResult({...result, fiber_grams: parseFloat(e.target.value) || 0})} className="px-3 py-2 border rounded-lg" placeholder="Fiber (g)" />
              </div>
              <textarea value={correctionNotes} onChange={(e) => setCorrectionNotes(e.target.value)} placeholder="Correction notes (what was wrong with this scan?)" className="w-full px-3 py-2 border rounded-lg resize-none" rows={3} />
              <button onClick={handleConfirm} className="w-full py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700">
                Save Corrections
              </button>
            </motion.div>
          ) : null}
        </div>
      )}
    </div>
  );
}