import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Palette, Check } from 'lucide-react';

const THEMES = [
  { id: 'cosmic-dark', name: 'Cosmic Dark', desc: 'Deep purple cosmic theme', colors: ['#0a0118', '#1a0a2e', '#a855f7'] },
  { id: 'midnight-blue', name: 'Midnight Blue', desc: 'Deep ocean blue', colors: ['#020617', '#0f172a', '#3b82f6'] },
  { id: 'aurora', name: 'Aurora', desc: 'Northern lights green', colors: ['#022c22', '#064e3b', '#10b981'] },
  { id: 'rose-gold', name: 'Rose Gold', desc: 'Warm rose tones', colors: ['#1c0a14', '#2e0a1e', '#f43f5e'] },
];

export default function ThemeDialog({ open, onOpenChange }) {
  const [selected, setSelected] = useState('cosmic-dark');

  useEffect(() => {
    const stored = localStorage.getItem('app_theme');
    if (stored) setSelected(stored);
  }, [open]);

  const handleSelect = (themeId) => {
    setSelected(themeId);
    localStorage.setItem('app_theme', themeId);
    // Theme is cosmetic only for now — Cosmic Dark is the active look
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-purple-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-400" />
            Theme
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 mt-2">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleSelect(theme.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                selected === theme.id
                  ? 'bg-white/10 border border-purple-500/40'
                  : 'bg-white/5 border border-white/10 hover:bg-white/8'
              }`}
            >
              <div className="flex gap-1">
                {theme.colors.map((c, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border border-white/20" style={{ background: c }} />
                ))}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-white text-sm">{theme.name}</p>
                <p className="text-xs text-white/50">{theme.desc}</p>
              </div>
              {selected === theme.id && (
                <Check className="w-5 h-5 text-purple-400" />
              )}
            </button>
          ))}
          
          <p className="text-xs text-white/30 text-center mt-2">
            More themes coming soon
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}