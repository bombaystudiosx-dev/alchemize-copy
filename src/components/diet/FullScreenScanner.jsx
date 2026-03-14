import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Image, Loader2, RotateCcw, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Scanning pulse animation
function ScanPulse() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Corner brackets */}
      <div className="absolute top-8 left-8 w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-white rounded-full" />
        <div className="absolute top-0 left-0 w-[3px] h-full bg-white rounded-full" />
      </div>
      <div className="absolute top-8 right-8 w-16 h-16">
        <div className="absolute top-0 right-0 w-full h-[3px] bg-white rounded-full" />
        <div className="absolute top-0 right-0 w-[3px] h-full bg-white rounded-full" />
      </div>
      <div className="absolute bottom-8 left-8 w-16 h-16">
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white rounded-full" />
        <div className="absolute bottom-0 left-0 w-[3px] h-full bg-white rounded-full" />
      </div>
      <div className="absolute bottom-8 right-8 w-16 h-16">
        <div className="absolute bottom-0 right-0 w-full h-[3px] bg-white rounded-full" />
        <div className="absolute bottom-0 right-0 w-[3px] h-full bg-white rounded-full" />
      </div>
    </div>
  );
}

function AnalyzingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-[#0a0118]/90 backdrop-blur-md flex flex-col items-center justify-center z-20"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center mb-6"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-14 h-14 rounded-full border-2 border-transparent border-t-white"
        />
      </motion.div>
      <p className="text-white text-lg font-semibold tracking-wide">Identifying food</p>
      <p className="text-white/40 text-sm mt-1">Cross-referencing nutrition data</p>
    </motion.div>
  );
}

