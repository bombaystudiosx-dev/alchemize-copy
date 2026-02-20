// Free tier gets 3 features: manifestation, affirmations, gratitude
export const FREE_FEATURE_IDS = ['manifestation', 'affirmations', 'gratitude'];

export function isPremiumUser(user) {
  return user?.subscription_status === 'active' || user?.subscription_status === 'trialing';
}

export function isFeatureLocked(featureId, user) {
  if (isPremiumUser(user)) return false;
  return !FREE_FEATURE_IDS.includes(featureId);
}