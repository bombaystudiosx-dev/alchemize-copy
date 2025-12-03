import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Upload, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import GlowButton from '@/components/cosmic/GlowButton';
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setNewTile({ ...newTile, image_url: file_url });
    setIsUploading(false);
  };

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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            
            {newTile.image_url ? (
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <img 
                  src={newTile.image_url} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setNewTile({ ...newTile, image_url: '' })}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full aspect-video rounded-xl border-2 border-dashed border-purple-500/30 flex flex-col items-center justify-center gap-3 hover:border-purple-500/50 transition-colors"
              >
                {isUploading ? (
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-purple-400" />
                    <span className="text-purple-200/70 text-sm">Tap to upload image</span>
                  </>
                )}
              </button>
            )}
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