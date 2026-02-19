import { useEffect } from 'react';

export default function PWASetup() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration);
          })
          .catch((error) => {
            console.log('Service Worker registration failed:', error);
          });
      });
    }

    // Add manifest link to head
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/manifest.json';
    document.head.appendChild(manifestLink);

    // Add theme color meta
    const themeColorMeta = document.createElement('meta');
    themeColorMeta.name = 'theme-color';
    themeColorMeta.content = '#8b5cf6';
    document.head.appendChild(themeColorMeta);

    // Add apple mobile web app capable
    const appleMeta = document.createElement('meta');
    appleMeta.name = 'apple-mobile-web-app-capable';
    appleMeta.content = 'yes';
    document.head.appendChild(appleMeta);

    // Add apple status bar style
    const appleStatusBar = document.createElement('meta');
    appleStatusBar.name = 'apple-mobile-web-app-status-bar-style';
    appleStatusBar.content = 'black-translucent';
    document.head.appendChild(appleStatusBar);

    // Add apple touch icon
    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/5ffac4ad0_Untitleddesign.png';
    document.head.appendChild(appleTouchIcon);

    // Viewport for native feel — disable user scaling
    const existingViewport = document.querySelector('meta[name="viewport"]');
    if (existingViewport) {
      existingViewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
    } else {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(viewport);
    }

    // Mobile web app title
    const appTitle = document.createElement('meta');
    appTitle.name = 'apple-mobile-web-app-title';
    appTitle.content = 'Alchemize';
    document.head.appendChild(appTitle);

    return () => {
      document.head.removeChild(manifestLink);
      document.head.removeChild(themeColorMeta);
      document.head.removeChild(appleMeta);
      document.head.removeChild(appleStatusBar);
      document.head.removeChild(appleTouchIcon);
      document.head.removeChild(appTitle);
    };
  }, []);

  return null;
}