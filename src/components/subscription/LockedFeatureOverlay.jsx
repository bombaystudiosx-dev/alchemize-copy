import React from 'react';
import { Lock } from 'lucide-react';

export default function LockedFeatureOverlay() {
  return (
    <div className="absolute inset-0 z-20 rounded-3xl bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
        <Lock className="w-6 h-6 text-white/70" />
      </div>
      <span className="text-white/80 text-sm font-semibold">Premium</span>
      <span className="text-white/40 text-xs">Tap to unlock</span>
    </div>
  );
}