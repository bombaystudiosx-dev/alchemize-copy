import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TodoList() {
  const [newTodo, setNewTodo] = useState('');
  const queryClient = useQueryClient();

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: () => base44.entities.TodoItem.list('-created_date')
  });

  const addTodoMutation = useMutation({
    mutationFn: (text) => base44.entities.TodoItem.create({ text, order: todos.length }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setNewTodo('');
    }
  });

  const deleteTodoMutation = useMutation({
    mutationFn: (id) => base44.entities.TodoItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] })
  });

  const toggleTodoMutation = useMutation({
    mutationFn: ({ id, completed }) => base44.entities.TodoItem.update(id, { completed: !completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] })
  });

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodo.trim()) {
      addTodoMutation.mutate(newTodo.trim());
    }
  };

  return (
    <CosmicBackground dimmed>
      <div className="min-h-screen flex flex-col items-center px-6 py-8">
        {/* Header */}
        <div className="w-full max-w-md flex items-center justify-between mb-8">
          <Link to={createPageUrl('Home')}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </motion.button>
          </Link>
        </div>

        {/* Floating Scroll Paper */}
        <motion.div
          initial={{ opacity: 0, y: 50, rotateX: 10 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            rotateX: 0,
            rotateY: [0, 2, -2, 0],
          }}
          transition={{
            opacity: { duration: 0.5 },
            y: { duration: 0.5 },
            rotateY: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative w-full max-w-md"
          style={{ perspective: '1000px' }}
        >
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-b from-amber-500/30 via-amber-400/20 to-purple-500/30 blur-2xl" />
          
          {/* Scroll container with background image */}
          <div 
            className="relative min-h-[600px] rounded-lg shadow-2xl overflow-hidden"
          >
            {/* Background image layer */}
            <div 
              className="absolute inset-0 opacity-95"
              style={{
                backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692fa99b47f4eb7e5fb3c1a9/b794538fb_DB31821F-BEE3-4395-8386-4993A465E77E.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            
            {/* Content layer */}
            <div className="relative z-10 p-8 pt-20 max-h-[600px] overflow-y-auto scrollbar-hide">
            {/* Add todo form */}
            <form onSubmit={handleAddTodo} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-1 px-4 py-2 bg-amber-50/90 border-2 border-amber-800/30 rounded-lg text-amber-900 placeholder:text-amber-700/50 focus:outline-none focus:border-amber-600/50"
                  style={{ fontFamily: "'Courier New', monospace" }}
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!newTodo.trim() || addTodoMutation.isPending}
                  className="p-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-white disabled:opacity-50"
                >
                  {addTodoMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </form>

            {/* Todo items with infinite scroll */}
            <div className="space-y-3 pb-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-700" />
                </div>
              ) : todos.length === 0 ? (
                <p className="text-center text-amber-800/60 py-8" style={{ fontFamily: "'Courier New', monospace" }}>
                  No tasks yet. Add one above!
                </p>
              ) : (
                <AnimatePresence>
                  {todos.map((todo) => (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-start gap-3 p-3 bg-amber-50/80 rounded-lg border border-amber-800/20 group hover:bg-amber-100/80 transition-colors backdrop-blur-sm"
                    >
                      <button
                        onClick={() => toggleTodoMutation.mutate({ id: todo.id, completed: todo.completed })}
                        className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                          todo.completed 
                            ? 'bg-amber-600 border-amber-600' 
                            : 'border-amber-800/40 hover:border-amber-600'
                        }`}
                      >
                        {todo.completed && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <p 
                        className={`flex-1 text-amber-900 ${todo.completed ? 'line-through opacity-60' : ''}`}
                        style={{ fontFamily: "'Courier New', monospace", fontSize: '15px' }}
                      >
                        {todo.text}
                      </p>
                      <button
                        onClick={() => deleteTodoMutation.mutate(todo.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
            </div>
          </div>
        </motion.div>
      </div>
    </CosmicBackground>
  );
}