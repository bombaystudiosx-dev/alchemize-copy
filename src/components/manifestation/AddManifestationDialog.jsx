import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import GlowButton from '@/components/cosmic/GlowButton';
import ImageUploader from '@/components/common/ImageUploader';
import { moods } from './MoodSelector';

export default function AddManifestationDialog({ 
  open, 
  onOpenChange, 
  editingTile, 
  onSubmit,
  isPending 
}) {
  const [newTile, setNewTile] = useState({ 
    title: editingTile?.title || '', 
    image_url: editingTile?.image_url || '',
    category: editingTile?.category || 'other'
  });

  React.useEffect(() => {
    if (editingTile) {
      setNewTile({
        title: editingTile.title || '',
        image_url: editingTile.image_url || '',
        category: editingTile.category || 'other'
      });
    } else {
      setNewTile({ title: '', image_url: '', category: 'other' });
    }
  }, [editingTile, open]);

  const handleSubmit = () => {
    onSubmit(newTile, editingTile?.id);
  };

  const moodOptions = moods.filter(m => m.id !== 'all');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-purple-500/30 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            {editingTile ? 'Edit Vision' : 'Add Manifestation'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 mt-4">
          {/* Image Upload */}
          <div>
            <label className="text-sm text-purple-200/70 mb-2 block">Vision Image</label>
            <ImageUploader
              currentImageUrl={newTile.image_url}
              onImageUploaded={(url) => setNewTile({ ...newTile, image_url: url })}
              onRemove={() => setNewTile({ ...newTile, image_url: '' })}
              aspectRatio="wide"
              showCamera={true}
            />
          </div>
          
          {/* Intention Text */}
          <div>
            <label className="text-sm text-purple-200/70 mb-2 block">Your Intention</label>
            <Textarea
              value={newTile.title}
              onChange={(e) => setNewTile({ ...newTile, title: e.target.value })}
              placeholder="I am attracting abundance and joy..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-[100px] text-lg"
            />
          </div>

          {/* Mood Tag Selection */}
          <div>
            <label className="text-sm text-purple-200/70 mb-3 block">Mood Tag (optional)</label>
            <div className="grid grid-cols-4 gap-2">
              {moodOptions.map((mood) => (
                <motion.button
                  key={mood.id}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNewTile({ ...newTile, category: mood.id })}
                  className={`
                    flex flex-col items-center gap-1 p-3 rounded-xl transition-all
                    ${newTile.category === mood.id 
                      ? `bg-gradient-to-br ${mood.color} shadow-lg` 
                      : 'bg-white/10 hover:bg-white/20'
                    }
                  `}
                  style={{
                    boxShadow: newTile.category === mood.id ? `0 0 15px ${mood.glow}` : 'none'
                  }}
                >
                  <span className="text-xl">{mood.emoji}</span>
                  <span className="text-[10px] text-white/80">{mood.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
          
          <GlowButton
            onClick={handleSubmit}
            disabled={!newTile.title || !newTile.image_url || isPending}
            className="w-full"
          >
            {isPending ? 'Saving...' : (editingTile ? 'Update Vision' : 'Create Portal')}
          </GlowButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}