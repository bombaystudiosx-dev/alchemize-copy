import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Bell, PlusCircle, Pencil } from 'lucide-react';
import BottomSheet from '@/components/native/BottomSheet';

const icons = ['⭐', '💪', '📚', '🎯', '🧘‍♀️', '🏃', '💧', '🍎', '🎨', '🎵', '✍️', '🧠'];
const colors = ['#9B5DE5', '#00B4D8', '#0077B6', '#FF6B6B', '#FFB347', '#FF8C00', '#5BC0BE', '#00BFFF', '#10b981', '#f59e0b', '#ec4899'];

const buildInitialForm = (initialData) => ({
  name: initialData?.name || '',
  icon: initialData?.icon || '⭐',
  type: initialData?.progress?.type || initialData?.type || 'check',
  goal: String(initialData?.goal || 1),
  unit: initialData?.unit || 'session',
  color: initialData?.color || '#9B5DE5',
  reminder_enabled: !!initialData?.reminder_enabled,
  reminder_time: initialData?.reminder_time || '08:00',
});

export default function HabitFormDialog({ open, onOpenChange, initialData, onSave, title = 'Add Habit' }) {
  const [form, setForm] = useState(buildInitialForm(initialData));
  const [showIconSheet, setShowIconSheet] = useState(false);
  const [showColorSheet, setShowColorSheet] = useState(false);
  const [showTypeSheet, setShowTypeSheet] = useState(false);

  useEffect(() => {
    setForm(buildInitialForm(initialData));
  }, [initialData, open]);

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({
      name: form.name.trim(),
      icon: form.icon,
      type: form.type,
      goal: parseInt(form.goal, 10) || 1,
      unit: form.type === 'timer' ? 'minutes' : form.unit,
      color: form.color,
      reminder_enabled: form.reminder_enabled,
      reminder_time: form.reminder_enabled ? form.reminder_time : '',
    });
  };

  return (
    <>
      <BottomSheet
        open={showIconSheet}
        onOpenChange={setShowIconSheet}
        title="Habit Icon"
        value={form.icon}
        onSelect={(value) => setForm({ ...form, icon: value })}
        options={icons.map((icon) => ({ value: icon, label: icon, icon }))}
      />
      <BottomSheet
        open={showColorSheet}
        onOpenChange={setShowColorSheet}
        title="Habit Color"
        value={form.color}
        onSelect={(value) => setForm({ ...form, color: value })}
        options={colors.map((color, index) => ({ value: color, label: `Color ${index + 1}`, icon: '●' }))}
      />
      <BottomSheet
        open={showTypeSheet}
        onOpenChange={setShowTypeSheet}
        title="Habit Type"
        value={form.type}
        onSelect={(value) => setForm({ ...form, type: value, unit: value === 'timer' ? 'minutes' : 'session', goal: value === 'timer' && form.goal === '1' ? '15' : form.goal })}
        options={[{ value: 'check', label: 'Check', icon: '✓' }, { value: 'timer', label: 'Timer', icon: '⏱' }]}
      />
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-orange-500/30 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            {initialData ? <Pencil className="w-5 h-5 text-orange-400" /> : <PlusCircle className="w-5 h-5 text-orange-400" />}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm text-purple-200/70 mb-2 block">Habit Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Morning walk"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none focus:border-purple-500/50"
            />
          </div>

          <div>
            <label className="text-sm text-purple-200/70 mb-2 block">Icon</label>
            <button
              type="button"
              onClick={() => setShowIconSheet(true)}
              className="w-full min-h-11 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-left flex items-center justify-between"
            >
              <span className="text-2xl leading-none">{form.icon}</span>
              <span className="text-white/40">▾</span>
            </button>
          </div>

          <div>
            <label className="text-sm text-purple-200/70 mb-2 block">Color</label>
            <button
              type="button"
              onClick={() => setShowColorSheet(true)}
              className="w-full min-h-11 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-left flex items-center justify-between"
            >
              <span className="flex items-center gap-3"><span className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: form.color }} /> Current color</span>
              <span className="text-white/40">▾</span>
            </button>
          </div>

          <div>
            <label className="text-sm text-purple-200/70 mb-2 block">Type</label>
            <button
              type="button"
              onClick={() => setShowTypeSheet(true)}
              className="w-full min-h-11 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-left flex items-center justify-between"
            >
              <span>{form.type === 'timer' ? '⏱ Timer' : '✓ Check'}</span>
              <span className="text-white/40">▾</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-purple-200/70 mb-2 block">Goal</label>
              <input
                type="number"
                min="1"
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                placeholder="Target amount to complete"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white outline-none focus:border-purple-500/50"
              />
              <p className="text-xs text-white/35 mt-1">Goal = the target amount you want to complete.</p>
            </div>
            <div>
              <label className="text-sm text-purple-200/70 mb-2 block">Unit</label>
              <input
                type="text"
                value={form.type === 'timer' ? 'minutes' : form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                disabled={form.type === 'timer'}
                placeholder="minutes, glasses, pages, reps"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white outline-none focus:border-purple-500/50 disabled:opacity-50"
              />
              <p className="text-xs text-white/35 mt-1">Unit = how progress is measured.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-white font-medium flex items-center gap-2">
                  <Bell className="w-4 h-4 text-orange-400" />
                  Daily reminder
                </p>
                <p className="text-xs text-white/40 mt-1">Shows a reminder in the app and uses notifications when allowed.</p>
              </div>
              <Switch
                checked={form.reminder_enabled}
                onCheckedChange={(checked) => setForm({ ...form, reminder_enabled: checked })}
              />
            </div>

            {form.reminder_enabled && (
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Reminder Time</label>
                <input
                  type="time"
                  value={form.reminder_time}
                  onChange={(e) => setForm({ ...form, reminder_time: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white outline-none focus:border-purple-500/50"
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={!form.name.trim()}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {initialData ? 'Save Habit' : 'Add Habit'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}