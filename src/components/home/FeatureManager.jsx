import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';

export const DEFAULT_FEATURES = [
  { id: 'manifestation', label: 'Vision Board', icon: '✨', enabled: true },
  { id: 'affirmations', label: 'Affirmations', icon: '💫', enabled: true },
  { id: 'goals', label: 'Goal Setting', icon: '🎯', enabled: true },
  { id: 'habits', label: 'Habit Tracker', icon: '✅', enabled: true },
  { id: 'fitness', label: 'Fitness', icon: '💪', enabled: true },
  { id: 'diet', label: 'Diet Planner', icon: '🥗', enabled: true },
  { id: 'finance', label: 'Finance', icon: '💰', enabled: true },
  { id: 'appointments', label: 'Appointments', icon: '📅', enabled: true },
];

export function getEnabledFeatures() {
  const stored = localStorage.getItem('enabled_features');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return DEFAULT_FEATURES;
    }
  }
  return DEFAULT_FEATURES;
}

export function saveEnabledFeatures(features) {
  localStorage.setItem('enabled_features', JSON.stringify(features));
}

export default function FeatureManager({ open, onOpenChange }) {
  const [features, setFeatures] = useState(getEnabledFeatures);

  useEffect(() => {
    if (open) {
      setFeatures(getEnabledFeatures());
    }
  }, [open]);

  const toggleFeature = (id) => {
    const updated = features.map(f => 
      f.id === id ? { ...f, enabled: !f.enabled } : f
    );
    
    // Ensure at least one feature is enabled
    const hasEnabled = updated.some(f => f.enabled);
    if (!hasEnabled) return;
    
    setFeatures(updated);
    saveEnabledFeatures(updated);
  };

  const enabledCount = features.filter(f => f.enabled).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-purple-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            Manage Features
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <p className="text-sm text-purple-200/70 mb-4">
            Choose which features to display ({enabledCount} active)
          </p>
          
          <div className="space-y-2">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                  feature.enabled 
                    ? 'bg-white/10 border border-white/20' 
                    : 'bg-white/5 border border-white/10 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="font-medium">{feature.label}</span>
                </div>
                <Switch
                  checked={feature.enabled}
                  onCheckedChange={() => toggleFeature(feature.id)}
                  disabled={feature.enabled && enabledCount === 1}
                />
              </motion.div>
            ))}
          </div>
          
          <p className="text-xs text-white/40 mt-4 text-center">
            At least one feature must be enabled
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}