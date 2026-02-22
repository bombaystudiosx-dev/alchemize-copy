import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { logEvent } from '@/components/common/appLogger';

/**
 * useBackNav(fallbackPage, currentScreen)
 * Returns a goBack() that uses navigate(-1) when history exists, else goes to fallback page.
 */
export default function useBackNav(fallbackPage = 'Home', currentScreen = 'unknown') {
  const navigate = useNavigate();

  const goBack = () => {
    logEvent('navigation', currentScreen, 'back', 'ok', { fallback: fallbackPage });
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(createPageUrl(fallbackPage));
    }
  };

  return goBack;
}