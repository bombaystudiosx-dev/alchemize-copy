// All features are free - paywall removed
export const FREE_FEATURE_IDS = ['manifestation', 'affirmations', 'gratitude', 'goals', 'habits', 'finance', 'fitness', 'calories', 'appointments', 'todo', 'settings'];

export function isDevMode() {
  return true;
}

export function isPremiumUser(user) {
  return true;
}

export function isFeatureLocked(featureId, user) {
  return false;
}