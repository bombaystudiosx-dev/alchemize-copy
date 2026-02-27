import { useEffect } from 'react';

export default function NativeFeelProvider() {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'native-feel-styles';
    style.textContent = `
      /* ===== NATIVE APP FEEL ===== */

      body {
        -webkit-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        overscroll-behavior: none;
        -webkit-font-smoothing: subpixel-antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: geometricPrecision;
        font-feature-settings: "kern" 1, "liga" 1;
        position: fixed;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #0a0118 !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text;
        user-select: text;
      }

      * {
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }

      html {
        overscroll-behavior-y: none;
      }

      #root {
        width: 100%;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        position: relative;
        min-height: 100dvh;
        background: #0a0118;
      }

      .min-h-screen {
        min-height: 100dvh !important;
      }

      /* Lightweight press feedback via CSS only — no JS spring needed */
      button:active, [role="button"]:active, a:active {
        transform: scale(0.97);
      }
      button, [role="button"], a {
        transition: transform 0.1s ease-out;
      }

      img {
        -webkit-user-drag: none;
        user-select: none;
        pointer-events: none;
        image-rendering: -webkit-optimize-contrast;
      }
      a img, button img, [role="button"] img {
        pointer-events: auto;
      }

      /* Page-in animation — pure CSS, no JS layout thrash */
      @keyframes page-in {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .animate-page-in {
        animation: page-in 0.2s ease-out both;
      }

      /* Smooth scrolling containers */
      .overflow-y-auto, .overflow-auto, .overflow-x-auto {
        -webkit-overflow-scrolling: touch;
      }

      /* GPU-accelerated transforms for buttery animations */
      .will-change-transform {
        will-change: transform;
        transform: translateZ(0);
        backface-visibility: hidden;
      }

      /* Crisp SVG icons */
      svg {
        shape-rendering: geometricPrecision;
      }
    `;
    document.head.appendChild(style);

    // Prevent context menu on long press
    const preventContextMenu = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      e.preventDefault();
    };
    document.addEventListener('contextmenu', preventContextMenu);

    // Prevent pinch-to-zoom
    const preventZoom = (e) => {
      if (e.touches && e.touches.length > 1) e.preventDefault();
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