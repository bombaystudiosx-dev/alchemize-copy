import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { isPremiumUser, FREE_FEATURE_IDS } from '@/components/subscription/subscriptionHelper';
import { Crown, Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PremiumGate({ featureId, children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return null;

  // Free features and premium users pass through
  if (FREE_FEATURE_IDS.includes(featureId) || isPremiumUser(user)) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#1a0a2e] to-[#0d0620] flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-sm">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400/20 to-purple-600/20 flex items-center justify-center mx-auto">
          <Lock className="w-10 h-10 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Premium Feature</h2>
        <p className="text-white/50 text-base leading-relaxed">
          This feature is available with Alchemize Premium. Upgrade to unlock all tools and transform your reality.
        </p>
        <Link
          to={createPageUrl('Premium')}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg shadow-lg shadow-purple-500/30"
        >
          <Crown className="w-5 h-5" />
          Upgrade to Premium
        </Link>
        <Link
          to={createPageUrl('Home')}
          className="block text-white/40 text-sm hover:text-white/60 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}