import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import CosmicInput from '@/components/cosmic/CosmicInput';
import GlowButton from '@/components/cosmic/GlowButton';
import { base44 } from '@/api/base44Client';
import { Dumbbell, Loader2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const workoutTypes = {
  cardio: { emoji: '🏃', label: 'Cardio' },
  strength: { emoji: '💪', label: 'Strength' },
  yoga: { emoji: '🧘', label: 'Yoga' },
  hiit: { emoji: '⚡', label: 'HIIT' },
  stretching: { emoji: '🤸', label: 'Stretching' },
  sports: { emoji: '⚽', label: 'Sports' },
  other: { emoji: '🏋️', label: 'Other' },
};

const buildManualWorkout = () => ({
  workout_name: '',
  type: 'strength',
  duration_minutes: '',
  calories_burned: '',
  notes: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  time: format(new Date(), 'HH:mm'),
});

export default function WorkoutLogDialog({ open, onOpenChange, onSave, isSaving }) {
  const [manualWorkout, setManualWorkout] = useState(buildManualWorkout());
  const [description, setDescription] = useState('');
  const [estimating, setEstimating] = useState(false);
  const [estimatedWorkout, setEstimatedWorkout] = useState(null);

  useEffect(() => {
    if (open) {
      setManualWorkout(buildManualWorkout());
      setDescription('');
      setEstimatedWorkout(null);
      setEstimating(false);
    }
  }, [open]);

  const combineDateTime = (date, time) => {
    if (!date) return null;
    return `${date}T${time || '00:00'}:00`;
  };

  const handleManualSave = () => {
    if (!manualWorkout.duration_minutes) return;
    onSave({
      workout_name: manualWorkout.workout_name.trim(),
      type: manualWorkout.type,
      duration_minutes: manualWorkout.duration_minutes,
      calories_burned: manualWorkout.calories_burned,
      notes: manualWorkout.notes.trim(),
      date: manualWorkout.date,
      workout_datetime: combineDateTime(manualWorkout.date, manualWorkout.time),
      workout_source: 'manual',
      is_estimated: false,
      intensity_estimate: null,
      description_text: null,
      routine_description: manualWorkout.routine_description?.trim() || null,
      routine_sets: manualWorkout.routine_sets ? parseInt(manualWorkout.routine_sets, 10) : null,
      routine_reps: manualWorkout.routine_reps ? parseInt(manualWorkout.routine_reps, 10) : null,
    });
  };

  const estimateWorkout = async () => {
    if (!description.trim()) return;
    setEstimating(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Estimate workout details from this description: "${description.trim()}".

Return one realistic workout summary with:
- a short workout name
- best workout category
- duration in minutes
- estimated calories burned
- intensity estimate (low, moderate, or high)
- a concise notes summary
Keep the numbers realistic and conservative.`,
        response_json_schema: {
          type: 'object',
          properties: {
            workout_name: { type: 'string' },
            type: { type: 'string', enum: ['cardio', 'strength', 'yoga', 'hiit', 'stretching', 'sports', 'other'] },
            duration_minutes: { type: 'number' },
            calories_burned: { type: 'number' },
            intensity_estimate: { type: 'string', enum: ['low', 'moderate', 'high'] },
            notes: { type: 'string' },
          },
        },
      });

      setEstimatedWorkout({
        ...response,
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
      });
    } finally {
      setEstimating(false);
    }
  };

  const handleEstimatedSave = () => {
    if (!estimatedWorkout?.duration_minutes) return;
    onSave({
      workout_name: estimatedWorkout.workout_name?.trim(),
      type: estimatedWorkout.type,
      duration_minutes: estimatedWorkout.duration_minutes,
      calories_burned: estimatedWorkout.calories_burned,
      notes: estimatedWorkout.notes?.trim(),
      date: estimatedWorkout.date,
      workout_datetime: combineDateTime(estimatedWorkout.date, estimatedWorkout.time),
      workout_source: 'ai',
      is_estimated: true,
      intensity_estimate: estimatedWorkout.intensity_estimate,
      description_text: description.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-red-500/30 text-white max-w-md max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-red-400" />
            Log Workout
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="manual" className="mt-3">
          <TabsList className="grid grid-cols-2 bg-white/10">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="ai">Describe with AI</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-purple-200/70 mb-2 block">Workout Name</label>
              <CosmicInput
                value={manualWorkout.workout_name}
                onChange={(e) => setManualWorkout({ ...manualWorkout, workout_name: e.target.value })}
                placeholder="Chest day, treadmill walk..."
              />
            </div>

            <div>
              <label className="text-sm text-purple-200/70 mb-2 block">Workout Type</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(workoutTypes).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setManualWorkout({ ...manualWorkout, type: key })}
                    className={`rounded-xl px-3 py-2.5 text-sm transition-all ${manualWorkout.type === key ? 'bg-red-500/25 border border-red-400/40' : 'bg-white/10 border border-white/10'}`}
                  >
                    <span className="mr-2">{item.emoji}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Duration (min)</label>
                <CosmicInput
                  type="number"
                  value={manualWorkout.duration_minutes}
                  onChange={(e) => setManualWorkout({ ...manualWorkout, duration_minutes: e.target.value })}
                  placeholder="45"
                />
              </div>
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Calories Burned</label>
                <CosmicInput
                  type="number"
                  value={manualWorkout.calories_burned}
                  onChange={(e) => setManualWorkout({ ...manualWorkout, calories_burned: e.target.value })}
                  placeholder="320"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Date</label>
                <CosmicInput
                  type="date"
                  value={manualWorkout.date}
                  onChange={(e) => setManualWorkout({ ...manualWorkout, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Time</label>
                <CosmicInput
                  type="time"
                  value={manualWorkout.time}
                  onChange={(e) => setManualWorkout({ ...manualWorkout, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-purple-200/70 mb-2 block">Notes</label>
              <Textarea
                value={manualWorkout.notes}
                onChange={(e) => setManualWorkout({ ...manualWorkout, notes: e.target.value })}
                placeholder="Describe workout"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-4 space-y-3">
              <p className="text-sm text-white font-medium">Current Workout Routine</p>
              <div>
                <label className="text-xs text-white/40 block mb-1">Workout description (optional)</label>
                <Textarea
                  value={manualWorkout.routine_description || ''}
                  onChange={(e) => setManualWorkout({ ...manualWorkout, routine_description: e.target.value })}
                  placeholder="Bench press, incline dumbbells, cable flys"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/35"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 block mb-1">Sets (optional)</label>
                  <CosmicInput
                    type="number"
                    value={manualWorkout.routine_sets || ''}
                    onChange={(e) => setManualWorkout({ ...manualWorkout, routine_sets: e.target.value })}
                    placeholder="4"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 block mb-1">Reps (optional)</label>
                  <CosmicInput
                    type="number"
                    value={manualWorkout.routine_reps || ''}
                    onChange={(e) => setManualWorkout({ ...manualWorkout, routine_reps: e.target.value })}
                    placeholder="12"
                  />
                </div>
              </div>
            </div>

            <GlowButton onClick={handleManualSave} disabled={!manualWorkout.duration_minutes || isSaving} className="w-full">
              {isSaving ? 'Saving...' : 'Save Workout'}
            </GlowButton>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-purple-300 mb-2">AI Estimate</p>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="I walked 45 minutes and finished with 10 minutes of stretching"
                className="bg-transparent border-0 p-0 text-white placeholder:text-white/35 focus-visible:ring-0 min-h-[100px]"
              />
            </div>

            {!estimatedWorkout ? (
              <GlowButton onClick={estimateWorkout} disabled={!description.trim() || estimating} className="w-full">
                {estimating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {estimating ? 'Estimating...' : 'Estimate Workout'}
              </GlowButton>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-3">Review Estimated Workout</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-white/40 block mb-1">Workout Name</label>
                      <input
                        value={estimatedWorkout.workout_name || ''}
                        onChange={(e) => setEstimatedWorkout({ ...estimatedWorkout, workout_name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 block mb-1">Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(workoutTypes).map(([key, item]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setEstimatedWorkout({ ...estimatedWorkout, type: key })}
                            className={`rounded-xl px-3 py-2.5 text-sm transition-all ${estimatedWorkout.type === key ? 'bg-red-500/25 border border-red-400/40' : 'bg-white/10 border border-white/10'}`}
                          >
                            <span className="mr-2">{item.emoji}</span>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-white/40 block mb-1">Duration</label>
                        <input
                          type="number"
                          value={estimatedWorkout.duration_minutes || ''}
                          onChange={(e) => setEstimatedWorkout({ ...estimatedWorkout, duration_minutes: parseInt(e.target.value, 10) || 0 })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/40 block mb-1">Calories</label>
                        <input
                          type="number"
                          value={estimatedWorkout.calories_burned || ''}
                          onChange={(e) => setEstimatedWorkout({ ...estimatedWorkout, calories_burned: parseInt(e.target.value, 10) || 0 })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-white/40 block mb-1">Date</label>
                        <input
                          type="date"
                          value={estimatedWorkout.date || ''}
                          onChange={(e) => setEstimatedWorkout({ ...estimatedWorkout, date: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/40 block mb-1">Time</label>
                        <input
                          type="time"
                          value={estimatedWorkout.time || ''}
                          onChange={(e) => setEstimatedWorkout({ ...estimatedWorkout, time: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-white/40 block mb-1">Intensity</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['low', 'moderate', 'high'].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setEstimatedWorkout({ ...estimatedWorkout, intensity_estimate: level })}
                            className={`rounded-xl px-3 py-2.5 text-sm capitalize transition-all ${estimatedWorkout.intensity_estimate === level ? 'bg-red-500/25 border border-red-400/40' : 'bg-white/10 border border-white/10'}`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-white/40 block mb-1">Notes</label>
                      <Textarea
                        value={estimatedWorkout.notes || ''}
                        onChange={(e) => setEstimatedWorkout({ ...estimatedWorkout, notes: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>
                </div>

                <GlowButton onClick={handleEstimatedSave} disabled={isSaving || !estimatedWorkout.duration_minutes} className="w-full">
                  {isSaving ? 'Saving...' : 'Save Estimated Workout'}
                </GlowButton>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}