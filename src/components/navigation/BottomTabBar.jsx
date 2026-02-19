import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Flame, Compass, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const TAB_BAR_HEIGHT = 56;

const STORAGE_KEY_LAST = 'tabs:lastRouteByTab:v1';
const STORAGE_KEY_SCROLL = 'tabs:scrollByRoute:v1';

function loadRecord(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
}
function saveRecord(key, v) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
}

const TABS = [
  {
    key: 'home',
    label: 'Home',
    icon: Home,
    rootPage: 'Home',
    pages: ['Home', 'Finance', 'CalorieTracker', 'Fitness', 'TodoList', 'Appointments']
  },
  {
    key: 'streaks',
    label: 'Streaks',
    icon: Flame,
    rootPage: 'Habits',
    pages: ['Habits']
  },
  {
    key: 'explore',
    label: 'Explore',
    icon: Compass,
    rootPage: 'ManifestationBoard',
    pages: ['ManifestationBoard', 'Affirmations', 'Goals', 'Journal']
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: User,
    rootPage: 'Settings',
    pages: ['Settings']
  }
];

export const HIDDEN_TAB_PAGES = ['Splash', 'Terms', 'Privacy', 'AgentChat'];

export default function BottomTabBar({ currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [lastRouteByTab, setLastRouteByTab] = useState(() => ({
    home: '', streaks: '', explore: '', profile: '',
    ...loadRecord(STORAGE_KEY_LAST)
  }));

  // Don't render on hidden pages
  if (HIDDEN_TAB_PAGES.includes(currentPageName)) return null;

  // Determine current tab from page name
  const currentTab = useMemo(() => {
    const tab = TABS.find(t => t.pages.includes(currentPageName));
    return tab?.key || 'home';
  }, [currentPageName]);

  // Save last route per tab on navigation
  useEffect(() => {
    const fullPath = location.pathname + location.search + location.hash;
    const tab = TABS.find(t => t.pages.includes(currentPageName));
    if (!tab) return;

    setLastRouteByTab(prev => {
      const next = { ...prev, [tab.key]: fullPath };
      saveRecord(STORAGE_KEY_LAST, next);
      return next;
    });
  }, [location.pathname, location.search, location.hash, currentPageName]);

  // Scroll position preservation - save on scroll
  useEffect(() => {
    const onScroll = () => {
      const routeKey = location.pathname + location.search;
      const store = loadRecord(STORAGE_KEY_SCROLL);
      store[routeKey] = window.scrollY;
      saveRecord(STORAGE_KEY_SCROLL, store);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname, location.search]);

  // Scroll position preservation - restore on mount
  useEffect(() => {
    const routeKey = location.pathname + location.search;
    const store = loadRecord(STORAGE_KEY_SCROLL);
    const y = store[routeKey];
    if (typeof y === 'number') {
      requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'auto' }));
    }
  }, [location.pathname, location.search]);

  const onTabPress = (tab) => {
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(8);
    
    if (tab.key === currentTab) {
      // Re-tap active tab → pop to root
      navigate(createPageUrl(tab.rootPage));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const last = lastRouteByTab[tab.key];
    navigate(last || createPageUrl(tab.rootPage));
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        minHeight: TAB_BAR_HEIGHT,
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        background: 'rgba(10, 1, 24, 0.85)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
        touchAction: 'manipulation',
      }}
      role="tablist"
      aria-label="Primary navigation"
    >
      <div className="flex items-center justify-around h-[52px] max-w-lg mx-auto">
        {TABS.map(t => {
          const active = t.key === currentTab;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => onTabPress(t)}
              type="button"
              role="tab"
              aria-selected={active}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
              style={{
                minHeight: 52,
                padding: '8px 6px',
                gap: 3,
                background: 'transparent',
                border: 0,
                color: active ? 'var(--brand)' : 'var(--muted)',
              }}
            >
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ background: 'var(--brand)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5 transition-colors duration-200" style={{ color: 'inherit' }} />
              <span
                className="font-medium transition-colors duration-200"
                style={{ fontSize: 12, lineHeight: '14px', color: 'inherit' }}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}