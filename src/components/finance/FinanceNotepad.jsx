import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { StickyNote, Save, Check } from 'lucide-react';
import CosmicCard from '@/components/cosmic/CosmicCard';

export default function FinanceNotepad({ notes }) {
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();
  const timerRef = useRef(null);

  useEffect(() => {
    if (notes.length > 0) {
      setContent(notes[0].content || '');
    }
  }, [notes]);

  const saveMutation = useMutation({
    mutationFn: (text) => {
      if (notes.length > 0) {
        return base44.entities.FinanceNote.update(notes[0].id, { content: text, date: new Date().toISOString().split('T')[0] });
      }
      return base44.entities.FinanceNote.create({ content: text, date: new Date().toISOString().split('T')[0] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeNotes'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  });

  const handleChange = (e) => {
    setContent(e.target.value);
    setSaved(false);
    // Auto-save after 2 seconds of no typing
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveMutation.mutate(e.target.value);
    }, 2000);
  };

  const handleManualSave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    saveMutation.mutate(content);
  };

  return (
    <CosmicCard>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-amber-400" />
          <span className="text-white font-semibold text-sm">Notepad</span>
        </div>
        <button
          onClick={handleManualSave}
          disabled={saveMutation.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 transition-colors text-xs"
        >
          {saved ? (
            <>
              <Check className="w-3 h-3 text-green-400" />
              <span className="text-green-400">Saved</span>
            </>
          ) : (
            <>
              <Save className="w-3 h-3 text-white/40" />
              <span className="text-white/40">Save</span>
            </>
          )}
        </button>
      </div>
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Jot down financial thoughts, reminders, goals..."
        className="w-full min-h-[140px] bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-white/80 text-sm placeholder:text-white/20 resize-y focus:outline-none focus:border-purple-500/30 transition-colors"
      />
      <p className="text-white/15 text-[10px] mt-1.5">Auto-saves after you stop typing</p>
    </CosmicCard>
  );
}