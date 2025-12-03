import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import CosmicCard from '@/components/cosmic/CosmicCard';
import GlowButton from '@/components/cosmic/GlowButton';
import CosmicInput from '@/components/cosmic/CosmicInput';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, Calendar, Clock, Bell, Trash2, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { format, isToday, isTomorrow, isPast, isFuture } from 'date-fns';

export default function Appointments() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [newAppointment, setNewAppointment] = useState({ 
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    notes: '',
    reminder: true
  });
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list('date,time')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Appointment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      closeDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Appointment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      closeDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Appointment.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['appointments'])
  });

  const closeDialog = () => {
    setShowDialog(false);
    setEditingAppointment(null);
    setNewAppointment({ 
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      notes: '',
      reminder: true
    });
  };

  const openEditDialog = (appointment) => {
    setEditingAppointment(appointment);
    setNewAppointment({
      title: appointment.title,
      date: appointment.date,
      time: appointment.time,
      notes: appointment.notes || '',
      reminder: appointment.reminder !== false
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (editingAppointment) {
      updateMutation.mutate({ id: editingAppointment.id, data: newAppointment });
    } else {
      createMutation.mutate(newAppointment);
    }
  };

  const getDateLabel = (date) => {
    const d = new Date(date);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'EEEE, MMM d');
  };

  const upcomingAppointments = appointments.filter(a => 
    isFuture(new Date(a.date)) || isToday(new Date(a.date))
  );

  const pastAppointments = appointments.filter(a => 
    isPast(new Date(a.date)) && !isToday(new Date(a.date))
  );

  return (
    <CosmicBackground>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-6 py-4 sticky top-0 z-50 bg-gradient-to-b from-[#0a0118] to-transparent"
        >
          <Link to={createPageUrl('Home')} className="flex items-center gap-2 text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Appointments</h1>
          <button 
            onClick={() => setShowDialog(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </motion.header>

        <div className="px-6">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3 mb-8"
          >
            <CosmicCard className="text-center py-4">
              <p className="text-2xl font-bold text-white">{upcomingAppointments.length}</p>
              <p className="text-xs text-white/50">Upcoming</p>
            </CosmicCard>
            <CosmicCard className="text-center py-4">
              <p className="text-2xl font-bold text-white/50">{pastAppointments.length}</p>
              <p className="text-xs text-white/50">Past</p>
            </CosmicCard>
          </motion.div>

          {/* Upcoming Appointments */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Appointments</h3>
              <p className="text-white/50 mb-6">Schedule your first appointment</p>
              <GlowButton onClick={() => setShowDialog(true)}>
                Add Appointment
              </GlowButton>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {upcomingAppointments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="text-lg font-semibold text-white mb-4">Upcoming</h2>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {upcomingAppointments.map((appointment, index) => (
                        <motion.div
                          key={appointment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <CosmicCard className="group">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-white">{appointment.title}</h3>
                                <div className="flex items-center gap-3 text-sm text-white/60 mt-1">
                                  <span>{getDateLabel(appointment.date)}</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {appointment.time}
                                  </span>
                                </div>
                                {appointment.notes && (
                                  <p className="text-xs text-white/40 mt-2 line-clamp-1">{appointment.notes}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {appointment.reminder && (
                                  <Bell className="w-4 h-4 text-blue-400" />
                                )}
                                <button
                                  onClick={() => openEditDialog(appointment)}
                                  className="p-1 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Edit2 className="w-4 h-4 text-white/60" />
                                </button>
                                <button
                                  onClick={() => deleteMutation.mutate(appointment.id)}
                                  className="p-1 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-4 h-4 text-white/40 hover:text-red-400" />
                                </button>
                              </div>
                            </div>
                          </CosmicCard>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {pastAppointments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="text-lg font-semibold text-white/50 mb-4">Past</h2>
                  <div className="space-y-3">
                    {pastAppointments.slice(0, 5).map((appointment) => (
                      <CosmicCard key={appointment.id} className="opacity-50 group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white/50" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-white/70">{appointment.title}</h3>
                            <p className="text-xs text-white/40">{format(new Date(appointment.date), 'MMM d, yyyy')}</p>
                          </div>
                          <button
                            onClick={() => deleteMutation.mutate(appointment.id)}
                            className="p-1 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4 text-white/40 hover:text-red-400" />
                          </button>
                        </div>
                      </CosmicCard>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={closeDialog}>
          <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-blue-500/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                {editingAppointment ? 'Edit Appointment' : 'Add Appointment'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Title</label>
                <CosmicInput
                  value={newAppointment.title}
                  onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                  placeholder="Appointment title"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-purple-200/70 mb-2 block">Date</label>
                  <CosmicInput
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-purple-200/70 mb-2 block">Time</label>
                  <CosmicInput
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Notes (optional)</label>
                <Textarea
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                  placeholder="Add any notes..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm text-purple-200/70">Reminder</label>
                <Switch
                  checked={newAppointment.reminder}
                  onCheckedChange={(checked) => setNewAppointment({ ...newAppointment, reminder: checked })}
                />
              </div>
              
              <GlowButton
                onClick={handleSubmit}
                disabled={!newAppointment.title || createMutation.isPending || updateMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingAppointment ? 'Update Appointment' : 'Add Appointment'}
              </GlowButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CosmicBackground>
  );
}