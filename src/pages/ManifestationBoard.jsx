import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import GlowButton from '@/components/cosmic/GlowButton';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plus, Sparkles, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

import MoodSelector, { getMoodColors } from '@/components/manifestation/MoodSelector';
import PortalTile from '@/components/manifestation/PortalTile';
import PortalView from '@/components/manifestation/PortalView';
import AddManifestationDialog from '@/components/manifestation/AddManifestationDialog';
import DailyRitualModal from '@/components/manifestation/DailyRitualModal';

export default function ManifestationBoard() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingTile, setEditingTile] = useState(null);
  const [selectedMood, setSelectedMood] = useState(() => 
    localStorage.getItem('manifestation_mood') || 'all'
  );
  const [portalViewIndex, setPortalViewIndex] = useState(null);
  const [dailyRitualEnabled, setDailyRitualEnabled] = useState(() => 
    localStorage.getItem('daily_ritual') === 'true'
  );
  const [showDailyRitual, setShowDailyRitual] = useState(false);
  const [ritualShown, setRitualShown] = useState(false);
  const [driftOffset, setDriftOffset] = useState({ x: 0, y: 0 });
  const [ritualTiles, setRitualTiles] = useState([]);
  
  const queryClient = useQueryClient();
  const moodColor = getMoodColors(selectedMood);

  const { data: tiles = [], isLoading } = useQuery({
    queryKey: ['manifestations'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.ManifestationTile.filter({ created_by: user.email }, '-created_date');
    }
  });

  // Filter tiles by mood
  const filteredTiles = selectedMood === 'all' 
    ? tiles 
    : tiles.filter(t => (t.category || 'other') === selectedMood);

  // Save mood preference
  useEffect(() => {
    localStorage.setItem('manifestation_mood', selectedMood);
  }, [selectedMood]);

  // Save daily ritual preference
  useEffect(() => {
    localStorage.setItem('daily_ritual', dailyRitualEnabled.toString());
  }, [dailyRitualEnabled]);

  // Show daily ritual on first load if enabled
  useEffect(() => {
    if (dailyRitualEnabled && tiles.length > 0 && !ritualShown) {
      const lastRitualDate = localStorage.getItem('last_ritual_date');
      const today = new Date().toDateString();
      
      if (lastRitualDate !== today) {
        // Prepare 3-5 random tiles for slideshow
        const shuffled = [...tiles].sort(() => Math.random() - 0.5);
        const count = Math.min(5, Math.max(3, tiles.length));
        setRitualTiles(shuffled.slice(0, count));
        setShowDailyRitual(true);
        localStorage.setItem('last_ritual_date', today);
      }
      setRitualShown(true);
    }
  }, [dailyRitualEnabled, tiles, ritualShown]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ManifestationTile.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['manifestations']);
      setShowDialog(false);
      setEditingTile(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ManifestationTile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['manifestations']);
      setShowDialog(false);
      setEditingTile(null);
      if (portalViewIndex !== null) {
        // Stay in portal view after edit
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ManifestationTile.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['manifestations']);
      setPortalViewIndex(null);
    }
  });

  const handleSubmit = (data, editId) => {
    if (editId) {
      updateMutation.mutate({ id: editId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleTileClick = (index) => {
    setPortalViewIndex(index);
  };

  const handleEdit = (tile) => {
    setEditingTile(tile);
    setPortalViewIndex(null);
    setShowDialog(true);
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  const handlePortalNavigate = useCallback((newIndex) => {
    setPortalViewIndex(newIndex);
  }, []);

  // Handle swipe drift effect
  const handleDragStart = () => {};
  const handleDrag = (e, info) => {
    setDriftOffset({ x: info.offset.x * 0.1, y: 0 });
  };
  const handleDragEnd = () => {
    setDriftOffset({ x: 0, y: 0 });
  };

  return (
    <>
      {/* Daily Ritual Modal */}
      <AnimatePresence>
        {showDailyRitual && ritualTiles.length > 0 && (
          <DailyRitualModal 
            tiles={ritualTiles}
            onComplete={() => {
              setShowDailyRitual(false);
              setRitualTiles([]);
            }}
          />
        )}
      </AnimatePresence>

      {/* Portal View */}
      <AnimatePresence>
        {portalViewIndex !== null && filteredTiles[portalViewIndex] && (
          <PortalView
            tile={filteredTiles[portalViewIndex]}
            tiles={filteredTiles}
            currentIndex={portalViewIndex}
            onClose={() => setPortalViewIndex(null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onNavigate={handlePortalNavigate}
          />
        )}
      </AnimatePresence>

      <CosmicBackground>
        {/* Mood-based ambient glow */}
        <motion.div
          className="fixed inset-0 pointer-events-none"
          animate={{
            background: `radial-gradient(ellipse at 50% 0%, ${moodColor.glow}, transparent 50%)`
          }}
          transition={{ duration: 1 }}
        />

        <div className="min-h-screen flex flex-col relative z-10">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between px-6 py-4 sticky top-0 z-50 bg-gradient-to-b from-[#0a0118] to-transparent"
          >
            <div className="w-10" />
            <h1 className="text-xl font-bold text-white">Portal Board</h1>
            <button 
              onClick={() => {
                setEditingTile(null);
                setShowDialog(true);
              }}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </motion.header>

          {/* Daily Ritual Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-6 mb-4"
          >
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-3">
                <Sun className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-white text-sm font-medium">Morning Portal Ritual</p>
                  <p className="text-white/50 text-xs">Pause during each photo and envision and truly feel what it would be like to already have this</p>
                </div>
              </div>
              <Switch
                checked={dailyRitualEnabled}
                onCheckedChange={setDailyRitualEnabled}
              />
            </div>
          </motion.div>

          {/* Mood Selector */}
          <div className="px-6 mb-6">
            <MoodSelector 
              selectedMood={selectedMood} 
              onMoodChange={setSelectedMood} 
            />
          </div>

          {/* Portal Grid */}
          <motion.div 
            className="flex-1 px-6 pb-2"
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
          >
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-[3/4] rounded-2xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : filteredTiles.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mb-6"
                >
                  <Sparkles className="w-12 h-12 text-purple-400" />
                </motion.div>
                <h3 className="text-xl font-medium text-white mb-3">
                  {selectedMood === 'all' ? 'Create Your First Portal' : `No ${moodColor.label} Visions Yet`}
                </h3>
                <p className="text-white/50 mb-8 max-w-xs">
                  Add images and intentions to open portals to your desired reality
                </p>
                <GlowButton onClick={() => setShowDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Manifestation
                </GlowButton>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredTiles.map((tile, index) => (
                    <PortalTile
                      key={tile.id}
                      tile={tile}
                      index={index}
                      onClick={() => handleTileClick(index)}
                      driftOffset={driftOffset}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Quantum Affirmation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="px-6 pb-8 text-center"
          >
            <p 
              className="text-sm md:text-base italic"
              style={{
                background: 'linear-gradient(135deg, #ffd700, #a855f7, #ffd700)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.7)) drop-shadow(0 0 20px rgba(255, 215, 0, 0.5))',
                fontFamily: "'Playfair Display', Georgia, serif",
                letterSpacing: '0.02em'
              }}
            >
              Know that there is a version of you in the quantum field that already has all of this and you are now colliding with it
            </p>
          </motion.div>
        </div>
      </CosmicBackground>

      {/* Add/Edit Dialog */}
      <AddManifestationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        editingTile={editingTile}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </>
  );
}