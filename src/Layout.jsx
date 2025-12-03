import React from 'react';
import { SoundscapeProvider } from '@/components/audio/SoundscapeContext';
import SoundscapePanel from '@/components/audio/SoundscapePanel';

export default function Layout({ children }) {
  return (
    <SoundscapeProvider>
      <div className="min-h-screen">
        {children}
        <SoundscapePanel />
      </div>
    </SoundscapeProvider>
  );
}