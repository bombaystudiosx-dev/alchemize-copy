import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Loader2, Sparkles } from 'lucide-react';
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
    
    // Upload file
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);
  };

  const analyzeFood = async () => {
    if (!imageUrl) return;
    
    setAnalyzing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this food image and identify all food items visible. For each item, estimate:
- Food name
- Portion size (e.g., "1 cup", "2 oz", "1 medium")
- Calories
- Protein (grams)
- Carbs (grams)
- Fat (grams)

Be realistic with portion estimates based on what you see. If multiple items are visible, list them all.`,
        file_urls: [imageUrl],
        response_json_schema: {
          type: "object",
          properties: {
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
            },
            total_calories: { type: "number" },
            total_protein: { type: "number" },
            total_carbs: { type: "number" },
            total_fat: { type: "number" }
          }
        }
      });
      
      setResult(response);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddFood = (item) => {
    onAnalyzed({
      ...item,
      image_url: imageUrl
    });
  };

  const handleAddAll = () => {
    if (result?.items) {
      result.items.forEach(item => {
        onAnalyzed({
          ...item,
          image_url: imageUrl
        });
      });
    }
    onClose();
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
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative rounded-2xl overflow-hidden">
            <img src={image} alt="Food" className="w-full h-48 object-cover" />
            <button
              onClick={() => {
                setImage(null);
                setImageUrl(null);
                setResult(null);
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
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <p className="text-sm font-medium text-gray-500">Detected Items:</p>
                
                {result.items?.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-gray-50 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-800">{item.food_name}</p>
                        <p className="text-xs text-gray-500">{item.portion_size}</p>
                      </div>
                      <span className="text-lg font-bold text-green-600">{item.calories} cal</span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>P: {item.protein}g</span>
                      <span>C: {item.carbs}g</span>
                      <span>F: {item.fat}g</span>
                    </div>
                    <button
                      onClick={() => handleAddFood(item)}
                      className="mt-2 w-full py-2 text-sm text-green-600 font-medium bg-green-50 rounded-lg"
                    >
                      Add This Item
                    </button>
                  </motion.div>
                ))}

                {result.items?.length > 1 && (
                  <button
                    onClick={handleAddAll}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium"
                  >
                    Add All Items ({result.total_calories} cal total)
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}
    </div>
  );
}