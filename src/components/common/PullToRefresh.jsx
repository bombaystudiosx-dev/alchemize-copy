import React, { useState, useRef, useCallback, memo } from 'react';
import { Loader2 } from 'lucide-react';

const THRESHOLD = 60;
const MAX_PULL = 100;

function PullToRefresh({ onRefresh, children, className = '' }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (refreshing) return;
    const scrollTop = containerRef.current?.scrollTop ?? window.scrollY;
    if (scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, [refreshing]);

  const handleTouchMove = useCallback((e) => {
    if (!pulling.current || refreshing) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) {
      // iOS-native rubber band effect
      const distance = Math.min(MAX_PULL, diff * 0.45);
      requestAnimationFrame(() => setPullDistance(distance));
    } else {
      pulling.current = false;
      setPullDistance(0);
    }
  }, [refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    
    if (pullDistance >= THRESHOLD && !refreshing) {
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(15);
      setRefreshing(true);
      setPullDistance(THRESHOLD);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        requestAnimationFrame(() => setPullDistance(0));
      }
    } else {
      requestAnimationFrame(() => setPullDistance(0));
    }
  }, [pullDistance, refreshing, onRefresh]);

  const progress = Math.min(1, pullDistance / THRESHOLD);

  return (
    <div
      ref={containerRef}
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Pull indicator - GPU accelerated */}
      <div
        className="flex items-center justify-center overflow-hidden"
        style={{ 
          height: pullDistance > 0 || refreshing ? Math.max(pullDistance, refreshing ? 44 : 0) : 0,
          opacity: progress,
          transition: pulling.current ? 'none' : 'all 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
          transform: 'translateZ(0)',
        }}
      >
        <div 
          className="flex items-center justify-center"
          style={{ 
            transform: `rotate(${progress * 360}deg) translateZ(0)`,
            transition: refreshing ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          <Loader2 
            className={`w-5 h-5 text-purple-400 ${refreshing ? 'animate-spin' : ''}`}
          />
        </div>
      </div>
      {children}
    </div>
  );
}

export default memo(PullToRefresh);