import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TodoList() {
  const [newTodo, setNewTodo] = useState({ text: '', notes: '' });
  const [showNotes, setShowNotes] = useState(false);
  const queryClient = useQueryClient();

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: () => base44.entities.TodoItem.list('-created_date')
  });

  const addTodoMutation = useMutation({
    mutationFn: (data) => base44.entities.TodoItem.create({ ...data, order: todos.length }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setNewTodo({ text: '', notes: '' });
      setShowNotes(false);
    }
  });

  const deleteTodoMutation = useMutation({
    mutationFn: (id) => base44.entities.TodoItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] })
  });

  const toggleTodoMutation = useMutation({
    mutationFn: (id) => base44.entities.TodoItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] })
  });

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodo.text.trim()) {
      addTodoMutation.mutate(newTodo);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center relative overflow-hidden"
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
      <div className="relative z-10 w-full min-h-screen flex flex-col px-6 py-8">
        {/* Header */}
        <div className="w-full max-w-2xl mx-auto flex items-center justify-between mb-8">
          <Link to={createPageUrl('Home')}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-amber-900/40 hover:bg-amber-900/60 backdrop-blur-sm shadow-lg"
            >
              <ArrowLeft className="w-6 h-6 text-amber-100" />
            </motion.button>
          </Link>
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
          <div className="relative backdrop-blur-md bg-amber-50/10 rounded-3xl p-6 shadow-2xl border border-amber-300/30 flex flex-col h-full max-h-[calc(100vh-200px)]">
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
            </form>

            {/* Todo items with infinite scroll */}
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-3">
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-10 h-10 animate-spin mx-auto text-amber-400" />
                </div>
              ) : todos.length === 0 ? (
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
                  {todos.map((todo, index) => (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-4 p-4 bg-amber-50/85 rounded-2xl border border-amber-700/20 group hover:bg-amber-50/95 hover:shadow-xl transition-all backdrop-blur-sm"
                      style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
                    >
                      <button
                        onClick={() => toggleTodoMutation.mutate(todo.id)}
                        className="mt-1 w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all border-amber-800/50 hover:border-amber-600 hover:bg-amber-600 hover:shadow-md group"
                      >
                        <svg className="w-4 h-4 text-amber-800/50 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <div className="flex-1">
                        <p 
                          className="text-amber-900 leading-relaxed"
                          style={{ fontFamily: "'Courier New', 'Lucida Console', monospace", fontSize: '15px' }}
                        >
                          {todo.text}
                        </p>
                        {todo.notes && (
                          <p className="text-amber-800/60 text-sm mt-1" style={{ fontFamily: "'Courier New', monospace" }}>
                            {todo.notes}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteTodoMutation.mutate(todo.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}