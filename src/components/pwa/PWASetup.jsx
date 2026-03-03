import { useEffect } from 'react';

const ICON_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/5ffac4ad0_Untitleddesign.png';

// Apple App Store PWA Requirements - Full Compliance
const MANIFEST_DATA = {
  name: 'Alchemize',
  short_name: 'Alchemize',
  description: 'Unlock your highest self with Alchemize - your personal cosmos for manifestation, goal setting, habit tracking, and more.',
  start_url: '/?source=pwa',
  id: '/',
  display: 'standalone',
  display_override: ['standalone', 'minimal-ui'],
  background_color: '#0a0118',
  theme_color: '#8b5cf6',
  orientation: 'portrait-primary',
  scope: '/',
  categories: ['health', 'lifestyle', 'productivity', 'self-improvement'],
  lang: 'en-US',
  dir: 'ltr',
  prefer_related_applications: false,
  icons: [
    { src: ICON_URL, sizes: '72x72',   type: 'image/png' },
    { src: ICON_URL, sizes: '96x96',   type: 'image/png' },
    { src: ICON_URL, sizes: '120x120', type: 'image/png' },
    { src: ICON_URL, sizes: '128x128', type: 'image/png' },
    { src: ICON_URL, sizes: '144x144', type: 'image/png' },
    { src: ICON_URL, sizes: '152x152', type: 'image/png' },
    { src: ICON_URL, sizes: '167x167', type: 'image/png' },
    { src: ICON_URL, sizes: '180x180', type: 'image/png' },
    { src: ICON_URL, sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: ICON_URL, sizes: '256x256', type: 'image/png' },
    { src: ICON_URL, sizes: '384x384', type: 'image/png' },
    { src: ICON_URL, sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: ICON_URL, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    { src: ICON_URL, sizes: '1024x1024', type: 'image/png' },
  ],
  screenshots: [],
  shortcuts: [
    { name: 'Home', url: '/', icons: [{ src: ICON_URL, sizes: '192x192' }] },
  ],
};

export default function PWASetup() {
  useEffect(() => {
    const injected = [];

    const addMeta = (name, content, httpEquiv = false) => {
      const el = document.createElement('meta');
      if (httpEquiv) {
        el.httpEquiv = name;
      } else {
        el.name = name;
      }
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
    if (existingManifest) existingManifest.remove();
    const blob = new Blob([JSON.stringify(MANIFEST_DATA)], { type: 'application/json' });
    const manifestBlobUrl = URL.createObjectURL(blob);
    addLink('manifest', manifestBlobUrl);

    // --- Core PWA Meta Tags ---
    addMeta('theme-color', '#8b5cf6');
    addMeta('description', MANIFEST_DATA.description);
    addMeta('application-name', 'Alchemize');
    addMeta('format-detection', 'telephone=no');
    addMeta('mobile-web-app-capable', 'yes');

    // --- Apple-Specific Meta Tags (Full Compliance) ---
    addMeta('apple-mobile-web-app-capable', 'yes');
    addMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    addMeta('apple-mobile-web-app-title', 'Alchemize');
    addMeta('apple-touch-fullscreen', 'yes');

    // --- Apple Touch Icons (all required sizes) ---
    addLink('apple-touch-icon', ICON_URL);
    addLink('apple-touch-icon', ICON_URL, { sizes: '120x120' });
    addLink('apple-touch-icon', ICON_URL, { sizes: '152x152' });
    addLink('apple-touch-icon', ICON_URL, { sizes: '167x167' });
    addLink('apple-touch-icon', ICON_URL, { sizes: '180x180' });
    addLink('apple-touch-icon-precomposed', ICON_URL);

    // --- Apple Splash Screens ---
    addLink('apple-touch-startup-image', ICON_URL);

    // --- Preconnect for performance ---
    addLink('preconnect', 'https://qtrypzzcjebvfcihiynt.supabase.co');
    addLink('dns-prefetch', 'https://qtrypzzcjebvfcihiynt.supabase.co');

    // --- Viewport (Apple-optimized) ---
    const existingViewport = document.querySelector('meta[name="viewport"]');
    if (existingViewport) {
      existingViewport.content = 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, shrink-to-fit=no';
    }

    // --- Color scheme ---
    addMeta('color-scheme', 'dark');
    addMeta('supported-color-schemes', 'dark');

    // --- X-UA compatibility ---
    addMeta('X-UA-Compatible', 'IE=edge', true);

    // --- Robots (for App Store crawling) ---
    addMeta('robots', 'index, follow');

    return () => {
      injected.forEach(el => el.parentNode?.removeChild(el));
      URL.revokeObjectURL(manifestBlobUrl);
    };
  }, []);

  return null;
}