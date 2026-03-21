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
    sm: 'px-4 min-h-11 min-w-11 text-sm',
    default: 'px-6 min-h-11 min-w-11 text-base',
    lg: 'px-8 min-h-12 min-w-12 text-lg'
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.03, boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)' }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={cn(
        'relative rounded-full font-medium text-white transition-all duration-300',
        'shadow-lg shadow-purple-500/25',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'overflow-hidden',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {/* Shimmer effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
}