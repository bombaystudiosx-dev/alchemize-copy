import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import CosmicBackground from '@/components/cosmic/CosmicBackground';

export default function GratitudeJournal() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [formData, setFormData] = useState({
    gratitude_1: '',
    gratitude_2: '',
    gratitude_3: ''
  });
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
      setFormData({ gratitude_1: '', gratitude_2: '', gratitude_3: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GratitudeEntry.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gratitude'] });
    }
  });

  const handleSave = () => {
    if (!formData.gratitude_1.trim() && !formData.gratitude_2.trim() && !formData.gratitude_3.trim()) {
      setShowEntryForm(false);
      return;
    }

    createMutation.mutate({
      ...formData,
      date: format(selectedDate, 'yyyy-MM-dd')
    });
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = monthStart.getDay();
  const daysArray = [...Array(startDayOfWeek).fill(null), ...daysInMonth];

  const hasEntryForDate = (date) => {
    return entries.some(entry => isSameDay(new Date(entry.date), date));
  };

  const selectedDateEntries = entries.filter(entry => 
    isSameDay(new Date(entry.date), selectedDate)
  );

  return (
    <CosmicBackground>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
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
          <div className="w-10" />
        </div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-6 mt-6 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10"
        >
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-purple-300" />
            </button>
            <h2 className="text-xl font-semibold text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-purple-300" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-sm font-medium text-purple-300">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {daysArray.map((day, index) => {
              if (!day) {
                return <div key={index} />;
              }

              const isSelected = isSameDay(day, selectedDate);
              const hasEntry = hasEntryForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <motion.button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    relative aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all
                    ${isSelected 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' 
                      : isCurrentMonth
                      ? 'bg-white/5 text-white hover:bg-white/10'
                      : 'bg-transparent text-gray-500'
                    }
                  `}
                >
                  {format(day, 'd')}
                  {hasEntry && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1"
                    >
                      <Heart 
                        className="w-3 h-3 fill-amber-400 text-amber-400" 
                        style={{
                          filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.8))'
                        }}
                      />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Add Gratitude Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-6 mt-6"
        >
          <button
            onClick={() => setShowEntryForm(true)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Gratitude
          </button>
        </motion.div>

        {/* Entries Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-6 mt-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Entries for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>

          {selectedDateEntries.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-gray-400">No gratitude entries yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDateEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-xl rounded-2xl p-5 border border-white/10"
                >
                  <div className="space-y-3">
                    {entry.gratitude_1 && (
                      <div className="flex gap-3">
                        <span className="text-purple-400 font-semibold">1.</span>
                        <p className="text-white flex-1">{entry.gratitude_1}</p>
                      </div>
                    )}
                    {entry.gratitude_2 && (
                      <div className="flex gap-3">
                        <span className="text-purple-400 font-semibold">2.</span>
                        <p className="text-white flex-1">{entry.gratitude_2}</p>
                      </div>
                    )}
                    {entry.gratitude_3 && (
                      <div className="flex gap-3">
                        <span className="text-purple-400 font-semibold">3.</span>
                        <p className="text-white flex-1">{entry.gratitude_3}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(entry.id)}
                    className="mt-4 text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete Entry
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
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
              <h2 className="text-2xl font-bold text-center mb-8 text-purple-300">
                Gratitude Entry
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="text-purple-300 font-semibold mb-2 block">1.</label>
                  <textarea
                    placeholder="I am grateful for..."
                    value={formData.gratitude_1}
                    onChange={(e) => setFormData({ ...formData, gratitude_1: e.target.value })}
                    className="w-full bg-black/30 border-2 border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-purple-300 font-semibold mb-2 block">2.</label>
                  <textarea
                    placeholder="I am grateful for..."
                    value={formData.gratitude_2}
                    onChange={(e) => setFormData({ ...formData, gratitude_2: e.target.value })}
                    className="w-full bg-black/30 border-2 border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-purple-300 font-semibold mb-2 block">3.</label>
                  <textarea
                    placeholder="I am grateful for..."
                    value={formData.gratitude_3}
                    onChange={(e) => setFormData({ ...formData, gratitude_3: e.target.value })}
                    className="w-full bg-black/30 border-2 border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowEntryForm(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold transition-all shadow-lg shadow-purple-500/30"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </CosmicBackground>
  );
}