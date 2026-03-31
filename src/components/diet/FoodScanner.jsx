import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Loader2, Upload, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import GlowButton from '@/components/cosmic/GlowButton';

export default function FoodScanner({ onFoodScanned, onClose }) {
  const [mode, setMode] = useState('select'); // 'select', 'camera', 'preview', 'analyzing'
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
      const url = URL.createObjectURL(blob);
      setImage(file);
      setImageUrl(url);
      stopCamera();
      setMode('preview');
    }, 'image/jpeg', 0.95);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setImageUrl(url);
      setMode('preview');
    }
  };

  const analyzeFood = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setMode('analyzing');

    try {
      const imageData = await base44.integrations.Core.UploadFile({ file: image });
      const response = await base44.integrations.Core.InvokeLLM({
        model: 'gemini-1.5-flash',
        prompt: `Analyze this food image and return ONLY a valid JSON object with these fields: name (string), portion_size (string), calories (number), protein (number), carbs (number), fat (number), fiber (number). Example: {"name":"Grilled Chicken","portion_size":"6 oz","calories":280,"protein":53,"carbs":0,"fat":6,"fiber":0}`,
        images: [imageData.url],
        response_format: 'json'
      });

      const data = JSON.parse(response.output);
      setFoodData({
        name: data.name,
        portion_size: data.portion_size,
        calories: Math.round(data.calories || 0),
        protein: Math.round(data.protein || 0),
        carbs: Math.round(data.carbs || 0),
        fat: Math.round(data.fat || 0),
        fiber: Math.round(data.fiber || 0),
        health_notes: null
      });
      setMode('preview');
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze food. Please try again.');
      setMode('preview');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    stopCamera();
    setImage(null);
    setImageUrl(null);
    setFoodData(null);
    setMode('select');
  };

  const handleUseData = () => {
    if (foodData) {
      onFoodScanned(foodData);
      onClose();
    }
  };

  React.useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-safe">
        <h2 className="text-xl font-bold text-white">Food Scanner</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Select Mode */}
      {mode === 'select' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <button
            onClick={startCamera}
            className="w-full max-w-xs bg-purple-500/20 border border-purple-500/30 rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-purple-500/30 transition"
          >
            <Camera className="w-12 h-12 text-purple-400" />
            <span className="text-white font-medium">Take Photo</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-xs bg-blue-500/20 border border-blue-500/30 rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-blue-500/30 transition"
          >
            <Upload className="w-12 h-12 text-blue-400" />
            <span className="text-white font-medium">Upload Photo</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Camera Mode */}
      {mode === 'camera' && (
        <div className="flex-1 relative flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 gap-4">
            <button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full bg-white border-4 border-white/50 hover:scale-105 transition shadow-2xl"
            />
            <button
              onClick={reset}
              className="px-6 py-2 bg-red-500/80 rounded-full text-white font-medium hover:bg-red-500 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Preview Mode */}
      {mode === 'preview' && (
        <div className="flex-1 flex flex-col overflow-y-auto pb-24">
          <div className="relative w-full aspect-square max-h-96">
            <img src={imageUrl} alt="Food" className="w-full h-full object-cover" />
          </div>

          {!foodData && !isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
              <GlowButton onClick={analyzeFood} className="flex-1">
                Analyze Food
              </GlowButton>
              <button
                onClick={reset}
                className="w-full px-6 py-3 bg-gray-500/20 rounded-xl text-white hover:bg-gray-500/30 transition"
              >
                Retake Photo
              </button>
            </div>
          )}

          {foodData && (
            <div className="flex-1 p-6 space-y-4">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <h3 className="text-white font-bold text-lg mb-2">{foodData.name}</h3>
                <p className="text-white/60 text-sm">Portion: {foodData.portion_size}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/60 text-xs">Calories</p>
                  <p className="text-white font-bold text-xl">{foodData.calories}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/60 text-xs">Protein</p>
                  <p className="text-white font-bold text-xl">{foodData.protein}g</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/60 text-xs">Carbs</p>
                  <p className="text-white font-bold text-xl">{foodData.carbs}g</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/60 text-xs">Fat</p>
                  <p className="text-white font-bold text-xl">{foodData.fat}g</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/60 text-xs">Fiber</p>
                  <p className="text-white font-bold text-xl">{foodData.fiber}g</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-500/20 rounded-xl text-white hover:bg-gray-500/30 transition"
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
      )}

      {/* Analyzing Mode */}
      {mode === 'analyzing' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
          <p className="text-white font-medium">Analyzing food...</p>
        </div>
      )}
    </div>
  );
}