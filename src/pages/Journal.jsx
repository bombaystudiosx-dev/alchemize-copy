import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';


export default function GratitudeJournal() {
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [newEntry, setNewEntry] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const queryClient = useQueryClient();

  const { data: entries = [] } = useQuery({
    queryKey: ['gratitude'],
    queryFn: () => base44.entities.GratitudeEntry.list('-date')
  });

  const createMutation = useMutation({
    mutationFn: (entry) => base44.entities.GratitudeEntry.create(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gratitude'] });
      setShowEntryForm(false);
      setNewEntry('');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GratitudeEntry.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gratitude'] });
    }
  });

  const handleSave = () => {
    if (!newEntry.trim()) return;

    const dateToUse = selectedDate ? selectedDate.date : format(new Date(), 'yyyy-MM-dd');
    createMutation.mutate({
      gratitude_1: newEntry,
      date: dateToUse
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#1a0a2e] to-[#0d0620]">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-b from-[#0a0118] to-transparent backdrop-blur-sm px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <Link to={createPageUrl('Home')}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </motion.button>
          </Link>
          <h1 className="text-2xl font-bold text-white">Gratitude Journal</h1>
          <button
            onClick={() => setShowEntryForm(true)}
            className="p-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/30"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Inspirational Message */}
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
          <p className="text-sm text-white text-center leading-relaxed italic">
            Even on hard days, there's always something to be grateful for — health, home, or the small moments. Focus on the good, and the universe will give you more reasons to be grateful.
          </p>
        </div>
      </div>

      {/* Calendar View */}
      <div className="px-6 mb-6">
        <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center text-xs text-white/50 font-medium">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {(() => {
              const today = new Date();
              const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
              const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
              const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
              const daysInMonth = lastDay.getDate();
              const days = [];
              
              for (let i = 0; i < startDay; i++) {
                days.push(<div key={`empty-${i}`} />);
              }
              
              for (let day = 1; day <= daysInMonth; day++) {
                const date = format(new Date(today.getFullYear(), today.getMonth(), day), 'yyyy-MM-dd');
                const hasEntry = entries.some(e => e.date === date);
                const isToday = format(today, 'yyyy-MM-dd') === date;
                
                days.push(
                  <button
                    key={day}
                    onClick={() => {
                      const dayEntries = entries.filter(e => e.date === date);
                      setSelectedDate({ date, entries: dayEntries });
                    }}
                    className={`
                      aspect-square rounded-lg flex items-center justify-center text-sm transition-all
                      ${hasEntry 
                        ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/30' 
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }
                      ${isToday ? 'ring-2 ring-amber-400' : ''}
                    `}
                  >
                    {day}
                  </button>
                );
              }
              
              return days;
            })()}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="px-6 pb-20">
        {entries.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
            <p className="text-white/60 mb-6">Start your gratitude journey</p>
            <button
              onClick={() => setShowEntryForm(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/30"
            >
              Add Your First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="group bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-xl rounded-2xl p-4 border border-white/10 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-xs text-purple-300/60">{format(new Date(entry.date), 'MMM d, yyyy')}</p>
                  <button
                    onClick={() => deleteMutation.mutate(entry.id)}
                    className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-300 transition-all px-2 py-1 rounded-lg hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
                <div className="space-y-2">
                  {entry.gratitude_1 && (
                    <p className="text-white leading-relaxed">{entry.gratitude_1}</p>
                  )}
                  {entry.gratitude_2 && (
                    <p className="text-white/90 leading-relaxed text-sm">{entry.gratitude_2}</p>
                  )}
                  {entry.gratitude_3 && (
                    <p className="text-white/80 leading-relaxed text-sm">{entry.gratitude_3}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Entry Form Modal */}
      <AnimatePresence>
        {showEntryForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEntryForm(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-8 z-50 max-w-md mx-auto border-2 border-purple-500/30"
            >
              <h2 className="text-2xl font-bold text-center mb-2 text-purple-300">
                Add Gratitude
              </h2>
              <p className="text-center text-purple-200/60 text-sm mb-6">
                What are you grateful for today?
              </p>

              <textarea
                placeholder="I am grateful for..."
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                className="w-full bg-black/30 border-2 border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                rows={5}
                autoFocus
              />

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowEntryForm(false);
                    setNewEntry('');
                  }}
                  className="flex-1 py-3 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!newEntry.trim() || createMutation.isPending}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Day Details Dialog */}
      <AnimatePresence>
        {selectedDate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDate(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-6 z-50 max-w-md mx-auto border-2 border-purple-500/30 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-purple-300">
                  {format(new Date(selectedDate.date), 'MMMM d, yyyy')}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <span className="text-white text-xl">×</span>
                </button>
              </div>
              
              {selectedDate.entries.length > 0 ? (
                <div className="space-y-3">
                  {selectedDate.entries.map((entry) => (
                    <div key={entry.id} className="bg-black/30 rounded-xl p-4 border border-white/10">
                      {entry.gratitude_1 && (
                        <p className="text-white leading-relaxed mb-2">{entry.gratitude_1}</p>
                      )}
                      {entry.gratitude_2 && (
                        <p className="text-white/90 leading-relaxed text-sm mb-2">{entry.gratitude_2}</p>
                      )}
                      {entry.gratitude_3 && (
                        <p className="text-white/80 leading-relaxed text-sm">{entry.gratitude_3}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
                  <p className="text-white/50 text-sm">No entries for this day</p>
                  <button
                    onClick={() => {
                      setSelectedDate(null);
                      setShowEntryForm(true);
                    }}
                    className="mt-4 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm transition-colors"
                  >
                    Add Entry
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}