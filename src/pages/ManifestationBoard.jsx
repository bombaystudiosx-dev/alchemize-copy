import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import GlowButton from '@/components/cosmic/GlowButton';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, Plus, X, Sparkles, ChevronLeft, ChevronRight, 
  Pencil, Trash2, Upload
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function ManifestationBoard() {
  const [showDialog, setShowDialog] = useState(false);
  const [showEditOptions, setShowEditOptions] = useState(false);
  const [editingTile, setEditingTile] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newTile, setNewTile] = useState({ title: '', image_url: '' });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
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
      setNewTile({ title: '', image_url: '' });
      setEditingTile(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ManifestationTile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['manifestations']);
      setShowDialog(false);
      setNewTile({ title: '', image_url: '' });
      setEditingTile(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ManifestationTile.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['manifestations']);
      setShowEditOptions(false);
      if (currentIndex >= tiles.length - 1) {
        setCurrentIndex(Math.max(0, tiles.length - 2));
      }
    }
  });

  // Auto-advance slideshow every 3 seconds
  useEffect(() => {
    if (tiles.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tiles.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [tiles.length]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + tiles.length) % tiles.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % tiles.length);
  };

  const handleSlideClick = () => {
    if (tiles.length > 0) {
      setShowEditOptions(true);
    }
  };

  const handleEdit = () => {
    const tile = tiles[currentIndex];
    setEditingTile(tile);
    setNewTile({ title: tile.title || '', image_url: tile.image_url || '' });
    setShowEditOptions(false);
    setShowDialog(true);
  };

  const handleDelete = () => {
    const tile = tiles[currentIndex];
    deleteMutation.mutate(tile.id);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setNewTile({ ...newTile, image_url: file_url });
    setIsUploading(false);
  };

  const handleSubmit = () => {
    if (editingTile) {
      updateMutation.mutate({ id: editingTile.id, data: newTile });
    } else {
      createMutation.mutate(newTile);
    }
  };

  const currentTile = tiles[currentIndex];

  return (
    <CosmicBackground>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-6 py-4 z-50"
        >
          <Link to={createPageUrl('Home')} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Manifestation Board</h1>
          <button 
            onClick={() => {
              setEditingTile(null);
              setNewTile({ title: '', image_url: '' });
              setShowDialog(true);
            }}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </motion.header>

        {/* Slideshow */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
          {isLoading ? (
            <div className="w-full max-w-lg aspect-[3/4] rounded-3xl bg-white/5 animate-pulse" />
          ) : tiles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3">Your Vision Awaits</h3>
              <p className="text-white/50 mb-8 max-w-xs mx-auto">
                Add images and intentions to create your manifestation slideshow
              </p>
              <GlowButton onClick={() => setShowDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Vision
              </GlowButton>
            </motion.div>
          ) : (
            <>
              {/* Slideshow Container */}
              <div 
                className="relative w-full max-w-lg aspect-[3/4] cursor-pointer"
                onClick={handleSlideClick}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 rounded-3xl overflow-hidden"
                  >
                    {/* Image */}
                    {currentTile?.image_url ? (
                      <img 
                        src={currentTile.image_url}
                        alt={currentTile.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-indigo-900/50 flex items-center justify-center">
                        <Sparkles className="w-16 h-16 text-purple-400/50" />
                      </div>
                    )}
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Intention text */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl font-medium text-white leading-relaxed"
                        style={{
                          textShadow: '0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)'
                        }}
                      >
                        {currentTile?.title}
                      </motion.p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {tiles.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); goToNext(); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Dots indicator */}
              {tiles.length > 1 && (
                <div className="flex items-center gap-2 mt-6">
                  {tiles.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`
                        transition-all duration-300 rounded-full
                        ${currentIndex === index 
                          ? 'w-8 h-2 bg-gradient-to-r from-purple-500 to-indigo-500' 
                          : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                        }
                      `}
                    />
                  ))}
                </div>
              )}

              {/* Slide count */}
              <p className="text-white/40 text-sm mt-4">
                {currentIndex + 1} of {tiles.length}
              </p>
            </>
          )}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-purple-500/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                {editingTile ? 'Edit Vision' : 'Add Vision'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-5 mt-4">
              {/* Image Upload */}
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Image</label>
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
              
              <GlowButton
                onClick={handleSubmit}
                disabled={!newTile.title || !newTile.image_url || createMutation.isPending || updateMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingTile ? 'Update Vision' : 'Add Vision')}
              </GlowButton>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Options Dialog */}
        <Dialog open={showEditOptions} onOpenChange={setShowEditOptions}>
          <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-purple-500/30 text-white max-w-xs">
            <div className="space-y-3 pt-4">
              <button
                onClick={handleEdit}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
              >
                <Pencil className="w-5 h-5 text-purple-400" />
                <span>Edit Vision</span>
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-colors text-red-300"
              >
                <Trash2 className="w-5 h-5" />
                <span>{deleteMutation.isPending ? 'Deleting...' : 'Delete Vision'}</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CosmicBackground>
  );
}