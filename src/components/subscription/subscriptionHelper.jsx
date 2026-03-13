// Free tier gets 3 features: manifestation, affirmations, gratitude
export const FREE_FEATURE_IDS = ['manifestation', 'affirmations', 'gratitude'];

export function isPremiumUser(user) {
  // Check all possible subscription status fields (old and new schema)
  const oldStatus = user?.subscription_status;
  const newStatus = user?.subscriptionStatus;
  const accessLevel = user?.accessLevel;
  
  return (
    oldStatus === 'active' || 
    oldStatus === 'trialing' || 
    newStatus === 'active' || 
    newStatus === 'trialing' ||
    accessLevel === 'Pro'
  );
}

export function isFeatureLocked(featureId, user) {
  if (isPremiumUser(user)) return false;
  return !FREE_FEATURE_IDS.includes(featureId);
}