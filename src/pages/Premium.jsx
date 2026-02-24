import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import PlanCard from '@/components/subscription/PlanCard';
import { 
  Crown, Sparkles, Star, Wand2, Eye, 
  Zap, Loader2 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FREE_FEATURE_IDS } from '@/components/subscription/subscriptionHelper';

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '15.55',
    interval: 'month',
    trial: true,
    popular: true,
  },
];

const FEATURES = [
  { icon: Wand2, text: 'Advanced Manifestation Tools' },
  { icon: Eye, text: 'AI Vision Board Generator' },
  { icon: Star, text: 'Unlimited Affirmations' },
  { icon: Zap, text: 'Priority AI Chat Support' },
  { icon: Sparkles, text: 'Exclusive Cosmic Themes' },
];

export default function Premium() {
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (window.self !== window.top) {
      alert('Checkout works only from the published app. Please open the app directly.');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('createCheckout', { plan: selectedPlan });
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (e) {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/ce90c0d9f_B28AA351-FB07-478A-8B1E-FB90E998F0B7.png)'
        }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 min-h-screen flex flex-col px-5 pt-12 pb-8 safe-area-top safe-area-bottom">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 mb-6"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/30">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 
            className="text-3xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #ffd700, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Alchemize Premium
          </h1>
          <p className="text-white/60 text-sm">
            Unlock the full power of transformation
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 p-4 space-y-3 mb-6"
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 300, damping: 24 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/10">
                  <Icon className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-white/90 text-sm">{feature.text}</span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3 mb-6"
        >
          <h2 className="text-xs font-semibold text-purple-400/80 uppercase tracking-widest px-1">
            Choose Your Plan
          </h2>
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlan === plan.id}
              onSelect={setSelectedPlan}
              popular={plan.popular}
            />
          ))}
        </motion.div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Subscribe Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <motion.button
            onClick={handleSubscribe}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="relative w-full py-4 rounded-2xl overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white font-bold text-lg shadow-xl shadow-purple-500/40 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ backgroundSize: '200% 100%' }}
          >
            {/* Shimmer overlay */}
            {!loading && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 0.8 }}
              />
            )}
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {selectedPlan === 'monthly' ? 'Start 7-Day Free Trial' : 'Subscribe Now'}
              </>
            )}
          </motion.button>
          {selectedPlan === 'monthly' && (
            <p className="text-center text-white/40 text-xs">
              Then $15.55/month after trial. Cancel anytime.
            </p>
          )}

          {/* Skip / Free tier */}
          <button
            onClick={() => {
              localStorage.setItem('skipped_premium', 'true');
              window.location.href = createPageUrl('Home');
            }}
            className="w-full py-3 text-white/40 text-sm font-medium hover:text-white/60 transition-colors"
          >
            Continue with Free Plan (3 features)
          </button>

          {/* Restore Purchase */}
          <button
            onClick={async () => {
              try {
                setLoading(true);
                const res = await base44.functions.invoke('restorePurchase');
                if (res.data?.found) {
                  alert('Subscription restored! Redirecting...');
                  window.location.href = createPageUrl('Home');
                } else {
                  alert(res.data?.message || 'No active subscription found.');
                }
              } catch (e) {
                alert('Could not restore purchase. Please try again.');
              } finally {
                setLoading(false);
              }
            }}
            className="w-full py-2 text-white/30 text-xs font-medium hover:text-white/50 transition-colors"
          >
            Restore Purchase
          </button>

          {/* Footer */}
          <div className="text-center text-white/30 text-xs space-y-1 pt-2">
            <p>Subscriptions auto-renew. Cancel anytime.</p>
            <p>Payments processed securely by Stripe.</p>
            <div className="flex items-center justify-center gap-3 pt-1">
              <Link to={createPageUrl('Terms')} className="hover:text-white/60 transition-colors">
                Terms
              </Link>
              <span>•</span>
              <Link to={createPageUrl('Privacy')} className="hover:text-white/60 transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}