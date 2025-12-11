import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, Book, Edit3, Trash2, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function Journal() {
  const [viewMode, setViewMode] = useState('write'); // 'write' or 'read'
  const [currentPage, setCurrentPage] = useState(0);
  const [editingEntry, setEditingEntry] = useState(null);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', date: format(new Date(), 'yyyy-MM-dd') });
  const queryClient = useQueryClient();

  const { data: entries = [] } = useQuery({
    queryKey: ['journal'],
    queryFn: () => base44.entities.JournalEntry.list('-date')
  });

  const createMutation = useMutation({
    mutationFn: (entry) => base44.entities.JournalEntry.create(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
      setNewEntry({ title: '', content: '', date: format(new Date(), 'yyyy-MM-dd') });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.JournalEntry.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
      setEditingEntry(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.JournalEntry.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
      if (currentPage >= entries.length - 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    }
  });

  const handleSaveNew = () => {
    if (newEntry.content.trim()) {
      createMutation.mutate(newEntry);
    }
  };

  const handleSaveEdit = () => {
    if (editingEntry && editingEntry.content.trim()) {
      updateMutation.mutate({ id: editingEntry.id, data: editingEntry });
    }
  };

  const currentEntry = entries[currentPage];

  return (
    <CosmicBackground dimmed>
      <div className="min-h-screen flex flex-col items-center px-4 py-8">
        {/* Header */}
        <div className="w-full max-w-4xl flex items-center justify-between mb-8">
          <Link to={createPageUrl('Home')}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </motion.button>
          </Link>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('write')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                viewMode === 'write' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/70'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span className="text-sm">Write</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('read')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                viewMode === 'read' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/70'
              }`}
            >
              <Book className="w-4 h-4" />
              <span className="text-sm">Read</span>
            </motion.button>
          </div>
        </div>

        {/* Journal Book */}
        <AnimatePresence mode="wait">
          {viewMode === 'write' ? (
            <motion.div
              key="write"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-2xl"
            >
              {/* Journal Book Cover Style */}
              <div 
                className="relative bg-cover bg-center rounded-lg shadow-2xl p-8 min-h-[600px]"
                style={{
                  backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/29e4aa2e3_2F17C4EA-01BF-4F82-B34B-28F6BC0D42C1.png)',
                  backgroundSize: 'cover'
                }}
              >
                <div className="absolute inset-8 bg-purple-900/60 backdrop-blur-sm rounded-lg p-6 overflow-y-auto">
                  <input
                    type="text"
                    placeholder="Entry Title..."
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    className="w-full px-4 py-2 mb-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px' }}
                  />
                  <input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    className="px-3 py-1 mb-4 bg-white/10 border border-white/20 rounded text-white/80 text-sm"
                  />
                  <textarea
                    placeholder="Write your thoughts..."
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                    className="w-full h-[400px] px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400 resize-none"
                    style={{ fontFamily: "'Courier New', monospace", fontSize: '15px', lineHeight: '1.8' }}
                  />
                  <div className="mt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveNew}
                      disabled={!newEntry.content.trim() || createMutation.isPending}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white disabled:opacity-50 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Save Entry
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="read"
              initial={{ opacity: 0, rotateY: -20 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 20 }}
              className="w-full max-w-4xl"
              style={{ perspective: '2000px' }}
            >
              {/* Open Book View */}
              <div className="relative flex gap-4" style={{ transformStyle: 'preserve-3d' }}>
                {/* Left Page */}
                <motion.div
                  className="flex-1 bg-purple-900/80 backdrop-blur-sm rounded-l-lg shadow-2xl p-8 min-h-[600px] border-r-2 border-amber-600/30"
                  style={{
                    backgroundImage: 'linear-gradient(to right, rgba(139, 92, 246, 0.3), rgba(109, 40, 217, 0.5))',
                  }}
                >
                  {entries.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-white/40 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
                        No entries yet.<br/>Start writing to see them here.
                      </p>
                    </div>
                  ) : currentEntry && !editingEntry ? (
                    <div className="h-full flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-amber-400 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {currentEntry.title || 'Untitled'}
                          </h3>
                          <p className="text-purple-200 text-sm">
                            {format(new Date(currentEntry.date), 'MMMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingEntry({ ...currentEntry })}
                            className="p-1 hover:bg-white/10 rounded"
                          >
                            <Edit3 className="w-4 h-4 text-purple-300" />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(currentEntry.id)}
                            className="p-1 hover:bg-white/10 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        <p className="text-white/90 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "'Courier New', monospace", fontSize: '14px' }}>
                          {currentEntry.content}
                        </p>
                      </div>
                    </div>
                  ) : editingEntry ? (
                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <input
                          type="text"
                          value={editingEntry.title}
                          onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                          className="flex-1 px-3 py-1 bg-white/10 border border-white/20 rounded text-amber-400 text-xl"
                          style={{ fontFamily: "'Playfair Display', serif" }}
                        />
                        <div className="flex gap-2 ml-2">
                          <button onClick={handleSaveEdit} className="p-1 hover:bg-white/10 rounded">
                            <Check className="w-5 h-5 text-green-400" />
                          </button>
                          <button onClick={() => setEditingEntry(null)} className="p-1 hover:bg-white/10 rounded">
                            <X className="w-5 h-5 text-red-400" />
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={editingEntry.content}
                        onChange={(e) => setEditingEntry({ ...editingEntry, content: e.target.value })}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded text-white resize-none"
                        style={{ fontFamily: "'Courier New', monospace", fontSize: '14px' }}
                      />
                    </div>
                  ) : null}
                </motion.div>

                {/* Right Page - Navigation */}
                <motion.div
                  className="flex-1 bg-purple-900/80 backdrop-blur-sm rounded-r-lg shadow-2xl p-8 min-h-[600px]"
                  style={{
                    backgroundImage: 'linear-gradient(to left, rgba(139, 92, 246, 0.3), rgba(109, 40, 217, 0.5))',
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    {entries.length > 0 ? (
                      <>
                        <p className="text-white/60 mb-8 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
                          Page {currentPage + 1} of {entries.length}
                        </p>
                        <div className="flex gap-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0}
                            className="p-4 bg-white/10 hover:bg-white/20 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="w-6 h-6 text-white" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setCurrentPage(Math.min(entries.length - 1, currentPage + 1))}
                            disabled={currentPage >= entries.length - 1}
                            className="p-4 bg-white/10 hover:bg-white/20 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronRight className="w-6 h-6 text-white" />
                          </motion.button>
                        </div>
                      </>
                    ) : (
                      <p className="text-white/40 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Switch to Write mode<br/>to create your first entry
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CosmicBackground>
  );
}