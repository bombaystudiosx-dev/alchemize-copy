import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function SettingsRow({ icon: Icon, iconBg, iconColor, title, subtitle, onClick, toggle, checked, onToggle }) {
  const content = (
    <div 
      className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
      onClick={!toggle ? onClick : undefined}
      style={{ cursor: !toggle && onClick ? 'pointer' : 'default' }}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg || 'bg-purple-500/20'}`}>
        <Icon className={`w-5 h-5 ${iconColor || 'text-purple-400'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white text-[15px]">{title}</p>
        {subtitle && <p className="text-xs text-white/50 mt-0.5">{subtitle}</p>}
      </div>
      {toggle ? (
        <Switch checked={checked} onCheckedChange={onToggle} />
      ) : onClick ? (
        <ChevronRight className="w-5 h-5 text-white/30 flex-shrink-0" />
      ) : null}
    </div>
  );

  return content;
}