import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Loader2, Upload, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import GlowButton from '@/components/cosmic/GlowButton';

export default function FoodScanner({ onFoodScanned, onClose }) {
  const [mode, setMode] = useState('select'); // select, camera, preview, analyzing, results
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [foodData, setFoodData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setMode('camera');
    } catch (err) {
      console.error('Camera access denied:', err);
      alert('Unable to access camera. Please use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'food-photo.jpg', { type: 'image/jpeg' });
      setImage(URL.createObjectURL(blob));
      stopCamera();
      setMode('preview');
      await uploadAndAnalyze(file);
    }, 'image/jpeg', 0.8);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImage(URL.createObjectURL(file));
    setMode('preview');
    await uploadAndAnalyze(file);
  };

  const uploadAndAnalyze = async (file) => {
    setIsAnalyzing(true);
    setMode('analyzing');
    
    // Upload file
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);
    
    // Analyze with AI
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this food image and provide detailed nutritional information. 
      Identify all food items visible and estimate their nutritional content.
      Be specific about portion sizes and provide realistic calorie estimates.
      If you cannot identify specific foods, make your best educated guess based on what you see.`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          foods: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                portion: { type: 'string' },
                calories: { type: 'number' },
                protein: { type: 'number' },
                carbs: { type: 'number' },
                fat: { type: 'number' }
              }
            }
          },
          total_calories: { type: 'number' },
          total_protein: { type: 'number' },
          total_carbs: { type: 'number' },
          total_fat: { type: 'number' },
          meal_summary: { type: 'string' },
          health_notes: { type: 'string' }
        }
      }
    });
    
    setFoodData(result);
    setIsAnalyzing(false);
    setMode('results');
  };

  const reset = () => {
    stopCamera();
    setImage(null);
    setImageUrl(null);
    setFoodData(null);
    setIsAnalyzing(false);
    setMode('select');
  };

  const handleUseData = () => {
    if (foodData && onFoodScanned) {
      onFoodScanned(foodData);
    }
    onClose();
  };

  return (
    <div className="space-y-4">
      {/* Select Mode */}
      {mode === 'select' && (
        <div className="space-y-4">
          <p className="text-center text-purple-200/70 text-sm">
            Scan your food to get instant nutritional information
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={startCamera}
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/10 hover:bg-white/15 transition-colors border border-white/10"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <span className="text-white font-medium">Take Photo</span>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/10 hover:bg-white/15 transition-colors border border-white/10"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <span className="text-white font-medium">Upload Image</span>
            </button>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
      )}

      {/* Camera Mode */}
      {mode === 'camera' && (
        <div className="space-y-4">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-2 border-lime-400/50 rounded-xl pointer-events-none">
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-lime-400" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-lime-400" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-lime-400" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-lime-400" />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => { stopCamera(); setMode('select'); }}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center shadow-lg shadow-lime-500/30"
            >
              <div className="w-12 h-12 rounded-full border-4 border-white" />
            </button>
            <div className="w-12" />
          </div>
        </div>
      )}

      {/* Analyzing Mode */}
      {mode === 'analyzing' && (
        <div className="space-y-4">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
            <img src={image} alt="Food" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-lime-400 animate-spin mb-4" />
              <p className="text-white font-medium">Analyzing your food...</p>
              <p className="text-white/60 text-sm">This may take a moment</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Mode */}
      {mode === 'results' && foodData && (
        <div className="space-y-4">
          <div className="relative aspect-video rounded-xl overflow-hidden">
            <img src={image} alt="Food" className="w-full h-full object-cover" />
          </div>
          
          {/* Summary */}
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-white/80 text-sm">{foodData.meal_summary}</p>
          </div>
          
          {/* Total Nutrition */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-lime-500/20 rounded-xl p-3 text-center">
              <p className="text-lime-400 text-xl font-bold">{foodData.total_calories}</p>
              <p className="text-white/60 text-xs">Calories</p>
            </div>
            <div className="bg-blue-500/20 rounded-xl p-3 text-center">
              <p className="text-blue-400 text-xl font-bold">{foodData.total_protein}g</p>
              <p className="text-white/60 text-xs">Protein</p>
            </div>
            <div className="bg-amber-500/20 rounded-xl p-3 text-center">
              <p className="text-amber-400 text-xl font-bold">{foodData.total_carbs}g</p>
              <p className="text-white/60 text-xs">Carbs</p>
            </div>
            <div className="bg-pink-500/20 rounded-xl p-3 text-center">
              <p className="text-pink-400 text-xl font-bold">{foodData.total_fat}g</p>
              <p className="text-white/60 text-xs">Fat</p>
            </div>
          </div>
          
          {/* Food Items */}
          {foodData.foods?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-white/70 text-sm font-medium">Detected Foods</h4>
              {foodData.foods.map((food, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                  <div>
                    <p className="text-white font-medium">{food.name}</p>
                    <p className="text-white/50 text-xs">{food.portion}</p>
                  </div>
                  <p className="text-lime-400 font-medium">{food.calories} cal</p>
                </div>
              ))}
            </div>
          )}
          
          {/* Health Notes */}
          {foodData.health_notes && (
            <div className="bg-purple-500/20 rounded-xl p-4">
              <p className="text-purple-200 text-sm">💡 {foodData.health_notes}</p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 text-white"
            >
              <RotateCcw className="w-4 h-4" />
              Scan Again
            </button>
            <GlowButton onClick={handleUseData} className="flex-1">
              Use This Data
            </GlowButton>
          </div>
        </div>
      )}
    </div>
  );
}