import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function GlowButton({ 
  children, 
  onClick, 
  className,
  variant = 'primary',
  size = 'default',
  disabled = false 
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500',
    secondary: 'bg-white/10 hover:bg-white/20 border border-white/20',
    ghost: 'bg-transparent hover:bg-white/10'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    default: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        'relative rounded-full font-medium text-white transition-all duration-300',
        'shadow-lg shadow-purple-500/25',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-50" />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}