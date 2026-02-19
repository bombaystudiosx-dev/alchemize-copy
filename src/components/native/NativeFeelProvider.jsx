import { useEffect } from 'react';

/**
 * Injects native-app-feel CSS and behaviors globally.
 * - Disables text selection on non-input elements
 * - Disables long-press context menus
 * - Adds momentum scrolling
 * - Prevents overscroll bounce on body
 * - Disables pull-to-refresh in browser
 * - Smooth 60fps touch interactions
 */
export default function NativeFeelProvider() {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'native-feel-styles';
    style.textContent = `
      /* ===== NATIVE APP FEEL ===== */

      /* Prevent text selection on non-input elements */
      body {
        -webkit-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        overscroll-behavior: none;
        overscroll-behavior-y: none;
        -webkit-overflow-scrolling: touch;
      }

      /* Allow selection on inputs and textareas */
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text;
        user-select: text;
      }

      /* Eliminate all tap highlights */
      * {
        -webkit-tap-highlight-color: transparent;
      }

      /* Hardware-accelerated scrolling containers */
      [data-scroll], .overflow-y-auto, .overflow-auto, .overflow-x-auto {
        -webkit-overflow-scrolling: touch;
        will-change: scroll-position;
        scroll-behavior: smooth;
      }

      /* Smooth momentum for all scrollable areas */
      .scrollbar-hide, [style*="overflow"] {
        -webkit-overflow-scrolling: touch;
      }

      /* Disable browser pull-to-refresh */
      html {
        overscroll-behavior-y: none;
      }

      /* Active state press feedback — subtle scale */
      button:active, [role="button"]:active, a:active {
        transform: scale(0.97);
        transition: transform 0.08s ease-out;
      }

      /* Smooth transitions on all interactive elements */
      button, [role="button"], a {
        transition: transform 0.12s ease-out, opacity 0.12s ease-out;
        will-change: transform;
      }

      /* Prevent double-tap zoom */
      * {
        touch-action: manipulation;
      }

      /* Native-like font rendering */
      body {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      }

      /* Prevent image dragging */
      img {
        -webkit-user-drag: none;
        user-select: none;
        pointer-events: none;
      }

      /* Allow pointer events on clickable images */
      a img, button img, [role="button"] img, img[onClick] {
        pointer-events: auto;
      }

      /* Smooth page container */
      #root {
        position: relative;
        min-height: 100vh;
        min-height: 100dvh;
      }

      /* Use dynamic viewport height for full-screen feel */
      .min-h-screen {
        min-height: 100dvh !important;
      }

      /* Prevent rubber-band overscroll on iOS but keep inner scrolling */
      body {
        position: fixed;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      #root {
        width: 100%;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
      }
    `;
    document.head.appendChild(style);

    // Prevent context menu on long press (native apps don't have this)
    const preventContextMenu = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      e.preventDefault();
    };
    document.addEventListener('contextmenu', preventContextMenu);

    // Prevent pinch-to-zoom for app-like feel
    const preventZoom = (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', preventZoom, { passive: false });

    // Prevent double-tap zoom
    let lastTap = 0;
    const preventDoubleTapZoom = (e) => {
      const now = Date.now();
      if (now - lastTap < 300) {
        e.preventDefault();
      }
      lastTap = now;
    };
    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false });

    return () => {
      const el = document.getElementById('native-feel-styles');
      if (el) el.remove();
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('touchmove', preventZoom);
      document.removeEventListener('touchend', preventDoubleTapZoom);
    };
  }, []);

  return null;
}