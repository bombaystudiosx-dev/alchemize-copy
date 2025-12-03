import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading...', count = 3, height = 'h-16' }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div 
          key={i} 
          className={`${height} rounded-xl bg-white/5 animate-pulse`}
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}

export function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-4" />
      <p className="text-white/50 text-sm">{message}</p>
    </div>
  );
}