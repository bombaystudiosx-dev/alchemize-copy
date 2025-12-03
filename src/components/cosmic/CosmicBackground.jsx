import React, { memo } from 'react';
import { motion } from 'framer-motion';

// Memoized to prevent unnecessary re-renders
const CosmicBackground = memo(function CosmicBackground({ children, dimmed = false }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image - reduced animation for performance */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
        style={{
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/1f39af073_D0F70B0F-1FE5-47CD-8ABE-507BC33A3127.png)'
        }}
      />
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-black/40" />
      
      {/* Dimmed overlay */}
      {dimmed && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
});

export default CosmicBackground;