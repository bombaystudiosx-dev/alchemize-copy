import React from 'react';
import { cn } from '@/lib/utils';

export default function CosmicInput({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  className,
  icon: Icon,
  ...props
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300/60" />
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn(
          'w-full rounded-xl py-3 px-4',
          'bg-white/10 backdrop-blur-md',
          'border border-white/20 focus:border-purple-400/50',
          'text-white placeholder:text-white/40',
          'outline-none transition-all duration-300',
          'focus:ring-2 focus:ring-purple-500/30',
          Icon && 'pl-12',
          className
        )}
        {...props}
      />
    </div>
  );
}