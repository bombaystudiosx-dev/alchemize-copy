import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Loader2, RotateCcw, Barcode } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import GlowButton from '@/components/cosmic/GlowButton';

export default function BarcodeScanner({ onFoodScanned, onClose }) {
  const [mode, setMode] = useState('camera'); // camera, analyzing, results
  const [image, setImage] = useState(null);
  const [foodData, setFoodData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

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
      setError(null);
    } catch (err) {
      setError('Unable to access camera. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureAndAnalyze = async () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'barcode-photo.jpg', { type: 'image/jpeg' });
      setImage(URL.createObjectURL(blob));
      stopCamera();
      setMode('analyzing');
      setIsAnalyzing(true);
      
      try {
        // Upload file
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        // Analyze with AI to detect barcode and get food info
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze this image of a food product barcode or food packaging.
          
          1. If you can see a barcode, try to identify the product
          2. Look at any visible product name, brand, or nutritional information on the packaging
          3. Provide detailed nutritional information for this food product
          
          Be specific and provide realistic estimates. If you cannot identify the exact product, make your best guess based on what you see.`,
          file_urls: [file_url],
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              product_name: { type: 'string' },
              brand: { type: 'string' },
              serving_size: { type: 'string' },
              calories: { type: 'number' },
              protein: { type: 'number' },
              carbs: { type: 'number' },
              fat: { type: 'number' },
              sugar: { type: 'number' },
              fiber: { type: 'number' },
              sodium: { type: 'number' },
              ingredients: { type: 'string' },
              health_rating: { type: 'string', description: 'Good, Moderate, or Poor' },
              notes: { type: 'string' }
            }
          }
        });
        
        setFoodData(result);
        setMode('results');
      } catch (err) {
        setError('Could not analyze the image. Please try again.');
        setMode('camera');
        startCamera();
      }
      
      setIsAnalyzing(false);
    }, 'image/jpeg', 0.9);
  };

  const reset = () => {
    setImage(null);
    setFoodData(null);
    setError(null);
    startCamera();
    setMode('camera');
  };

  const handleUseData = () => {
    if (foodData && onFoodScanned) {
      onFoodScanned(foodData);
    }
    onClose();
  };

  const healthColors = {
    'Good': 'text-green-400 bg-green-500/20',
    'Moderate': 'text-yellow-400 bg-yellow-500/20',
    'Poor': 'text-red-400 bg-red-500/20'
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Camera Mode */}
      {mode === 'camera' && !error && (
        <div className="space-y-4">
          <p className="text-center text-purple-200/70 text-sm">
            Point at a barcode or food package label
          </p>
          
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Scanning frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-32 border-2 border-lime-400 rounded-lg relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-lime-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-lime-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-lime-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-lime-400 rounded-br-lg" />
                
                {/* Scanning line animation */}
                <motion.div
                  className="absolute left-2 right-2 h-0.5 bg-lime-400 shadow-lg shadow-lime-400/50"
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </div>
            
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className="text-white/60 text-xs bg-black/50 px-3 py-1 rounded-full">
                <Barcode className="w-3 h-3 inline mr-1" />
                Align barcode in frame
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={captureAndAnalyze}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center shadow-lg shadow-lime-500/30"
            >
              <Camera className="w-7 h-7 text-white" />
            </button>
            <div className="w-12" />
          </div>
        </div>
      )}

      {/* Analyzing Mode */}
      {mode === 'analyzing' && (
        <div className="space-y-4">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
            <img src={image} alt="Captured" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-lime-400 animate-spin mb-4" />
              <p className="text-white font-medium">Analyzing product...</p>
              <p className="text-white/60 text-sm">Looking up nutritional info</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Mode */}
      {mode === 'results' && foodData && (
        <div className="space-y-4">
          {/* Product Header */}
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg">{foodData.product_name}</h3>
                {foodData.brand && (
                  <p className="text-purple-300/70 text-sm">{foodData.brand}</p>
                )}
              </div>
              {foodData.health_rating && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${healthColors[foodData.health_rating] || 'text-white/60 bg-white/10'}`}>
                  {foodData.health_rating}
                </span>
              )}
            </div>
            {foodData.serving_size && (
              <p className="text-white/50 text-xs mt-2">Serving: {foodData.serving_size}</p>
            )}
          </div>
          
          {/* Nutrition Grid */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-lime-500/20 rounded-xl p-3 text-center">
              <p className="text-lime-400 text-xl font-bold">{foodData.calories || 0}</p>
              <p className="text-white/60 text-xs">Cal</p>
            </div>
            <div className="bg-blue-500/20 rounded-xl p-3 text-center">
              <p className="text-blue-400 text-xl font-bold">{foodData.protein || 0}g</p>
              <p className="text-white/60 text-xs">Protein</p>
            </div>
            <div className="bg-amber-500/20 rounded-xl p-3 text-center">
              <p className="text-amber-400 text-xl font-bold">{foodData.carbs || 0}g</p>
              <p className="text-white/60 text-xs">Carbs</p>
            </div>
            <div className="bg-pink-500/20 rounded-xl p-3 text-center">
              <p className="text-pink-400 text-xl font-bold">{foodData.fat || 0}g</p>
              <p className="text-white/60 text-xs">Fat</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-3 gap-2">
            {foodData.sugar !== undefined && (
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <p className="text-white font-medium">{foodData.sugar}g</p>
                <p className="text-white/50 text-xs">Sugar</p>
              </div>
            )}
            {foodData.fiber !== undefined && (
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <p className="text-white font-medium">{foodData.fiber}g</p>
                <p className="text-white/50 text-xs">Fiber</p>
              </div>
            )}
            {foodData.sodium !== undefined && (
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <p className="text-white font-medium">{foodData.sodium}mg</p>
                <p className="text-white/50 text-xs">Sodium</p>
              </div>
            )}
          </div>
          
          {/* Notes */}
          {foodData.notes && (
            <div className="bg-purple-500/20 rounded-xl p-4">
              <p className="text-purple-200 text-sm">💡 {foodData.notes}</p>
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
              Add to Meal
            </GlowButton>
          </div>
        </div>
      )}
    </div>
  );
}