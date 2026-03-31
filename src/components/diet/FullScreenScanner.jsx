import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, RotateCcw, ChevronUp, Zap, ZapOff, FlipHorizontal, AlertTriangle, Settings } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// ─── CORNER BRACKETS ──────────────────────────────────────────────────────────
function ScanFrame({ ready }) {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="relative" style={{ width: '72vw', maxWidth: 320, aspectRatio: '1' }}>
        {/* Ambient glow behind frame */}
        <motion.div
          animate={{ opacity: ready ? [0.15, 0.4, 0.15] : 0.1 }}
          transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
          className="absolute inset-[-12px] rounded-[36px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(200,160,40,0.18) 0%, transparent 70%)' }}
        />
        {/* Outer rounded rect */}
        <motion.div
          animate={{ opacity: ready ? [0.35, 0.7, 0.35] : 0.25 }}
          transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-[28px] border border-[#c8a028]/40"
        />
        {/* Gold corner brackets */}
        {[['top-0 left-0', 't l'], ['top-0 right-0', 't r'], ['bottom-0 left-0', 'b l'], ['bottom-0 right-0', 'b r']].map(([pos, key]) => {
          const isTop = key.includes('t');
          const isLeft = key.includes('l');
          return (
            <motion.div
              key={key}
              animate={{ opacity: ready ? [0.6, 1, 0.6] : 0.4 }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', delay: 0.3 }}
              className={`absolute ${pos} w-8 h-8`}
            >
              {/* horizontal */}
              <div
                className="absolute"
                style={{
                  [isTop ? 'top' : 'bottom']: 0,
                  [isLeft ? 'left' : 'right']: 0,
                  width: 32,
                  height: 3,
                  background: 'linear-gradient(90deg, #c8a028, #f0cc6a)',
                  borderRadius: 99,
                }}
              />
              {/* vertical */}
              <div
                className="absolute"
                style={{
                  [isTop ? 'top' : 'bottom']: 0,
                  [isLeft ? 'left' : 'right']: 0,
                  width: 3,
                  height: 32,
                  background: 'linear-gradient(180deg, #c8a028, #f0cc6a)',
                  borderRadius: 99,
                }}
              />
            </motion.div>
          );
        })}
        {/* Scan line */}
        {ready && (
          <motion.div
            initial={{ top: '8%' }}
            animate={{ top: ['8%', '88%', '8%'] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute left-[8%] right-[8%] h-[2px] pointer-events-none overflow-hidden"
            style={{ borderRadius: 99 }}
          >
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(200,160,40,0.9), transparent)' }} />
            {/* soft glow below line */}
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 20, background: 'linear-gradient(to bottom, rgba(200,160,40,0.2), transparent)' }} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── ANALYZING OVERLAY ────────────────────────────────────────────────────────
function AnalyzingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-[#0a0118]/90 backdrop-blur-md flex flex-col items-center justify-center z-20"
    >
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 1.6 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ border: '1.5px solid rgba(200,160,40,0.25)' }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-14 h-14 rounded-full border-t-2"
          style={{ borderColor: 'transparent', borderTopColor: '#c8a028' }}
        />
      </motion.div>
      <p className="text-white text-lg font-semibold tracking-wide">Identifying food</p>
      <p className="text-white/40 text-sm mt-1">Cross-referencing nutrition data</p>
    </motion.div>
  );
}

// ─── PERMISSION / ERROR STATES ────────────────────────────────────────────────
function CameraPermissionDenied({ onUploadInstead, onOpenSettings }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-white/8 flex items-center justify-center mb-6">
        <AlertTriangle className="w-7 h-7 text-[#c8a028]" />
      </div>
      <p className="text-white font-semibold text-lg mb-2">Camera access needed</p>
      <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-[260px]">
        Alchemize uses your camera to instantly identify food and analyze nutrition.
      </p>
      <button
        onClick={onOpenSettings}
        className="w-full h-12 rounded-full mb-3 flex items-center justify-center gap-2 font-semibold text-sm"
        style={{ background: 'linear-gradient(135deg, #c8a028, #a07820)' }}
      >
        <Settings className="w-4 h-4" />
        Open Settings
      </button>
      <button
        onClick={onUploadInstead}
        className="w-full h-12 rounded-full bg-white/10 text-white/70 font-medium text-sm"
      >
        Upload Photo Instead
      </button>
    </div>
  );
}

function CameraError({ onRetry, onUploadInstead }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-white/8 flex items-center justify-center mb-6">
        <AlertTriangle className="w-7 h-7 text-red-400" />
      </div>
      <p className="text-white font-semibold text-lg mb-2">Camera unavailable</p>
      <p className="text-white/40 text-sm leading-relaxed mb-8">
        Could not start camera. Try again or upload a photo.
      </p>
      <button
        onClick={onRetry}
        className="w-full h-12 rounded-full mb-3 bg-white/12 text-white font-semibold text-sm"
      >
        Retry Camera
      </button>
      <button
        onClick={onUploadInstead}
        className="w-full h-12 rounded-full bg-white/6 text-white/60 font-medium text-sm"
      >
        Upload Photo Instead
      </button>
    </div>
  );
}

