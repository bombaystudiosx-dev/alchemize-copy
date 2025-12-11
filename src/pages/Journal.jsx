import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function Journal() {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const queryClient = useQueryClient();

  const { data: entries = [] } = useQuery({
    queryKey: ['journal'],
    queryFn: () => base44.entities.JournalEntry.list('-date')
  });

  const createMutation = useMutation({
    mutationFn: (entry) => base44.entities.JournalEntry.create(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
      setEditingEntry(null);
      setSelectedEntry(null);
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
      setSelectedEntry(null);
      setEditingEntry(null);
    }
  });

  const handleSave = () => {
    if (!editingEntry.content.trim() && !editingEntry.title.trim()) {
      setEditingEntry(null);
      setSelectedEntry(null);
      return;
    }

    if (editingEntry.id) {
      updateMutation.mutate({ id: editingEntry.id, data: editingEntry });
    } else {
      createMutation.mutate(editingEntry);
    }
  };

  const handleNewNote = () => {
    setEditingEntry({
      title: '',
      content: '',
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setSelectedEntry(null);
  };

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry);
    setEditingEntry({ ...entry });
  };

  // List View
  if (!selectedEntry && !editingEntry) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-[#FFCC00] px-4 py-3 flex items-center justify-between">
          <Link to={createPageUrl('Home')}>
            <button className="p-1">
              <ArrowLeft className="w-6 h-6 text-black" />
            </button>
          </Link>
          <h1 className="text-xl font-semibold text-black">Notes</h1>
          <button onClick={handleNewNote} className="p-1">
            <Plus className="w-6 h-6 text-black" />
          </button>
        </div>

        {/* Notes List */}
        <div className="divide-y divide-gray-200">
          {entries.map((entry) => {
            const preview = entry.content.substring(0, 100);
            const firstLine = entry.title || entry.content.split('\n')[0] || 'New Note';
            const secondLine = entry.title ? entry.content.substring(0, 60) : entry.content.substring(firstLine.length, 100);

            return (
              <button
                key={entry.id}
                onClick={() => handleSelectEntry(entry)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-baseline gap-2 mb-1">
                      <h3 className="text-base font-semibold text-black truncate">
                        {firstLine}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {format(new Date(entry.date), 'M/d/yy')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {secondLine}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </button>
            );
          })}

          {entries.length === 0 && (
            <div className="px-4 py-20 text-center text-gray-400">
              <p className="text-lg mb-2">No Notes</p>
              <p className="text-sm">Tap + to create a note</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Edit View
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-[#FFCC00] px-4 py-3 flex items-center justify-between flex-shrink-0">
        <button onClick={handleSave} className="text-black font-medium">
          Done
        </button>
        <div className="flex gap-4">
          {editingEntry?.id && (
            <button
              onClick={() => deleteMutation.mutate(editingEntry.id)}
              className="p-1"
            >
              <Trash2 className="w-5 h-5 text-black" />
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <input
          type="text"
          placeholder="Title"
          value={editingEntry?.title || ''}
          onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
          className="w-full text-2xl font-semibold text-black placeholder:text-gray-300 focus:outline-none mb-2"
        />
        <p className="text-sm text-gray-500 mb-4">
          {format(new Date(editingEntry?.date || new Date()), 'MMMM d, yyyy')}
        </p>
        <textarea
          placeholder="Start typing..."
          value={editingEntry?.content || ''}
          onChange={(e) => setEditingEntry({ ...editingEntry, content: e.target.value })}
          className="w-full text-base text-black placeholder:text-gray-300 focus:outline-none resize-none"
          style={{ minHeight: 'calc(100vh - 200px)' }}
          autoFocus
        />
      </div>
    </div>
  );
}