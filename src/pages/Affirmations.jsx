import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import CosmicCard from '@/components/cosmic/CosmicCard';
import GlowButton from '@/components/cosmic/GlowButton';
// Removed unused CosmicInput import
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, Heart, Star, Trash2, Pin, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const categoryEmojis = {
  'self-love': '💖',
  'abundance': '💰',
  'health': '❤️‍🔥',
  'success': '🏆',
  'relationships': '🤝',
  'gratitude': '🙏'
};

export default function Affirmations() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [newAffirmation, setNewAffirmation] = useState({ text: '', category: 'self-love' });
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: affirmations = [], isLoading } = useQuery({
    queryKey: ['affirmations'],
    queryFn: () => base44.entities.Affirmation.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Affirmation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['affirmations']);
      setShowDialog(false);
      setEditingAppointment(null);
      setNewAffirmation({ text: '', category: 'self-love' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Affirmation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['affirmations']);
      setShowDialog(false);
      setEditingAppointment(null);
      setNewAffirmation({ text: '', category: 'self-love' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Affirmation.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['affirmations'])
  });

  const filteredAffirmations = filter === 'all' 
    ? affirmations 
    : filter === 'favorites'
    ? affirmations.filter(a => a.is_favorite)
    : affirmations.filter(a => a.category === filter);

  // Use stable daily affirmation based on date, not random on each render
  const todayAffirmation = React.useMemo(() => {
    if (affirmations.length === 0) return null;
    const today = new Date().toDateString();
    const index = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % affirmations.length;
    return affirmations[index];
  }, [affirmations]);

  return (
    <CosmicBackground>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-6 py-4 sticky top-0 z-50 bg-gradient-to-b from-[#0a0118] to-transparent"
        >
          <Link to={createPageUrl('Home')} className="flex items-center gap-2 text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Affirmations</h1>
          <button 
            onClick={() => setShowDialog(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </motion.header>

        <div className="px-6">
          {/* Pinned Post */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <CosmicCard className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
              <p 
                className="text-sm leading-relaxed text-center"
                style={{
                  background: 'linear-gradient(135deg, #ffd700, #a855f7, #ffd700)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.7)) drop-shadow(0 0 20px rgba(255, 215, 0, 0.5))',
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: 'italic',
                  letterSpacing: '0.02em'
                }}
              >
                It is recommended to say these for at least 60-90 days that is how long your subconscious mind takes to accept beliefs. However, by all means say them until reality reflects them
              </p>
            </CosmicCard>
          </motion.div>

          {/* Today's Affirmation */}
          {todayAffirmation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <CosmicCard className="text-center py-8 bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                <p className="text-sm text-purple-300 mb-3 uppercase tracking-wider">Today's Affirmation</p>
                <p className="text-xl md:text-2xl font-medium text-white leading-relaxed px-4">
                  "{todayAffirmation.text}"
                </p>
                <div className="mt-4 text-3xl">
                  {categoryEmojis[todayAffirmation.category]}
                </div>
              </CosmicCard>
            </motion.div>
          )}

          {/* Filter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide"
          >
            {['all', 'favorites', 'self-love', 'abundance', 'health', 'success', 'relationships', 'gratitude'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`
                  px-4 py-2 rounded-full whitespace-nowrap text-sm transition-all
                  ${filter === cat 
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white' 
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }
                `}
              >
                {cat === 'favorites' ? '⭐ ' : cat !== 'all' ? categoryEmojis[cat] + ' ' : ''}
                {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
              </button>
            ))}
          </motion.div>

          {/* List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : filteredAffirmations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Affirmations Yet</h3>
              <p className="text-white/50 mb-6">Start your self-love journey</p>
              <GlowButton onClick={() => setShowDialog(true)}>
                Add Affirmation
              </GlowButton>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredAffirmations.map((affirmation, index) => (
                  <motion.div
                    key={affirmation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <CosmicCard className="flex items-center gap-4">
                      <span className="text-2xl">
                        {categoryEmojis[affirmation.category]}
                      </span>
                      <p className="flex-1 text-white/90">{affirmation.text}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingAppointment(affirmation);
                            setNewAffirmation({ text: affirmation.text, category: affirmation.category });
                            setShowDialog(true);
                          }}
                          className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                          <Edit2 className="w-5 h-5 text-white/60" />
                        </button>
                        <button
                          onClick={() => updateMutation.mutate({
                            id: affirmation.id,
                            data: { is_favorite: !affirmation.is_favorite }
                          })}
                          className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                          <Star className={`w-5 h-5 ${affirmation.is_favorite ? 'text-yellow-400 fill-yellow-400' : 'text-white/40'}`} />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(affirmation.id)}
                          className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-white/40 hover:text-red-400" />
                        </button>
                      </div>
                    </CosmicCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Add Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-pink-500/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                {editingAppointment ? 'Edit Affirmation' : 'Add Affirmation'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Affirmation</label>
                <Textarea
                  value={newAffirmation.text}
                  onChange={(e) => setNewAffirmation({ ...newAffirmation, text: e.target.value })}
                  placeholder="I am worthy of love and abundance..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-[100px]"
                />
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Category</label>
                <Select
                  value={newAffirmation.category}
                  onValueChange={(value) => setNewAffirmation({ ...newAffirmation, category: value })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a0a2e] border-purple-500/30">
                    {Object.entries(categoryEmojis).map(([key, emoji]) => (
                      <SelectItem key={key} value={key}>
                        {emoji} {key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <GlowButton
                onClick={() => {
                  if (editingAppointment) {
                    updateMutation.mutate({ id: editingAppointment.id, data: newAffirmation });
                  } else {
                    createMutation.mutate(newAffirmation);
                  }
                }}
                disabled={!newAffirmation.text || createMutation.isPending || updateMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingAppointment ? 'Update Affirmation' : 'Add Affirmation'}
              </GlowButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CosmicBackground>
  );
}