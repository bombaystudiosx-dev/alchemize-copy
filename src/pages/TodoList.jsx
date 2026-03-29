import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import { ArrowLeft, Plus, Trash2, Loader2, Pencil, AlertTriangle } from 'lucide-react';
import useBackNav from '@/components/common/useBackNav';
import TaskEditDialog from '@/components/tasks/TaskEditDialog';

import PremiumGate from '@/components/subscription/PremiumGate';

export default function TodoList() {
  const goBack = useBackNav('Home', 'TodoList');
  const [newTodo, setNewTodo] = useState({ text: '', notes: '', urgent: false });
  const [showNotes, setShowNotes] = useState(false);
  const [filter, setFilter] = useState('all');
  const [editingTodo, setEditingTodo] = useState(null);
  const queryClient = useQueryClient();

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: () => base44.entities.TodoItem.list('-created_date')
  });

  const addTodoMutation = useMutation({
    mutationFn: (data) => base44.entities.TodoItem.create({ ...data, order: todos.length }),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const prev = queryClient.getQueryData(['todos']);
      const optimistic = { id: `temp-${Date.now()}`, ...data, order: todos.length, created_date: new Date().toISOString() };
      queryClient.setQueryData(['todos'], (old = []) => [optimistic, ...old]);
      return { prev };
    },
    onError: (err, data, ctx) => { if (ctx?.prev) queryClient.setQueryData(['todos'], ctx.prev); },
    onSuccess: () => {
      setNewTodo({ text: '', notes: '', urgent: false });
      setShowNotes(false);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] })
  });

  const editTodoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TodoItem.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const prev = queryClient.getQueryData(['todos']);
      queryClient.setQueryData(['todos'], (old = []) => old.map(t => t.id === id ? { ...t, ...data } : t));
      return { prev };
    },
    onError: (err, vars, ctx) => { if (ctx?.prev) queryClient.setQueryData(['todos'], ctx.prev); },
    onSuccess: () => { setEditingTodo(null); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] })
  });

  const deleteTodoMutation = useMutation({
    mutationFn: (id) => base44.entities.TodoItem.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const prev = queryClient.getQueryData(['todos']);
      queryClient.setQueryData(['todos'], old => (old || []).filter(t => t.id !== id));
      return { prev };
    },
    onError: (err, id, ctx) => { if (ctx?.prev) queryClient.setQueryData(['todos'], ctx.prev); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] })
  });

  const toggleTodoMutation = useMutation({
    mutationFn: (id) => base44.entities.TodoItem.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const prev = queryClient.getQueryData(['todos']);
      queryClient.setQueryData(['todos'], old => (old || []).filter(t => t.id !== id));
      return { prev };
    },
    onError: (err, id, ctx) => { if (ctx?.prev) queryClient.setQueryData(['todos'], ctx.prev); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] })
  });

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodo.text.trim()) {
      addTodoMutation.mutate(newTodo);
    }
  };

  const visibleTodos = [...todos]
    .sort((a, b) => Number(!!b.urgent) - Number(!!a.urgent))
    .filter((todo) => filter === 'urgent' ? todo.urgent : true);

  return (
    <PremiumGate featureId="todo">
    <div 
      className="min-h-screen flex flex-col items-center relative overflow-hidden bg-[#0a0118]"
      style={{
        backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/b794538fb_DB31821F-BEE3-4395-8386-4993A465E77E.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Subtle dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/30" />

      {/* Content */}
      <div className="relative z-10 w-full min-h-screen flex flex-col px-6 py-8 pb-32">
        {/* Header */}
        <div className="w-full max-w-2xl mx-auto flex items-center justify-between mb-8">
          <motion.button
              onClick={goBack}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-amber-900/40 hover:bg-amber-900/60 backdrop-blur-sm shadow-lg"
            >
              <ArrowLeft className="w-6 h-6 text-amber-100" />
            </motion.button>
          <h1 
            className="text-3xl font-bold text-amber-100 drop-shadow-lg"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Mystical Tasks
          </h1>
          <div className="w-10" />
        </div>

        {/* Main scroll container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl mx-auto flex-1 flex flex-col"
        >
          {/* Soft translucent overlay for task area */}
          <div className="relative backdrop-blur-md bg-amber-50/10 rounded-3xl p-6 shadow-2xl border border-amber-300/30 flex flex-col">
            {/* Add todo form */}
            <form onSubmit={handleAddTodo} className="mb-6 flex-shrink-0 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTodo.text}
                  onChange={(e) => setNewTodo({ ...newTodo, text: e.target.value })}
                  placeholder="Add a new task…"
                  className="flex-1 px-5 py-3 bg-amber-50/90 border border-amber-800/40 rounded-full text-amber-900 placeholder:text-amber-700/60 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/30 shadow-lg backdrop-blur-sm"
                  style={{ fontFamily: "'Courier New', 'Lucida Console', monospace", fontSize: '15px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNotes(!showNotes)}
                  className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 rounded-full text-amber-900 text-sm backdrop-blur-sm border border-amber-700/30 transition-all"
                >
                  {showNotes ? 'Hide' : 'Notes'}
                </button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={!newTodo.text.trim() || addTodoMutation.isPending}
                  className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 rounded-full text-white disabled:opacity-50 shadow-xl flex items-center justify-center transition-all"
                >
                  {addTodoMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-6 h-6" />
                  )}
                </motion.button>
              </div>
              {showNotes && (
                <input
                  type="text"
                  value={newTodo.notes}
                  onChange={(e) => setNewTodo({ ...newTodo, notes: e.target.value })}
                  placeholder="Optional notes…"
                  className="w-full px-5 py-2 bg-amber-50/90 border border-amber-800/40 rounded-full text-amber-900 placeholder:text-amber-700/60 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/30 shadow-lg backdrop-blur-sm text-sm"
                  style={{ fontFamily: "'Courier New', 'Lucida Console', monospace" }}
                />
              )}
              <button
                type="button"
                onClick={() => setNewTodo({ ...newTodo, urgent: !newTodo.urgent })}
                className={`w-full px-4 py-2.5 rounded-full border text-sm transition-all flex items-center justify-center gap-2 ${newTodo.urgent ? 'bg-red-500/15 border-red-500/40 text-red-100' : 'bg-amber-50/10 border-amber-300/20 text-amber-100/80'}`}
              >
                <AlertTriangle className="w-4 h-4" />
                {newTodo.urgent ? 'Urgent task enabled' : 'Mark task as urgent'}
              </button>
            </form>

            <div className="flex gap-2 mb-4">
              {['all', 'urgent'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-[0.2em] transition-all ${filter === value ? 'bg-amber-100 text-amber-900' : 'bg-amber-50/10 text-amber-100/60 border border-amber-200/15'}`}
                >
                  {value === 'all' ? 'All tasks' : 'Urgent'}
                </button>
              ))}
            </div>

            {/* Todo items */}
            <div className="space-y-3 pb-8">
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-10 h-10 animate-spin mx-auto text-amber-400" />
                </div>
              ) : visibleTodos.length === 0 ? (
                <div className="text-center py-16">
                  <p 
                    className="text-amber-100/80 text-lg mb-2" 
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Your scroll awaits…
                  </p>
                  <p 
                    className="text-amber-200/60 text-sm"
                    style={{ fontFamily: "'Courier New', monospace" }}
                  >
                    Add a task above to begin
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {visibleTodos.map((todo, index) => (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-start gap-4 p-4 rounded-2xl border group hover:shadow-xl transition-all backdrop-blur-sm ${todo.urgent ? 'bg-red-50/90 border-red-500/30 hover:bg-red-50' : 'bg-amber-50/85 border-amber-700/20 hover:bg-amber-50/95'}`}
                      style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
                    >
                      <button
                        onClick={() => toggleTodoMutation.mutate(todo.id)}
                        aria-label={`Complete: ${todo.text}`}
                        className="mt-1 w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all border-amber-800/50 hover:border-amber-600 hover:bg-amber-600 hover:shadow-md group"
                      >
                        <svg className="w-4 h-4 text-amber-800/50 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p 
                            className={`${todo.urgent ? 'text-red-950' : 'text-amber-900'} leading-relaxed`}
                            style={{ fontFamily: "'Courier New', 'Lucida Console', monospace", fontSize: '15px' }}
                          >
                            {todo.text}
                          </p>
                          {todo.urgent && (
                            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                              Urgent
                            </span>
                          )}
                        </div>
                        {todo.notes && (
                          <p className={`${todo.urgent ? 'text-red-800/70' : 'text-amber-800/60'} text-sm mt-1`} style={{ fontFamily: "'Courier New', monospace" }}>
                            {todo.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => setEditingTodo(todo)}
                          aria-label={`Edit: ${todo.text}`}
                          className="p-1.5 hover:bg-white/60 rounded-lg transition-all"
                        >
                          <Pencil className="w-4 h-4 text-amber-900" />
                        </button>
                        <button
                          onClick={() => deleteTodoMutation.mutate(todo.id)}
                          aria-label={`Delete: ${todo.text}`}
                          className="p-1.5 hover:bg-red-100 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <TaskEditDialog
        open={!!editingTodo}
        onOpenChange={(open) => !open && setEditingTodo(null)}
        task={editingTodo}
        isSaving={editTodoMutation.isPending}
        onSave={(data) => editTodoMutation.mutate({ id: editingTodo.id, data })}
      />
    </div>
    </PremiumGate>
  );
}