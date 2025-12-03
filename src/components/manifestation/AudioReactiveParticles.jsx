import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function AudioReactiveParticles({ moodColor }) {
  const [particles] = useState(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 5,
    }))
  );

  const [pulseIntensity, setPulseIntensity] = useState(0.5);

  // Simulate gentle audio-reactive pulses (ambient rhythm)
  useEffect(() => {
    const interval = setInterval(() => {
      // Create gentle, random pulse variations
      setPulseIntensity(0.3 + Math.random() * 0.4);
    }, 2000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Ambient glow pulse */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${moodColor.glow}, transparent 60%)`
        }}
        animate={{
          opacity: [0.1, pulseIntensity * 0.3, 0.1],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: `radial-gradient(circle, ${moodColor.glow.replace('0.4', '0.8')}, transparent)`,
            boxShadow: `0 0 ${particle.size * 2}px ${moodColor.glow}`
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.2, 0.6 * pulseIntensity, 0.2],
            scale: [1, 1 + pulseIntensity * 0.3, 1]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut'
          }}
        />
      ))}

      {/* Light shimmer waves */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(45deg, transparent 30%, ${moodColor.glow.replace('0.4', '0.05')} 50%, transparent 70%)`
        }}
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      {/* Secondary shimmer */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(-45deg, transparent 30%, ${moodColor.glow.replace('0.4', '0.03')} 50%, transparent 70%)`
        }}
        animate={{
          x: ['100%', '-100%']
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'linear',
          delay: 2
        }}
      />

      {/* Corner glows */}
      <motion.div
        className="absolute top-0 left-0 w-1/3 h-1/3"
        style={{
          background: `radial-gradient(circle at 0% 0%, ${moodColor.glow}, transparent 70%)`
        }}
        animate={{
          opacity: [0.1, 0.3 * pulseIntensity, 0.1]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-1/3 h-1/3"
        style={{
          background: `radial-gradient(circle at 100% 100%, ${moodColor.glow}, transparent 70%)`
        }}
        animate={{
          opacity: [0.1, 0.3 * pulseIntensity, 0.1]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2.5
        }}
      />
    </div>
  );
}