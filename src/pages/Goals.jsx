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
import { ArrowLeft, Plus, Target, Check, Clock, Play, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

const statusConfig = {
  not_started: { label: 'Not Started', icon: Clock, color: 'text-gray-400', bg: 'bg-gray-500/20' },
  in_progress: { label: 'In Progress', icon: Play, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  completed: { label: 'Completed', icon: Check, color: 'text-green-400', bg: 'bg-green-500/20' }
};

export default function Goals() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', target_date: '', status: 'not_started', progress: 0 });
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Goal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
      closeDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Goal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
      closeDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Goal.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['goals'])
  });

  const closeDialog = () => {
    setShowDialog(false);
    setEditingGoal(null);
    setNewGoal({ title: '', description: '', target_date: '', status: 'not_started', progress: 0 });
  };

  const openEditDialog = (goal) => {
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      description: goal.description || '',
      target_date: goal.target_date || '',
      status: goal.status,
      progress: goal.progress || 0
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (editingGoal) {
      updateMutation.mutate({ id: editingGoal.id, data: newGoal });
    } else {
      createMutation.mutate(newGoal);
    }
  };

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
          <h1 className="text-xl font-bold text-white">Goal Setting</h1>
          <button 
            onClick={() => setShowDialog(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </motion.header>

        <div className="px-6">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3 mb-8"
          >
            <CosmicCard className="text-center py-4">
              <p className="text-2xl font-bold text-white">{goals.length}</p>
              <p className="text-xs text-white/50">Total Goals</p>
            </CosmicCard>
            <CosmicCard className="text-center py-4">
              <p className="text-2xl font-bold text-blue-400">
                {goals.filter(g => g.status === 'in_progress').length}
              </p>
              <p className="text-xs text-white/50">In Progress</p>
            </CosmicCard>
            <CosmicCard className="text-center py-4">
              <p className="text-2xl font-bold text-green-400">
                {goals.filter(g => g.status === 'completed').length}
              </p>
              <p className="text-xs text-white/50">Completed</p>
            </CosmicCard>
          </motion.div>

          {/* Goals List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : goals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Target className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Goals Yet</h3>
              <p className="text-white/50 mb-6">Define your aspirations</p>
              <GlowButton onClick={() => setShowDialog(true)}>
                Create Goal
              </GlowButton>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {goals.map((goal, index) => {
                  const status = statusConfig[goal.status];
                  const StatusIcon = status.icon;
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CosmicCard 
                        onClick={() => openEditDialog(goal)}
                        className="relative overflow-hidden group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">{goal.title}</h3>
                            {goal.description && (
                              <p className="text-sm text-white/60 line-clamp-2">{goal.description}</p>
                            )}
                          </div>
                          <div className={`px-3 py-1 rounded-full ${status.bg} flex items-center gap-1`}>
                            <StatusIcon className={`w-3 h-3 ${status.color}`} />
                            <span className={`text-xs ${status.color}`}>{status.label}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/50">Progress</span>
                            <span className="text-white">{goal.progress || 0}%</span>
                          </div>
                          <Progress value={goal.progress || 0} className="h-2 bg-white/10" />
                        </div>
                        
                        {goal.target_date && (
                          <p className="text-xs text-white/40 mt-3">
                            Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}
                          </p>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(goal.id);
                          }}
                          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4 text-white/40 hover:text-red-400" />
                        </button>
                      </CosmicCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={closeDialog}>
          <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-amber-500/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                {editingGoal ? 'Edit Goal' : 'Create Goal'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Goal Title</label>
                <CosmicInput
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="What do you want to achieve?"
                />
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Description</label>
                <Textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Add more details..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Target Date</label>
                <CosmicInput
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                />
              </div>
              
              {editingGoal && (
                <>
                  <div>
                    <label className="text-sm text-purple-200/70 mb-2 block">Status</label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => setNewGoal({ ...newGoal, status: key })}
                          className={`
                            p-2 rounded-xl text-xs transition-all
                            ${newGoal.status === key 
                              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white' 
                              : 'bg-white/10 text-white/60'
                            }
                          `}
                        >
                          {config.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-purple-200/70 mb-2 block">
                      Progress: {newGoal.progress}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={newGoal.progress}
                      onChange={(e) => setNewGoal({ ...newGoal, progress: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </>
              )}
              
              <GlowButton
                onClick={handleSubmit}
                disabled={!newGoal.title || createMutation.isPending || updateMutation.isPending}
                className="w-full"
              >
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </GlowButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CosmicBackground>
  );
}