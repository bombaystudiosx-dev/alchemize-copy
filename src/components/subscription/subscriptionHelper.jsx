// Free tier gets 3 features: manifestation, affirmations, gratitude
export const FREE_FEATURE_IDS = ['manifestation', 'affirmations', 'gratitude'];

export function isDevMode() {
  return localStorage.getItem('dev_mode_unlocked') === 'true';
}

export function setDevMode(enabled) {
  localStorage.setItem('dev_mode_unlocked', enabled ? 'true' : 'false');
}

export function isPremiumUser(user) {
  if (isDevMode()) return true;
  return user?.subscription_status === 'active' || user?.subscription_status === 'trialing';
}

export function isFeatureLocked(featureId, user) {
  if (isDevMode()) return false;
  if (isPremiumUser(user)) return false;
  return !FREE_FEATURE_IDS.includes(featureId);
}