import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Heart, Pencil } from 'lucide-react';
import { addMonths, format, subMonths } from 'date-fns';
import MonthNavigator from '@/components/common/MonthNavigator';
import PullToRefresh from '@/components/common/PullToRefresh';
import useBackNav from '@/components/common/useBackNav';
import { toast } from '@/components/common/AppToast';
import { logEvent } from '@/components/common/appLogger';


// Journal is a FREE feature (gratitude) - no PremiumGate needed

export default function GratitudeJournal() {
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [newEntry, setNewEntry] = useState({ gratitude_1: '', gratitude_2: '', gratitude_3: '', reflection: '' });
  const [formDate, setFormDate] = useState(null);
  const [dayDialog, setDayDialog] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const queryClient = useQueryClient();
  const goBack = useBackNav('Home', 'Journal');

  const { data: entries = [] } = useQuery({
    queryKey: ['gratitude'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.GratitudeEntry.filter({ created_by: user.email }, '-date');
    }
  });

  const createMutation = useMutation({
    mutationFn: (entry) => base44.entities.GratitudeEntry.create(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gratitude'] });
      setShowEntryForm(false);
      setNewEntry({ gratitude_1: '', gratitude_2: '', gratitude_3: '', reflection: '' });
      setFormDate(null);
      toast('Entry saved ✓', 'success');
      logEvent('save', 'Journal', 'save_result', 'success');
    },
    onError: (e) => {
      toast(e?.message || 'Save failed', 'error');
      logEvent('save', 'Journal', 'save_result', 'fail', { error: e?.message });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GratitudeEntry.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gratitude'] });
      setShowEntryForm(false);
      setEditingEntry(null);
      setNewEntry({ gratitude_1: '', gratitude_2: '', gratitude_3: '', reflection: '' });
      setFormDate(null);
      toast('Entry updated ✓', 'success');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GratitudeEntry.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gratitude'] });
    }
  });

  const handleSave = () => {
    if (!newEntry.gratitude_1?.trim()) return;
    const dateToUse = formDate || format(new Date(), 'yyyy-MM-dd');
    logEvent('save', 'Journal', 'save_attempt', 'pending');
    const payload = {
      gratitude_1: newEntry.gratitude_1,
      gratitude_2: newEntry.gratitude_2 || null,
      gratitude_3: newEntry.gratitude_3 || null,
      reflection: newEntry.reflection || null,
      date: dateToUse
    };

    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data: payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const openForm = (date = null, entry = null) => {
    setFormDate(date || entry?.date || null);
    setEditingEntry(entry || null);
    setNewEntry(entry ? {
      gratitude_1: entry.gratitude_1 || '',
      gratitude_2: entry.gratitude_2 || '',
      gratitude_3: entry.gratitude_3 || '',
      reflection: entry.reflection || ''
    } : { gratitude_1: '', gratitude_2: '', gratitude_3: '', reflection: '' });
    setDayDialog(null);
    setShowEntryForm(true);
  };

  return (
    <PullToRefresh onRefresh={() => queryClient.invalidateQueries(['gratitude'])} className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#1a0a2e] to-[#0d0620]">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-b from-[#0a0118] to-transparent backdrop-blur-sm px-6 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goBack}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <h1 className="text-xl font-bold text-white">Gratitude Journal</h1>
          <button
            onClick={() => openForm()}
            className="p-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/30"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Inspirational Message */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <p className="text-xs text-white text-center leading-relaxed italic">
            Even on hard days, there's always something to be grateful for. Focus on the good.
          </p>
        </div>
      </div>

      {/* Calendar View */}
      <div className="px-4 mb-3">
        <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-xl rounded-xl p-3 border border-white/10">
          <MonthNavigator
            currentMonth={calendarMonth}
            onPrev={() => setCalendarMonth(subMonths(calendarMonth, 1))}
            onNext={() => setCalendarMonth(addMonths(calendarMonth, 1))}
            className="mb-3"
          />
          <div className="grid grid-cols-7 gap-1.5 mb-1.5">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center text-xs text-white/50 font-medium">
                {day.slice(0, 1)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {(() => {
              const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
              const lastDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
              const monthBase = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
              const today = new Date();
              const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
              const daysInMonth = lastDay.getDate();
              const days = [];
              
              for (let i = 0; i < startDay; i++) {
                days.push(<div key={`empty-${i}`} />);
              }
              
              for (let day = 1; day <= daysInMonth; day++) {
                const date = format(new Date(monthBase.getFullYear(), monthBase.getMonth(), day), 'yyyy-MM-dd');
                const hasEntry = entries.some(e => e.date === date);
                const isToday = format(today, 'yyyy-MM-dd') === date;
                
                days.push(
                  <button
                    key={day}
                    onClick={() => {
                      const dayEntries = entries.filter(e => e.date === date);
                      setDayDialog({ date, entries: dayEntries });
                    }}
                    className={`
                      aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all relative
                      ${hasEntry 
                        ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/30' 
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }
                      ${isToday ? 'ring-1 ring-amber-400' : ''}
                    `}
                  >
                    <span className="text-xs">{day}</span>
                    {hasEntry && (
                      <span className="text-[10px]">❤️</span>
                    )}
                  </button>
                );
              }
              
              return days;
            })()}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="px-6" style={{ paddingBottom: 'calc(120px + env(safe-area-inset-bottom))' }}>
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-50" />
            <p className="text-white/60 text-sm mb-4">Start your gratitude journey</p>
            <button
              onClick={() => openForm()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-purple-500/30"
            >
              Add Your First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.3) }}
                className="group bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-xl rounded-xl p-3 border border-white/10 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-xs text-purple-300/60">{format(new Date(entry.date), 'MMM d, yyyy')}</p>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => openForm(entry.date, entry)}
                      className="text-xs text-cyan-300 hover:text-cyan-200 px-1.5 py-0.5 rounded hover:bg-cyan-500/10"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(entry.id)}
                      className="text-xs text-red-400 hover:text-red-300 px-1.5 py-0.5 rounded hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {entry.gratitude_1 && (
                    <p className="text-white text-sm leading-relaxed">{entry.gratitude_1}</p>
                  )}
                  {entry.gratitude_2 && (
                    <p className="text-white/90 text-sm leading-relaxed">{entry.gratitude_2}</p>
                  )}
                  {entry.gratitude_3 && (
                    <p className="text-white/80 text-sm leading-relaxed">{entry.gratitude_3}</p>
                  )}
                  {entry.reflection && (
                    <div className="mt-3 rounded-xl bg-white/5 border border-white/10 p-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-2">Optional: What could I have done better today?</p>
                      <p className="text-white/70 text-sm leading-relaxed">{entry.reflection}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Entry Form — bottom sheet */}
      <AnimatePresence>
        {showEntryForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowEntryForm(false);
                setEditingEntry(null);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-t-3xl border-t-2 border-purple-500/30 flex flex-col"
              style={{ maxHeight: '90dvh' }}
            >
              {/* Drag handle */}
              <div className="flex-shrink-0 flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/30" />
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-4 pb-5 pt-2">
                <h2 className="text-xl font-bold text-center mb-1 text-purple-300">
                  {editingEntry ? 'Edit Gratitude' : 'Add Gratitude'}
                </h2>
                <p className="text-center text-purple-200/60 text-sm mb-5">
                  {formDate ? `For ${format(new Date(formDate), 'MMMM d, yyyy')}` : 'What are you grateful for today?'}
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-purple-300/70 mb-1 block">Entry 1</label>
                    <textarea
                      placeholder="I am grateful for..."
                      value={newEntry.gratitude_1}
                      onChange={(e) => setNewEntry({ ...newEntry, gratitude_1: e.target.value })}
                      className="w-full bg-black/30 border-2 border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-purple-300/70 mb-1 block">Entry 2 (optional)</label>
                    <textarea
                      placeholder="I am grateful for..."
                      value={newEntry.gratitude_2}
                      onChange={(e) => setNewEntry({ ...newEntry, gratitude_2: e.target.value })}
                      className="w-full bg-black/30 border-2 border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-purple-300/70 mb-1 block">Entry 3 (optional)</label>
                    <textarea
                      placeholder="I am grateful for..."
                      value={newEntry.gratitude_3}
                      onChange={(e) => setNewEntry({ ...newEntry, gratitude_3: e.target.value })}
                      className="w-full bg-black/30 border-2 border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-purple-300/70 mb-1 block">Optional: What could I have done better today?</label>
                    <textarea
                      placeholder="Optional reflection..."
                      value={newEntry.reflection}
                      onChange={(e) => setNewEntry({ ...newEntry, reflection: e.target.value })}
                      className="w-full bg-black/30 border-2 border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-6 pb-safe">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEntryForm(false);
                      setEditingEntry(null);
                      setNewEntry({ gratitude_1: '', gratitude_2: '', gratitude_3: '', reflection: '' });
                      setFormDate(null);
                    }}
                    className="flex-1 py-4 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!newEntry.gratitude_1?.trim() || createMutation.isPending || updateMutation.isPending}
                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/30 disabled:opacity-50"
                  >
                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingEntry ? 'Update' : 'Save'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Day Details Dialog */}
      <AnimatePresence>
        {dayDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDayDialog(null)}
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
                  {format(new Date(dayDialog.date), 'MMMM d, yyyy')}
                </h3>
                <button
                  onClick={() => setDayDialog(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <span className="text-white text-xl">×</span>
                </button>
              </div>
              
              {dayDialog.entries.length > 0 ? (
                <div className="space-y-3">
                  {dayDialog.entries.map((entry) => (
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
                      {entry.reflection && (
                        <div className="mt-3 rounded-xl bg-white/5 border border-white/10 p-3">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-2">Optional: What could I have done better today?</p>
                          <p className="text-white/70 text-sm leading-relaxed">{entry.reflection}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
                  <p className="text-white/50 text-sm">No entries for this day</p>
                  <button
                    onClick={() => openForm(dayDialog.date)}
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
    </PullToRefresh>
  );
}