// ─── RESULTS PANEL ────────────────────────────────────────────────────────────
function ResultsPanel({ result, image, onConfirm, onRetry, onClose }) {
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(result);
  const [expanded, setExpanded] = useState(false);

  if (editMode) {
    return (
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="absolute inset-0 z-30 overflow-y-auto"
        style={{ background: 'linear-gradient(160deg, #0a0118, #1a0a2e, #0d0620)' }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 backdrop-blur-sm" style={{ background: 'rgba(10,1,24,0.9)' }}>
          <button onClick={() => setEditMode(false)} className="text-white/60 text-sm">Cancel</button>
          <span className="text-white font-semibold">Edit Values</span>
          <button onClick={() => onConfirm(editData)} style={{ color: '#c8a028' }} className="font-semibold text-sm">Save</button>
        </div>
        <div className="px-5 pb-12 space-y-4">
          {[['food_name', 'Name', 'text'], ['serving_description', 'Serving', 'text']].map(([k, l, t]) => (
            <div key={k}>
              <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">{l}</label>
              <input value={editData[k] || ''} onChange={e => setEditData({ ...editData, [k]: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
          ))}
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
                  <input type="number" value={editData[key] || 0}
                    onChange={e => setEditData({ ...editData, [key]: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
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
          <div className="inline-flex items-center px-2 py-0.5 rounded-full mb-2"
            style={{ background: 'rgba(200,160,40,0.15)', border: '1px solid rgba(200,160,40,0.25)' }}>
            <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#c8a028' }}>AI Estimate</span>
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
              { label: 'Fat', value: result.fat_grams, color: '#c8a028', max: 40 },
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
            <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(200,160,40,0.08)', border: '1px solid rgba(200,160,40,0.2)' }}>
              <p className="text-xs" style={{ color: 'rgba(200,160,40,0.9)' }}>Low confidence — tap Edit to adjust values</p>
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex-shrink-0 px-5 pb-6 pt-2 bg-[#0a0118]" style={{ borderTop: '1px solid rgba(200,160,40,0.1)' }}>
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
            className="flex-1 h-12 rounded-full font-semibold text-sm text-black"
            style={{ background: 'linear-gradient(135deg, #c8a028, #f0cc6a)' }}
          >
            Add to Log
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function FullScreenScanner({ open, onClose, onFoodLogged }) {
  const [step, setStep] = useState('loading'); // loading | ready | permissionDenied | cameraError | analyzing | results
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [captureFlash, setCaptureFlash] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // ── Camera lifecycle ──────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);
    setTorchOn(false);
  }, []);

  const startCamera = useCallback(async (facing = 'environment') => {
    stopCamera();
    setStep('loading');
    setCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setCameraReady(true);
            setStep('ready');
            // Detect torch support
            const track = stream.getVideoTracks()[0];
            const caps = track.getCapabilities?.() || {};
            setTorchSupported(!!caps.torch);
          }).catch(() => { setStep('cameraError'); });
        };
      }
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setStep('permissionDenied');
      } else {
        setStep('cameraError');
      }
    }
  }, [stopCamera]);

  // Auto-start on open; cleanup on close
  useEffect(() => {
    if (open) {
      startCamera(facingMode);
    } else {
      stopCamera();
      reset();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const reset = useCallback(() => {
    setImagePreview(null);
    setImageUrl(null);
    setResult(null);
    setError(null);
    setCaptureFlash(false);
  }, []);

  // ── Torch toggle ──────────────────────────────────────────────────────────
  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
      setTorchOn(prev => !prev);
    } catch (_) { /* torch not supported on this device */ }
  }, [torchOn]);

  // ── Flip camera ──────────────────────────────────────────────────────────
  const flipCamera = useCallback(() => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  }, [facingMode, startCamera]);

  // ── Capture from video stream ─────────────────────────────────────────────
  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !cameraReady) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    // Haptic
    if (navigator.vibrate) navigator.vibrate(40);
    // Flash animation
    setCaptureFlash(true);
    setTimeout(() => setCaptureFlash(false), 200);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const previewUrl = URL.createObjectURL(blob);
      setImagePreview(previewUrl);
      stopCamera();
      setStep('analyzing');
      setError(null);
      try {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setImageUrl(file_url);
        await analyzeImage(file_url);
      } catch (err) {
        setError(err?.message || 'Analysis failed. Please try again.');
        setStep('ready');
        startCamera(facingMode);
      }
    }, 'image/jpeg', 0.88);
  }, [cameraReady, facingMode, stopCamera, startCamera]);

  // ── Gallery upload ────────────────────────────────────────────────────────
  const handleFile = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    stopCamera();
    setStep('analyzing');
    setError(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(file_url);
      await analyzeImage(file_url);
    } catch (err) {
      setError(err?.message || 'Analysis failed. Please try again.');
      setStep('ready');
      startCamera(facingMode);
    }
  }, [stopCamera, startCamera, facingMode]);

  // ── AI analysis pipeline ──────────────────────────────────────────────────
  const analyzeImage = useCallback(async (file_url) => {
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
        type: 'object',
        properties: {
          food_name: { type: 'string' },
          serving_description: { type: 'string' },
          calories: { type: 'number' },
          protein_grams: { type: 'number' },
          carb_grams: { type: 'number' },
          fat_grams: { type: 'number' },
          sugar_grams: { type: 'number' },
          fiber_grams: { type: 'number' },
          sodium_mg: { type: 'number' },
          confidence_score: { type: 'number' },
          items_detected: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                portion: { type: 'string' },
                calories: { type: 'number' },
              },
            },
          },
          health_tip: { type: 'string' },
        },
      },
    });

    // Validate macro math
    const macroCheck = (response.protein_grams * 4) + (response.carb_grams * 4) + (response.fat_grams * 9);
    if (Math.abs(macroCheck - response.calories) > response.calories * 0.3) {
      response.confidence_score = Math.min(response.confidence_score || 0.5, 0.6);
    }

    setResult({ ...response, image_url: file_url });
    setStep('results');
  }, []);

  // ── Log confirmed food ────────────────────────────────────────────────────
  const handleConfirm = useCallback((data) => {
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
      estimation_source: 'image',
    });
    onClose();
  }, [imageUrl, onFoodLogged, onClose]);

  if (!open) return null;

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0a0118, #1a0a2e, #0d0620)' }}
    >
      {/* ── ALWAYS-MOUNTED video element (hidden when not in camera step) ── */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          display: (step === 'ready' || step === 'loading') ? 'block' : 'none',
          transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
        }}
      />
      <canvas ref={canvasRef} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      {/* ── LOADING STATE ── */}
      <AnimatePresence>
        {step === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
            style={{ background: 'linear-gradient(160deg, #0a0118, #1a0a2e, #0d0620)' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              className="w-10 h-10 rounded-full border-t-2 mb-5"
              style={{ borderColor: 'transparent', borderTopColor: '#c8a028' }}
            />
            <p className="text-white/50 text-sm tracking-wide">Opening camera...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PERMISSION DENIED ── */}
      {step === 'permissionDenied' && (
        <div className="absolute inset-0 z-10">
          <div className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-4">
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <CameraPermissionDenied
            onOpenSettings={() => {
              // On web we can only suggest; on native this would deep-link to settings
              alert('Please enable camera access in your browser or device Settings, then reopen the scanner.');
            }}
            onUploadInstead={() => fileInputRef.current?.click()}
          />
        </div>
      )}

      {/* ── CAMERA ERROR ── */}
      {step === 'cameraError' && (
        <div className="absolute inset-0 z-10">
          <div className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-4">
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <CameraError
            onRetry={() => startCamera(facingMode)}
            onUploadInstead={() => fileInputRef.current?.click()}
          />
        </div>
      )}

      {/* ── LIVE CAMERA UI (overlays on top of <video>) ── */}
      {(step === 'ready') && (
        <>
          {/* Subtle dark vignette so UI is readable */}
          <div
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,0,15,0.55) 100%)' }}
          />

          {/* TOP BAR */}
          <div
            className="absolute top-0 left-0 right-0 z-[5] flex items-center justify-between px-4"
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)', paddingBottom: 16 }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center"
              style={{ background: 'rgba(10,1,24,0.55)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Title */}
            <span className="text-white/70 text-sm font-medium tracking-wide">Scan Food</span>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {torchSupported && (
                <button
                  onClick={toggleTorch}
                  className="w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center"
                  style={{ background: torchOn ? 'rgba(200,160,40,0.25)' : 'rgba(10,1,24,0.55)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  {torchOn
                    ? <Zap className="w-5 h-5" style={{ color: '#c8a028' }} />
                    : <ZapOff className="w-5 h-5 text-white/70" />
                  }
                </button>
              )}
              <button
                onClick={flipCamera}
                className="w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center"
                style={{ background: 'rgba(10,1,24,0.55)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <FlipHorizontal className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>

          {/* SCAN FRAME + HINT TEXT */}
          <div className="absolute inset-0 z-[3] flex flex-col items-center justify-center pointer-events-none">
            <ScanFrame ready={cameraReady} />
            <div className="mt-[calc(36vw+28px)] max-w-[200px] text-center">
              <p className="text-white font-semibold text-sm leading-snug mb-1">Point your food at the camera</p>
              <p className="text-white/40 text-xs leading-relaxed">
                Take a photo or upload an image for instant nutrition analysis
              </p>
            </div>
          </div>

          {/* Error toast */}
          {error && (
            <div
              className="absolute top-24 left-4 right-4 z-[8] px-4 py-3 rounded-2xl text-center"
              style={{ background: 'rgba(200,40,40,0.15)', border: '1px solid rgba(200,40,40,0.3)' }}
            >
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* BOTTOM CONTROLS */}
          <div
            className="absolute bottom-0 left-0 right-0 z-[5] flex items-center justify-between px-8"
            style={{
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 28px)',
              paddingTop: 24,
              background: 'linear-gradient(to top, rgba(10,1,24,0.85) 0%, transparent 100%)',
            }}
          >
            {/* Gallery */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-14 h-14 rounded-2xl backdrop-blur-md flex items-center justify-center"
              style={{ background: 'rgba(10,1,24,0.55)', border: '1px solid rgba(255,255,255,0.14)' }}
            >
              <Image className="w-6 h-6 text-white/70" />
            </button>

            {/* Shutter */}
            <button
              onClick={captureFrame}
              className="relative w-[74px] h-[74px] flex items-center justify-center"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Outer ring */}
              <div
                className="absolute inset-0 rounded-full"
                style={{ border: '2.5px solid rgba(200,160,40,0.7)' }}
              />
              {/* Inner button */}
              <motion.div
                whileTap={{ scale: 0.88 }}
                className="w-[58px] h-[58px] rounded-full"
                style={{ background: 'linear-gradient(135deg, #c8a028, #f0cc6a)' }}
              />
            </button>

            {/* Flip (bottom right mirror) */}
            <button
              onClick={flipCamera}
              className="w-14 h-14 rounded-2xl backdrop-blur-md flex items-center justify-center"
              style={{ background: 'rgba(10,1,24,0.55)', border: '1px solid rgba(255,255,255,0.14)' }}
            >
              <FlipHorizontal className="w-6 h-6 text-white/70" />
            </button>
          </div>
        </>
      )}

      {/* ── CAPTURE FLASH ── */}
      <AnimatePresence>
        {captureFlash && (
          <motion.div
            key="flash"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-white z-[15] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* ── ANALYZING ── */}
      {step === 'analyzing' && (
        <div className="absolute inset-0 z-10">
          {imagePreview && (
            <img src={imagePreview} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <AnalyzingOverlay />
        </div>
      )}

      {/* ── RESULTS ── */}
      <AnimatePresence>
        {step === 'results' && result && (
          <div className="absolute inset-0 z-20">
            {imagePreview && (
              <img src={imagePreview} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
            )}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,1,24,1) 40%, rgba(10,1,24,0.6) 70%, rgba(10,1,24,0.2))' }} />
            <ResultsPanel
              result={result}
              image={imagePreview}
              onConfirm={handleConfirm}
              onRetry={() => { reset(); startCamera(facingMode); }}
              onClose={onClose}
            />
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
