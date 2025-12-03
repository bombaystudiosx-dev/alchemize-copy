import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import GlowButton from '@/components/cosmic/GlowButton';

export default function ErrorState({ 
  title = 'Something went wrong',
  message = 'Please try again',
  onRetry,
  type = 'generic' // generic, network, notfound
}) {
  const icons = {
    generic: AlertCircle,
    network: WifiOff,
    notfound: AlertCircle
  };
  
  const Icon = icons[type];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 px-6"
    >
      <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-white/50 mb-6 max-w-xs mx-auto">{message}</p>
      {onRetry && (
        <GlowButton onClick={onRetry} variant="secondary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </GlowButton>
      )}
    </motion.div>
  );
}

export function NetworkError({ onRetry }) {
  return (
    <ErrorState
      type="network"
      title="No Connection"
      message="Please check your internet connection and try again"
      onRetry={onRetry}
    />
  );
}