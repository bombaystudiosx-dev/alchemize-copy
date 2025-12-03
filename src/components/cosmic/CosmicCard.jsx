import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function CosmicCard({ 
  children, 
  className,
  onClick,
  glow = true,
  animate = true 
}) {
  const Wrapper = animate ? motion.div : 'div';
  const animateProps = animate ? {
    whileHover: { scale: 1.02, y: -2 },
    whileTap: { scale: 0.98 },
    transition: { type: 'spring', stiffness: 300 }
  } : {};

  return (
    <Wrapper
      onClick={onClick}
      {...animateProps}
      className={cn(
        'relative rounded-2xl p-6',
        'bg-gradient-to-br from-white/10 to-white/5',
        'backdrop-blur-xl border border-white/10',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Glow border effect */}
      {glow && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-purple-500/20 opacity-50 blur-sm -z-10" />
      )}
      
      {/* Inner glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
      
      {children}
    </Wrapper>
  );
}