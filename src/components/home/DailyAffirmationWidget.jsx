import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DailyAffirmationWidget() {
  const { data: affirmations = [] } = useQuery({
    queryKey: ['affirmations-widget'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Affirmation.filter({ created_by: user.email });
    },
    staleTime: 5 * 60 * 1000,
  });

  if (affirmations.length === 0) return null;

  // Stable daily pick based on date
  const today = new Date().toDateString();
  const index = today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % affirmations.length;
  const daily = affirmations[index];

  return (
    <Link to={createPageUrl('Affirmations')}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mx-6 mb-4 p-4 rounded-2xl bg-gradient-to-br from-pink-500/15 to-purple-500/15 border border-white/10 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-purple-300 uppercase tracking-wider font-medium">Today's Affirmation</span>
        </div>
        <p className="text-white/90 text-sm italic leading-relaxed">"{daily.text}"</p>
      </motion.div>
    </Link>
  );
}