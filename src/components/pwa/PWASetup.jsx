import { useEffect } from 'react';

const ICON_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/5ffac4ad0_Untitleddesign.png';

const MANIFEST_DATA = {
  name: 'Alchemize',
  short_name: 'Alchemize',
  description: 'Unlock your highest self with Alchemize - your personal cosmos for manifestation, goal setting, habit tracking, and more.',
  start_url: '/',
  display: 'standalone',
  background_color: '#0a0118',
  theme_color: '#8b5cf6',
  orientation: 'portrait',
  scope: '/',
  categories: ['health', 'lifestyle', 'productivity'],
  lang: 'en-US',
  icons: [
    { src: ICON_URL, sizes: '72x72',   type: 'image/png' },
    { src: ICON_URL, sizes: '96x96',   type: 'image/png' },
    { src: ICON_URL, sizes: '128x128', type: 'image/png' },
    { src: ICON_URL, sizes: '144x144', type: 'image/png' },
    { src: ICON_URL, sizes: '152x152', type: 'image/png' },
    { src: ICON_URL, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
    { src: ICON_URL, sizes: '384x384', type: 'image/png' },
    { src: ICON_URL, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ],
};

export default function PWASetup() {
  useEffect(() => {
    const injected = [];

    const addMeta = (name, content) => {
      const el = document.createElement('meta');
      el.name = name;
      el.content = content;
      document.head.appendChild(el);
      injected.push(el);
    };

    const addLink = (rel, href, extra = {}) => {
      const el = document.createElement('link');
      el.rel = rel;
      el.href = href;
      Object.entries(extra).forEach(([k, v]) => el.setAttribute(k, v));
      document.head.appendChild(el);
      injected.push(el);
    };

    // --- Inject dynamic manifest via Blob URL ---
    const existingManifest = document.querySelector('link[rel="manifest"]');
    if (existingManifest) {
      existingManifest.remove();
    }
    const blob = new Blob([JSON.stringify(MANIFEST_DATA)], { type: 'application/json' });
    const manifestBlobUrl = URL.createObjectURL(blob);
    addLink('manifest', manifestBlobUrl);

    // --- Meta tags ---
    addMeta('theme-color', '#8b5cf6');
    addMeta('description', MANIFEST_DATA.description);
    addMeta('mobile-web-app-capable', 'yes');
    addMeta('apple-mobile-web-app-capable', 'yes');
    addMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    addMeta('apple-mobile-web-app-title', 'Alchemize');

    // --- Apple touch icon ---
    addLink('apple-touch-icon', ICON_URL);
    addLink('apple-touch-startup-image', ICON_URL);

    // --- Viewport ---
    const existingViewport = document.querySelector('meta[name="viewport"]');
    if (existingViewport) {
      existingViewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
    }

    // Service worker disabled — Base44 doesn't support static file hosting
    // PWA still works for Add to Home Screen via manifest

    return () => {
      injected.forEach(el => el.parentNode && el.parentNode.removeChild(el));
      URL.revokeObjectURL(manifestBlobUrl);
    };
  }, []);

  return null;
}