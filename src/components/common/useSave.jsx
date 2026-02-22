import { useState, useCallback } from 'react';
import { toast } from '@/components/common/AppToast';
import { logEvent } from '@/components/common/appLogger';

/**
 * useSave({ screen, saveFn, successMsg, onSuccess })
 * Returns { saving, save, dirty, setDirty }
 */
export default function useSave({ screen = 'unknown', saveFn, successMsg = 'Saved ✓', onSuccess }) {
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const save = useCallback(async (payload) => {
    if (saving) return;
    setSaving(true);
    logEvent('save', screen, 'save_attempt', 'pending');
    try {
      const result = await saveFn(payload);
      setDirty(false);
      toast(successMsg, 'success');
      logEvent('save', screen, 'save_result', 'success');
      onSuccess?.(result);
    } catch (err) {
      const msg = err?.message || 'Save failed. Please try again.';
      toast(msg, 'error');
      logEvent('save', screen, 'save_result', 'fail', { error: msg });
    } finally {
      setSaving(false);
    }
  }, [saving, saveFn, screen, successMsg, onSuccess]);

  return { saving, save, dirty, setDirty };
}