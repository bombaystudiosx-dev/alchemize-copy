import { useState, useRef, useCallback } from 'react';
import { toast } from '@/components/common/AppToast';
import { logEvent } from '@/components/common/appLogger';

/**
 * Hook for safe async actions with:
 * - Loading state
 * - Double-tap prevention
 * - Toast on success/error
 * - Event logging with latency
 */
export default function useAsyncAction(screen = 'unknown') {
  const [loading, setLoading] = useState(false);
  const lockRef = useRef(false);

  const run = useCallback(async (actionName, fn, { successMsg, errorMsg, silent } = {}) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setLoading(true);
    const start = Date.now();

    try {
      const result = await fn();
      const latency = Date.now() - start;
      logEvent('action', screen, actionName, 'pass', { latency });
      if (successMsg && !silent) toast.success(successMsg);
      return result;
    } catch (err) {
      const latency = Date.now() - start;
      logEvent('action', screen, actionName, 'fail', { latency, error: err?.message });
      if (!silent) toast.error(errorMsg || err?.message || 'Something went wrong');
      return undefined;
    } finally {
      setLoading(false);
      // Small cooldown to prevent rage taps
      setTimeout(() => { lockRef.current = false; }, 300);
    }
  }, [screen]);

  return { loading, run };
}