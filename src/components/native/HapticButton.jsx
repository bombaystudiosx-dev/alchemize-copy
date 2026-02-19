import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * A button with native-feeling press animations.
 * Scale-down on press, spring-back on release — like iOS.
 */
export default function HapticButton({ children, onClick, className, disabled, ...props }) {
  const handleClick = useCallback((e) => {
    // Trigger haptic vibration if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    onClick?.(e);
  }, [onClick]);

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn('active:opacity-80', className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}