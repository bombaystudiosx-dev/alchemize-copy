import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Loader2, X, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ImageUploader({ 
  onImageUploaded, 
  currentImageUrl = null,
  onRemove = null,
  aspectRatio = 'square', // 'square', 'wide', 'portrait', 'auto'
  showCamera = true,
  className = ''
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(currentImageUrl);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const containerClasses = {
    square: 'aspect-square',
    wide: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: 'min-h-[200px]'
  };

  const processAndUpload = async (file) => {
    setUploading(true);
    setError(null);

    try {
      // Create canvas to handle orientation and resizing
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });

      // Calculate dimensions - max 1280px on long edge for display
      let width = img.width;
      let height = img.height;
      const maxSize = 1280;

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }

      // Create canvas and draw image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // Handle transparency for PNG
      if (file.type === 'image/png') {
        ctx.fillStyle = '#1a0a2e'; // Match app theme
        ctx.fillRect(0, 0, width, height);
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);

      // Convert to blob with compression
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.82);
      });

      // Upload processed image
      const processedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
        type: 'image/jpeg'
      });

      const { file_url } = await base44.integrations.Core.UploadFile({ 
        file: processedFile 
      });

      // Save metadata
      await base44.entities.UploadedImage.create({
        source_filename: file.name,
        source_mime: file.type,
        source_size_bytes: file.size,
        processed_mime: 'image/jpeg',
        processed_size_bytes: blob.size,
        width: Math.round(width),
        height: Math.round(height),
        thumb_url: file_url,
        display_url: file_url
      });

      setPreview(file_url);
      onImageUploaded?.(file_url);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError('Image processing failed - tap to retry');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUpload(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onRemove?.();
  };

  const handleRetry = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${containerClasses[aspectRatio]} ${className}`}>
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

      <AnimatePresence mode="wait">
        {uploading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl"
          >
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-2" />
            <p className="text-white/70 text-sm">Processing image...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleRetry}
            className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/20 backdrop-blur-sm rounded-2xl border-2 border-red-500/30 cursor-pointer hover:bg-red-900/30 transition-colors"
          >
            <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-red-300 text-sm text-center px-4">{error}</p>
            <p className="text-red-400/60 text-xs mt-1">Tap to retry</p>
          </motion.div>
        ) : preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-full rounded-2xl overflow-hidden group"
          >
            <img 
              src={preview} 
              alt="Preview"
              className="w-full h-full object-contain bg-black/20"
              loading="lazy"
            />
            {onRemove && (
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 p-2 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm rounded-2xl border-2 border-dashed border-white/20 hover:border-purple-500/40 transition-colors"
          >
            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 transition-colors"
              >
                <Upload className="w-6 h-6 text-purple-400" />
                <span className="text-xs text-purple-300">Upload</span>
              </button>
              {showCamera && (
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 transition-colors"
                >
                  <Camera className="w-6 h-6 text-indigo-400" />
                  <span className="text-xs text-indigo-300">Camera</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}