function ResultsPanel({ result, image, onConfirm, onEdit, onRetry, onClose }) {
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(result);
  const [expanded, setExpanded] = useState(false);

  if (editMode) {
    return (
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="absolute inset-0 z-30 bg-gradient-to-br from-[#0a0118] via-[#1a0a2e] to-[#0d0620] overflow-y-auto"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-[#0a0118]/90 backdrop-blur-sm">
          <button onClick={() => setEditMode(false)} className="text-white/60 text-sm">Cancel</button>
          <span className="text-white font-semibold">Edit Values</span>
          <button onClick={() => onConfirm(editData)} className="text-emerald-400 font-semibold text-sm">Save</button>
        </div>
        <div className="px-5 pb-12 space-y-4">
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Name</label>
            <input
              value={editData.food_name}
              onChange={e => setEditData({ ...editData, food_name: e.target.value })}
              className="w-full bg-white/8 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Serving</label>
            <input
              value={editData.serving_description}
              onChange={e => setEditData({ ...editData, serving_description: e.target.value })}
              className="w-full bg-white/8 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'calories', label: 'CALORIES', unit: '' },
              { key: 'protein_grams', label: 'PROTEIN', unit: 'g' },
              { key: 'carb_grams', label: 'CARBS', unit: 'g' },
              { key: 'fat_grams', label: 'FAT', unit: 'g' },
              { key: 'sugar_grams', label: 'SUGAR', unit: 'g' },
              { key: 'fiber_grams', label: 'FIBER', unit: 'g' },
            ].map(({ key, label, unit }) => (
              <div key={key}>
                <label className="text-white/30 text-[10px] uppercase tracking-wider block mb-1">{label}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={editData[key]}
                    onChange={e => setEditData({ ...editData, [key]: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white/8 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30"
                  />
                  {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 text-xs">{unit}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 32, stiffness: 300 }}
      className="absolute inset-x-0 bottom-0 z-30 flex flex-col"
      style={{ maxHeight: expanded ? '92dvh' : '65dvh' }}
    >
      {/* Image header */}
      <div className="relative h-32 flex-shrink-0 overflow-hidden rounded-t-3xl">
        <img src={image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0118] via-[#0a0118]/40 to-transparent" />
        <button onClick={onClose} className="absolute top-3 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
          <X className="w-4 h-4 text-white" />
        </button>
        <div className="absolute bottom-3 left-4 right-4">
          <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-300/20 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-purple-100">AI Estimate</span>
          </div>
          <h2 className="text-white font-bold text-xl leading-tight">{result.food_name}</h2>
          <p className="text-white/50 text-xs mt-0.5">{result.serving_description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#0a0118]">
        <div className="px-5 pt-4 pb-4">
          {/* Calorie hero */}
          <div className="flex items-baseline gap-1 mb-5">
            <span className="text-5xl font-black text-white tabular-nums">{Math.round(result.calories)}</span>
            <span className="text-white/30 text-lg font-medium">cal</span>
          </div>

          {/* Macro bars */}
          <div className="space-y-3 mb-5">
            {[
              { label: 'Protein', value: result.protein_grams, color: '#22d3ee', max: 50 },
              { label: 'Carbs', value: result.carb_grams, color: '#a78bfa', max: 80 },
              { label: 'Fat', value: result.fat_grams, color: '#fbbf24', max: 40 },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white/50 text-xs font-medium">{m.label}</span>
                  <span className="text-white text-sm font-semibold tabular-nums">{Math.round(m.value)}g</span>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((m.value / m.max) * 100, 100)}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Detail row */}
          <div className="flex gap-2 mb-5">
            {[
              { label: 'Sugar', value: result.sugar_grams },
              { label: 'Fiber', value: result.fiber_grams },
            ].map(d => (
              <div key={d.label} className="flex-1 bg-white/5 rounded-xl py-2.5 text-center">
                <p className="text-white font-semibold text-sm tabular-nums">{Math.round(d.value)}g</p>
                <p className="text-white/30 text-[10px] uppercase tracking-wider">{d.label}</p>
              </div>
            ))}
          </div>

          {/* Detected items */}
          {result.items_detected?.length > 1 && (
            <button onClick={() => setExpanded(!expanded)} className="w-full mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Breakdown</span>
                <ChevronUp className={`w-3.5 h-3.5 text-white/30 transition-transform ${expanded ? '' : 'rotate-180'}`} />
              </div>
              {(expanded ? result.items_detected : result.items_detected.slice(0, 3)).map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <span className="text-white/70 text-sm">{item.name}</span>
                  <span className="text-white/40 text-xs tabular-nums">{item.calories} cal</span>
                </div>
              ))}
            </button>
          )}

          {/* Health tip */}
          {result.health_tip && (
            <div className="bg-white/5 rounded-xl p-3 mb-4">
              <p className="text-white/50 text-xs leading-relaxed">{result.health_tip}</p>
            </div>
          )}

          {/* Confidence warning */}
          {result.confidence_score < 0.7 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4">
              <p className="text-amber-400/90 text-xs">Low confidence — tap Edit to adjust values</p>
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex-shrink-0 px-5 pb-6 pt-2 bg-[#0a0118] border-t border-purple-500/10">
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="w-12 h-12 rounded-full bg-white/8 flex items-center justify-center flex-shrink-0"
          >
            <RotateCcw className="w-5 h-5 text-white/50" />
          </button>
          <button
            onClick={() => { setEditMode(true); setEditData(result); }}
            className="flex-1 h-12 rounded-full bg-white/8 text-white/70 font-medium text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onConfirm(result)}
            className="flex-1 h-12 rounded-full bg-white font-semibold text-sm text-black"
          >
            Add to Log
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function FullScreenScanner({ open, onClose, onFoodLogged }) {
  const [step, setStep] = useState('capture'); // capture, analyzing, results
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const reset = useCallback(() => {
    setStep('capture');
    setImagePreview(null);
    setImageUrl(null);
    setResult(null);
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const [error, setError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setImagePreview(URL.createObjectURL(file));
    setStep('analyzing');

    try {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a world-class food recognition AI trained on USDA FoodData Central. Analyze this image precisely.

IDENTIFICATION:
- Name every distinct food item visible
- Estimate portion by comparing to plate/hand/container size
- Note preparation method (grilled, fried, steamed, raw, etc.)
- Include all visible sauces, oils, dressings, condiments, beverages

NUTRITION CALCULATION:
- Use USDA SR Legacy or FoodData Central reference values
- For mixed dishes, estimate by component
- Calories MUST approximately equal: (protein×4)+(carbs×4)+(fat×9)
- Round to reasonable precision (no false decimals)

CONFIDENCE:
- 0.9+ if standard recognizable food with clear view
- 0.7-0.9 if partially obscured or uncommon preparation  
- Below 0.7 if blurry, unusual, or very uncertain

Be specific. "Grilled chicken thigh with skin, ~150g" not just "chicken".`,
      file_urls: [file_url],
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
          fiber_grams: { type: "number" },
          sodium_mg: { type: "number" },
          confidence_score: { type: "number" },
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
          health_tip: { type: "string" }
        }
      }
    });

    // Validate macro math
    const macroCheck = (response.protein_grams * 4) + (response.carb_grams * 4) + (response.fat_grams * 9);
    if (Math.abs(macroCheck - response.calories) > response.calories * 0.3) {
      response.confidence_score = Math.min(response.confidence_score || 0.5, 0.6);
    }

    setResult({ ...response, image_url: file_url });
    setStep('results');
    } catch (err) {
      setError(err?.message || 'Failed to analyze food. Please try again.');
      setStep('capture');
    }
  };

  const handleConfirm = (data) => {
    onFoodLogged({
      food_name: data.food_name,
      serving_description: data.serving_description,
      calories: data.calories,
      protein_grams: data.protein_grams,
      carb_grams: data.carb_grams,
      fat_grams: data.fat_grams,
      sugar_grams: data.sugar_grams,
      fiber_grams: data.fiber_grams,
      sodium_mg: data.sodium_mg,
      image_url: imageUrl,
      confidence_score: data.confidence_score,
      logged_at: new Date().toISOString(),
      source_type: 'camera',
      is_estimated: true,
      estimation_source: 'image'
    });
    onClose();
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-gradient-to-br from-[#0a0118] via-[#1a0a2e] to-[#0d0620]"
    >
      {/* Hidden inputs */}
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      {/* Capture step */}
      {step === 'capture' && (
        <div className="h-full flex flex-col">
          {/* Top bar */}
          <div className="flex-shrink-0 flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-4">
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <X className="w-5 h-5 text-white" />
            </button>
            <span className="text-white/60 text-sm font-medium">Scan Food</span>
            <div className="w-10" />
          </div>

          {/* Main area */}
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div className="relative w-64 h-64 mb-10">
              {/* Animated target */}
              <motion.div
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute inset-0 rounded-3xl border-2 border-white/20"
              />
              <ScanPulse />
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="w-12 h-12 text-white/20" />
              </div>
            </div>

            <p className="text-white text-lg font-semibold mb-2">Point at your food</p>
            <p className="text-white/40 text-sm text-center leading-relaxed max-w-[260px]">
              Take a photo or upload an image for instant nutrition analysis
            </p>

            {error && (
              <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl max-w-[280px]">
                <p className="text-red-300 text-sm text-center">{error}</p>
              </div>
            )}
          </div>

          {/* Bottom actions */}
          <div className="flex-shrink-0 px-8 pb-[calc(env(safe-area-inset-bottom)+24px)]">
            <div className="flex items-center gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center"
              >
                <Image className="w-6 h-6 text-white/60" />
              </button>
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 h-14 rounded-full bg-white flex items-center justify-center gap-3"
              >
                <Camera className="w-5 h-5 text-black" />
                <span className="text-black font-semibold">Take Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analyzing step */}
      {step === 'analyzing' && (
        <div className="h-full relative">
          {imagePreview && (
            <img src={imagePreview} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <AnalyzingOverlay />
        </div>
      )}

      {/* Results step */}
      {step === 'results' && result && (
        <div className="h-full relative">
          {imagePreview && (
            <img src={imagePreview} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          )}
          <ResultsPanel
            result={result}
            image={imagePreview}
            onConfirm={handleConfirm}
            onRetry={reset}
            onClose={onClose}
          />
        </div>
      )}
    </motion.div>
  );
}