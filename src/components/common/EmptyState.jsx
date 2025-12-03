import React from 'react';
import { motion } from 'framer-motion';
import GlowButton from '@/components/cosmic/GlowButton';

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  iconColor = 'text-purple-400'
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      {Icon && (
        <div className={`w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4`}>
          <Icon className={`w-8 h-8 ${iconColor}`} />
        </div>
      )}
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      {description && (
        <p className="text-white/50 mb-6 max-w-xs mx-auto">{description}</p>
      )}
      {actionLabel && onAction && (
        <GlowButton onClick={onAction}>
          {actionLabel}
        </GlowButton>
      )}
    </motion.div>
  );
}