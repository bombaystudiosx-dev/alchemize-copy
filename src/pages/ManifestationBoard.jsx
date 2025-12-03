import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import CosmicCard from '@/components/cosmic/CosmicCard';
import GlowButton from '@/components/cosmic/GlowButton';
import CosmicInput from '@/components/cosmic/CosmicInput';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, Plus, X, Sparkles, Heart, DollarSign, 
  Briefcase, Brain, Star, Image as ImageIcon
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categoryIcons = {
  love: Heart,
  wealth: DollarSign,
  health: Star,
  career: Briefcase,
  spiritual: Brain,
  other: Sparkles
};

const categoryColors = {
  love: 'from-pink-500 to-rose-600',
  wealth: 'from-green-500 to-emerald-600',
  health: 'from-red-500 to-orange-500',
  career: 'from-blue-500 to-indigo-600',
  spiritual: 'from-violet-500 to-purple-600',
  other: 'from-slate-500 to-gray-600'
};

export default function ManifestationBoard() {
  const [showDialog, setShowDialog] = useState(false);
  const [newTile, setNewTile] = useState({ title: '', description: '', category: 'other', image_url: '' });
  const queryClient = useQueryClient();

  const { data: tiles = [], isLoading } = useQuery({
    queryKey: ['manifestations'],
    queryFn: () => base44.entities.ManifestationTile.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ManifestationTile.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['manifestations']);
      setShowDialog(false);
      setNewTile({ title: '', description: '', category: 'other', image_url: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ManifestationTile.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['manifestations'])
  });

  return (
    <CosmicBackground>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-6 py-4 sticky top-0 z-50 bg-gradient-to-b from-[#0a0118] to-transparent"
        >
          <Link to={createPageUrl('Home')} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Manifestation Board</h1>
          <button 
            onClick={() => setShowDialog(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </motion.header>

        {/* Content */}
        <div className="px-6">
          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <p className="text-purple-200/70">
              Visualize your dreams. Add images, quotes, and intentions to manifest your desires.
            </p>
          </motion.div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : tiles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Your Board Awaits</h3>
              <p className="text-white/50 mb-6">Start manifesting by adding your first intention</p>
              <GlowButton onClick={() => setShowDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Tile
              </GlowButton>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              <AnimatePresence>
                {tiles.map((tile, index) => {
                  const Icon = categoryIcons[tile.category] || Sparkles;
                  return (
                    <motion.div
                      key={tile.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative"
                    >
                      <CosmicCard className="aspect-square p-4 flex flex-col justify-between overflow-hidden">
                        {tile.image_url && (
                          <div className="absolute inset-0 z-0">
                            <img 
                              src={tile.image_url} 
                              alt={tile.title}
                              className="w-full h-full object-cover opacity-30"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a2e] to-transparent" />
                          </div>
                        )}
                        
                        <div className="relative z-10">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${categoryColors[tile.category]} flex items-center justify-center mb-2`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        
                        <div className="relative z-10">
                          <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
                            {tile.title}
                          </h3>
                          {tile.description && (
                            <p className="text-xs text-white/60 line-clamp-2">
                              {tile.description}
                            </p>
                          )}
                        </div>
                        
                        <button
                          onClick={() => deleteMutation.mutate(tile.id)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </CosmicCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Add Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-purple-500/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Add Manifestation
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Intention / Title</label>
                <CosmicInput
                  value={newTile.title}
                  onChange={(e) => setNewTile({ ...newTile, title: e.target.value })}
                  placeholder="I am attracting..."
                />
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Description (Optional)</label>
                <Textarea
                  value={newTile.description}
                  onChange={(e) => setNewTile({ ...newTile, description: e.target.value })}
                  placeholder="Add more details..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-[80px]"
                />
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Category</label>
                <Select
                  value={newTile.category}
                  onValueChange={(value) => setNewTile({ ...newTile, category: value })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a0a2e] border-purple-500/30">
                    <SelectItem value="love">💖 Love</SelectItem>
                    <SelectItem value="wealth">💰 Wealth</SelectItem>
                    <SelectItem value="health">❤️ Health</SelectItem>
                    <SelectItem value="career">💼 Career</SelectItem>
                    <SelectItem value="spiritual">🧘 Spiritual</SelectItem>
                    <SelectItem value="other">✨ Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Image URL (Optional)</label>
                <CosmicInput
                  value={newTile.image_url}
                  onChange={(e) => setNewTile({ ...newTile, image_url: e.target.value })}
                  placeholder="https://..."
                  icon={ImageIcon}
                />
              </div>
              
              <GlowButton
                onClick={() => createMutation.mutate(newTile)}
                disabled={!newTile.title || createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? 'Manifesting...' : 'Add to Board'}
              </GlowButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CosmicBackground>
  );
}