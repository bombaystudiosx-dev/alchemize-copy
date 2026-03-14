import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Pencil } from 'lucide-react';

const EMPTY_FORM = {
  text: '',
  notes: '',
  urgent: false,
};

export default function TaskEditDialog({ open, onOpenChange, task, onSave, isSaving }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (task) {
      setForm({
        text: task.text || '',
        notes: task.notes || '',
        urgent: !!task.urgent,
      });
    }
  }, [task]);

  const handleSave = () => {
    if (!form.text.trim()) return;
    onSave({
      text: form.text.trim(),
      notes: form.notes.trim(),
      urgent: form.urgent,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-[#24120a] to-[#120a06] border-amber-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-100">
            <Pencil className="w-5 h-5 text-amber-300" />
            Edit Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-amber-200/60 block mb-2">Task</label>
            <input
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="What needs your attention?"
              className="w-full rounded-2xl bg-amber-50/10 border border-amber-200/20 px-4 py-3 text-amber-50 placeholder:text-amber-100/30 outline-none focus:border-amber-400/50"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-amber-200/60 block mb-2">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional notes"
              rows={3}
              className="w-full rounded-2xl bg-amber-50/10 border border-amber-200/20 px-4 py-3 text-amber-50 placeholder:text-amber-100/30 outline-none focus:border-amber-400/50 resize-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setForm({ ...form, urgent: !form.urgent })}
            className={`w-full rounded-2xl border px-4 py-3 flex items-center justify-between transition-all ${
              form.urgent
                ? 'bg-red-500/15 border-red-400/40 text-red-200'
                : 'bg-amber-50/5 border-amber-200/15 text-amber-100/80'
            }`}
          >
            <span className="flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4" />
              Mark as urgent
            </span>
            <span className={`text-xs uppercase tracking-[0.2em] ${form.urgent ? 'text-red-200' : 'text-amber-100/40'}`}>
              {form.urgent ? 'On' : 'Off'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!form.text.trim() || isSaving}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}