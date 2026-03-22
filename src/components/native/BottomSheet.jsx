import React, { useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Check } from 'lucide-react';

/**
 * Native-style bottom sheet selection drawer.
 * Replaces web-style <Select> dropdowns.
 * 
 * Props:
 * - open: boolean
 * - onOpenChange: (open) => void
 * - title: string
 * - options: Array<{ value: string, label: string, icon?: ReactNode, subtitle?: string }>
 * - value: string (current selected value)
 * - onSelect: (value) => void
 */
export default function BottomSheet({ open, onOpenChange, title, options = [], value, onSelect }) {
  const sheetRef = useRef(null);
  const titleId = useId();

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onOpenChange]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleSelect = (optionValue) => {
    if (navigator.vibrate) navigator.vibrate(8);
    onSelect(optionValue);
    // Auto close after selection
    setTimeout(() => onOpenChange(false), 120);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/60"
            onClick={() => onOpenChange(false)}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 30, 
              stiffness: 350,
              mass: 0.8
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 300) {
                onOpenChange(false);
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-[101] rounded-t-3xl"
            style={{
              background: 'linear-gradient(180deg, #1a0a2e 0%, #0d0620 100%)',
              borderTop: '1px solid rgba(168, 85, 247, 0.2)',
              maxHeight: '70vh',
              paddingBottom: 'max(env(safe-area-inset-bottom), 20px)',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Title */}
            {title && (
              <div className="px-6 pb-3 pt-1">
                <h3 id={titleId} className="text-lg font-semibold text-white">{title}</h3>
              </div>
            )}

            {/* Options */}
            <div className="px-4 pb-4 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 80px)' }}>
              <div className="space-y-1">
                {options.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={`w-full min-h-11 flex items-center gap-4 px-4 py-4 rounded-2xl transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'bg-purple-500/20 border border-purple-500/40'
                          : 'bg-white/5 border border-transparent hover:bg-white/8'
                      }`}
                    >
                      {option.icon && (
                        <span className="text-xl flex-shrink-0">{option.icon}</span>
                      )}
                      <div className="flex-1 text-left">
                        <p className={`font-medium ${isSelected ? 'text-purple-300' : 'text-white'}`}>
                          {option.label}
                        </p>
                        {option.subtitle && (
                          <p className="text-xs text-white/40 mt-0.5">{option.subtitle}</p>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}