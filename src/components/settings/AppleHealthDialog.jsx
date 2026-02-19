import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Heart, AlertCircle } from 'lucide-react';

export default function AppleHealthDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-purple-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            Apple Health
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <p className="text-sm text-white/60">
            Sync your workouts and health data from Apple Watch and other Health-connected devices.
          </p>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="font-medium text-white">Apple Watch & Ring</p>
                <p className="text-xs text-white/50">Sync workouts & activity data</p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-200/80">
              Apple Health integration requires the native iOS app. This feature is coming soon for the web version.
            </p>
          </div>

          <p className="text-xs text-white/30 text-center">
            Available on iOS with Apple Health access
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}