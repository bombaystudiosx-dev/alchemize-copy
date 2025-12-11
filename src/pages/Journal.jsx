import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function Journal() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', date: format(new Date(), 'yyyy-MM-dd') });
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['journal'],
    queryFn: () => base44.entities.JournalEntry.list('-date')
  });

  const createMutation = useMutation({
    mutationFn: (entry) => base44.entities.JournalEntry.create(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
      setNewEntry({ title: '', content: '', date: format(new Date(), 'yyyy-MM-dd') });
      setShowNewEntry(false);
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

  const handlePageFlip = (direction) => {
    setIsFlipping(true);
    setTimeout(() => {
      if (direction === 'next' && currentPage < entries.length - 1) {
        setCurrentPage(currentPage + 1);
      } else if (direction === 'prev' && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
      setIsFlipping(false);
    }, 300);
  };

  const handleSave = () => {
    if (newEntry.content.trim()) {
      createMutation.mutate(newEntry);
    }
  };

  const currentEntry = entries[currentPage];

  return (
    <CosmicBackground dimmed>
      <div className="min-h-screen flex flex-col items-center px-4 py-6">
        {/* Header */}
        <div className="w-full max-w-6xl flex items-center justify-between mb-6">
          <Link to={createPageUrl('Home')}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </motion.button>
          </Link>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewEntry(true)}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-purple-600 rounded-full text-white font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </motion.button>
        </div>

        {/* Book */}
        <div className="relative w-full max-w-6xl" style={{ perspective: '2000px' }}>
          <motion.div
            initial={{ rotateX: 10, y: 50 }}
            animate={{ rotateX: 0, y: 0 }}
            className="relative"
          >
            {/* Book shadow */}
            <div className="absolute inset-0 bg-black/40 blur-3xl transform translate-y-8" />
            
            {/* Open book */}
            <div className="relative bg-gradient-to-b from-purple-900/40 to-purple-950/60 rounded-lg shadow-2xl overflow-hidden backdrop-blur-sm border border-purple-500/20">
              <div className="flex">
                {/* Left Page */}
                <div className="flex-1 relative bg-gradient-to-br from-amber-50 to-amber-100 min-h-[600px] border-r-4 border-amber-800/30" 
                     style={{
                       backgroundImage: `repeating-linear-gradient(transparent, transparent 31px, #d4a574 31px, #d4a574 32px)`,
                       backgroundSize: '100% 32px',
                       backgroundPosition: '0 40px'
                     }}>
                  {/* Book spine effect */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-amber-900/20 to-transparent" />
                  
                  <div className="p-12 pt-16">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
                      </div>
                    ) : entries.length === 0 ? (
                      <div className="text-center text-amber-800/40 py-20">
                        <p className="text-xl mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                          Your journal awaits...
                        </p>
                        <p className="text-sm">Click "New Entry" to begin</p>
                      </div>
                    ) : currentEntry ? (
                      <motion.div
                        key={currentEntry.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full"
                      >
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h2 className="text-3xl font-bold text-amber-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                              {currentEntry.title || 'Untitled'}
                            </h2>
                            <p className="text-sm text-amber-700">
                              {format(new Date(currentEntry.date), 'EEEE, MMMM d, yyyy')}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteMutation.mutate(currentEntry.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                        <div className="prose prose-amber max-w-none">
                          <p className="text-amber-900 whitespace-pre-wrap leading-8" style={{ fontFamily: "'Courier New', monospace" }}>
                            {currentEntry.content}
                          </p>
                        </div>
                      </motion.div>
                    ) : null}
                  </div>
                </div>

                {/* Right Page - Index/Navigation */}
                <div className="flex-1 relative bg-gradient-to-bl from-amber-50 to-amber-100 min-h-[600px]"
                     style={{
                       backgroundImage: `repeating-linear-gradient(transparent, transparent 31px, #d4a574 31px, #d4a574 32px)`,
                       backgroundSize: '100% 32px',
                       backgroundPosition: '0 40px'
                     }}>
                  {/* Book edge effect */}
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-amber-900/20 to-transparent" />
                  
                  <div className="p-12 pt-16 flex flex-col">
                    <h3 className="text-2xl font-bold text-amber-900 mb-8 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Index
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 mb-8">
                      {entries.map((entry, idx) => (
                        <motion.button
                          key={entry.id}
                          whileHover={{ scale: 1.02, x: 5 }}
                          onClick={() => setCurrentPage(idx)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            idx === currentPage 
                              ? 'bg-amber-200 border-l-4 border-amber-700' 
                              : 'hover:bg-amber-100 border-l-4 border-transparent'
                          }`}
                        >
                          <p className="font-semibold text-amber-900 text-sm truncate" style={{ fontFamily: "'Courier New', monospace" }}>
                            {entry.title || 'Untitled'}
                          </p>
                          <p className="text-xs text-amber-700">
                            {format(new Date(entry.date), 'MMM d, yyyy')}
                          </p>
                        </motion.button>
                      ))}
                    </div>

                    {entries.length > 0 && (
                      <div className="flex items-center justify-center gap-4 pt-4 border-t-2 border-amber-300">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handlePageFlip('prev')}
                          disabled={currentPage === 0 || isFlipping}
                          className="p-3 bg-amber-600 hover:bg-amber-700 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-6 h-6 text-white" />
                        </motion.button>
                        <span className="text-amber-800 font-medium">
                          {currentPage + 1} / {entries.length}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handlePageFlip('next')}
                          disabled={currentPage >= entries.length - 1 || isFlipping}
                          className="p-3 bg-amber-600 hover:bg-amber-700 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-6 h-6 text-white" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* New Entry Modal */}
      <AnimatePresence>
        {showNewEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewEntry(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-2xl p-8"
              style={{
                backgroundImage: `repeating-linear-gradient(transparent, transparent 31px, #d4a574 31px, #d4a574 32px)`,
                backgroundSize: '100% 32px',
                backgroundPosition: '0 40px'
              }}
            >
              <h2 className="text-3xl font-bold text-amber-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                New Journal Entry
              </h2>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Entry Title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/60 border-2 border-amber-300 rounded-lg text-amber-900 placeholder:text-amber-600/40 focus:outline-none focus:border-amber-600"
                  style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px' }}
                />
                
                <input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  className="px-4 py-2 bg-white/60 border-2 border-amber-300 rounded-lg text-amber-800"
                />
                
                <textarea
                  placeholder="Write your thoughts..."
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  className="w-full h-64 px-4 py-3 bg-white/40 border-2 border-amber-300 rounded-lg text-amber-900 placeholder:text-amber-600/40 focus:outline-none focus:border-amber-600 resize-none"
                  style={{ fontFamily: "'Courier New', monospace", fontSize: '15px', lineHeight: '2' }}
                />
                
                <div className="flex gap-3 justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNewEntry(false)}
                    className="px-6 py-2 bg-amber-200 hover:bg-amber-300 rounded-lg text-amber-900 font-medium"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={!newEntry.content.trim() || createMutation.isPending}
                    className="px-6 py-2 bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-700 hover:to-purple-700 rounded-lg text-white font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Save Entry
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </CosmicBackground>
  );
}