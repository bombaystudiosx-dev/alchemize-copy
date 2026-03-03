import React, { memo } from 'react';

// Memoized to prevent unnecessary re-renders - GPU accelerated
const CosmicBackground = memo(function CosmicBackground({ children, dimmed = false }) {
  return (
    <div 
      className="relative min-h-screen overflow-hidden bg-[#0a0118]"
      style={{ 
        contain: 'layout style paint',
        willChange: 'contents',
      }}
    >
      {/* Background Image - GPU composited layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/fb4acda75_20250831_0307_VibrantCelestialGlow_remix_01k3zse7f3fjxse4jt9v4t8vyh.jpg)',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      />
      
      {/* Gradient overlay - static layer */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-black/40"
        style={{ transform: 'translateZ(0)' }}
      />
      
      {/* Dimmed overlay */}
      {dimmed && (
        <div className="absolute inset-0 bg-black/40" style={{ transform: 'translateZ(0)' }} />
      )}
      
      {/* Content - elevated z-index */}
      <div className="relative z-10" style={{ transform: 'translateZ(0)' }}>
        {children}
      </div>
    </div>
  );
});

export default CosmicBackground;