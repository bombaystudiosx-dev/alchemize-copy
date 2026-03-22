import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { logEvent } from '@/components/common/appLogger';

/**
 * useBackNav(fallbackPage, currentScreen)
 * Returns a goBack() that navigates in-app only.
 *
 * window.history.length > 1 is unreliable — it counts entries from OTHER sites
 * visited before the app, so navigate(-1) can exit the PWA/browser tab entirely.
 *
 * React Router v6 injects `history.state.idx` (0-based index within the app's
 * own history stack). We use that to decide whether a back step stays in-app.
 */
export default function useBackNav(fallbackPage = 'Home', currentScreen = 'unknown') {
  const navigate = useNavigate();

  const goBack = () => {
    logEvent('navigation', currentScreen, 'back', 'ok', { fallback: fallbackPage });
    // history.state.idx is the position within React Router's managed stack.
    // If > 0 there is a previous in-app entry; otherwise fall back to the root page.
    const hasInAppHistory = (window.history.state?.idx ?? 0) > 0;
    if (hasInAppHistory) {
      navigate(-1);
    } else {
      navigate(createPageUrl(fallbackPage));
    }
  };

  return goBack;
}