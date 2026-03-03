import { useEffect } from 'react';

export default function NativeFeelProvider() {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'native-feel-styles';
    style.textContent = `
      /* ===== APPLE HIG + 60FPS NATIVE FEEL ===== */

      html {
        overscroll-behavior: none;
        -webkit-text-size-adjust: 100%;
        scroll-behavior: smooth;
      }

      body {
        -webkit-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        overscroll-behavior: none;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
        font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
        position: fixed;
        inset: 0;
        overflow: hidden;
        background: #0a0118 !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text;
        user-select: text;
        font-size: 16px !important; /* Prevent iOS zoom on focus */
      }

      * {
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        box-sizing: border-box;
      }

      #root {
        width: 100%;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior-y: contain;
        position: relative;
        min-height: 100dvh;
        background: #0a0118;
      }

      .min-h-screen {
        min-height: 100dvh !important;
      }

      /* iOS-native press feedback — hardware-accelerated */
      button, [role="button"], a {
        transition: transform 80ms cubic-bezier(0.25, 0.1, 0.25, 1), opacity 80ms ease;
        will-change: transform;
        transform: translateZ(0);
      }
      button:active, [role="button"]:active, a:active {
        transform: scale(0.96) translateZ(0);
        opacity: 0.9;
      }

      img, video {
        -webkit-user-drag: none;
        user-select: none;
        image-rendering: -webkit-optimize-contrast;
        content-visibility: auto;
      }

      /* Hardware-accelerated scroll containers */
      .overflow-y-auto, .overflow-auto, .overflow-x-auto, [data-scroll] {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
        overscroll-behavior: contain;
      }

      /* GPU layer promotion for animations */
      [data-animate], .will-change-transform {
        will-change: transform, opacity;
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
      }

      /* Crisp rendering */
      svg {
        shape-rendering: geometricPrecision;
      }

      /* Reduce motion for accessibility */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }

      /* Safe area compliance */
      .safe-top { padding-top: env(safe-area-inset-top); }
      .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
      .safe-left { padding-left: env(safe-area-inset-left); }
      .safe-right { padding-right: env(safe-area-inset-right); }

      /* Momentum scrolling fix */
      @supports (-webkit-touch-callout: none) {
        .overflow-y-auto {
          -webkit-overflow-scrolling: touch;
        }
      }
    `;
    document.head.appendChild(style);

    // Prevent context menu on long press (except inputs)
    const preventContextMenu = (e) => {
      if (e.target.closest('input, textarea, [contenteditable]')) return;
      e.preventDefault();
    };
    document.addEventListener('contextmenu', preventContextMenu, { passive: false });

    // Prevent pinch-to-zoom (native app feel)
    const preventZoom = (e) => {
      if (e.touches?.length > 1) e.preventDefault();
    };
    document.addEventListener('touchmove', preventZoom, { passive: false });

    return () => {
      const el = document.getElementById('native-feel-styles');
      if (el) el.remove();
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('touchmove', preventZoom);
    };
  }, []);

  return null;
}