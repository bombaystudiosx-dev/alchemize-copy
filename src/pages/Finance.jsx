import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import CosmicCard from '@/components/cosmic/CosmicCard';
import GlowButton from '@/components/cosmic/GlowButton';
import CosmicInput from '@/components/cosmic/CosmicInput';
import FinanceCalendar from '@/components/finance/FinanceCalendar';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, DollarSign, TrendingUp, TrendingDown, Trash2, StickyNote } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const categoryEmojis = {
  salary: '💼',
  freelance: '💻',
  investment: '📈',
  food: '🍔',
  transport: '🚗',
  entertainment: '🎬',
  bills: '📝',
  shopping: '🛍️',
  health: '🏥',
  other: '📦'
};

export default function Finance() {
  const [showDialog, setShowDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [newTransaction, setNewTransaction] = useState({ 
    type: 'expense', 
    amount: '', 
    category: 'other', 
    description: '', 
    notes: '',
    date: format(new Date(), 'yyyy-MM-dd') 
  });
  const [newNote, setNewNote] = useState({ 
    content: '', 
    date: format(new Date(), 'yyyy-MM-dd') 
  });
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-date')
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['financeNotes'],
    queryFn: () => base44.entities.FinanceNote.list('-date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create({ ...data, amount: parseFloat(data.amount) }),
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      setShowDialog(false);
      setNewTransaction({ 
        type: 'expense', 
        amount: '', 
        category: 'other', 
        description: '', 
        notes: '',
        date: format(new Date(), 'yyyy-MM-dd') 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Transaction.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['transactions'])
  });

  const createNoteMutation = useMutation({
    mutationFn: (data) => base44.entities.FinanceNote.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['financeNotes']);
      setShowNotesDialog(false);
      setNewNote({ content: '', date: format(new Date(), 'yyyy-MM-dd') });
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id) => base44.entities.FinanceNote.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['financeNotes'])
  });

  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  
  const thisMonthTransactions = transactions.filter(t => 
    isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })
  );

  const totalIncome = thisMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpenses = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const balance = totalIncome - totalExpenses;

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
          <h1 className="text-xl font-bold text-white">Financial Tracker</h1>
          <button 
            onClick={() => setShowDialog(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </motion.header>

        <div className="px-6">
          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <p className="text-sm text-white/50 mb-4">{format(new Date(), 'MMMM yyyy')}</p>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              <CosmicCard className="text-center py-4">
                <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-green-400">${totalIncome.toFixed(2)}</p>
                <p className="text-xs text-white/50">Income</p>
              </CosmicCard>
              <CosmicCard className="text-center py-4">
                <TrendingDown className="w-5 h-5 text-red-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-red-400">${totalExpenses.toFixed(2)}</p>
                <p className="text-xs text-white/50">Expenses</p>
              </CosmicCard>
              <CosmicCard className="text-center py-4">
                <DollarSign className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                <p className={`text-lg font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${Math.abs(balance).toFixed(2)}
                </p>
                <p className="text-xs text-white/50">Balance</p>
              </CosmicCard>
            </div>
          </motion.div>

          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <FinanceCalendar transactions={transactions} />
          </motion.div>

          {/* Notes Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-yellow-400" />
                Notes
              </h2>
              <button
                onClick={() => setShowNotesDialog(true)}
                className="text-sm text-purple-300 hover:text-purple-200 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Note
              </button>
            </div>
            
            {notes.length === 0 ? (
              <CosmicCard className="text-center py-8">
                <StickyNote className="w-8 h-8 text-yellow-400/50 mx-auto mb-2" />
                <p className="text-white/50 text-sm">No notes yet</p>
              </CosmicCard>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {notes.map((note) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <CosmicCard className="group">
                        <div className="flex gap-3">
                          <StickyNote className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <p className="text-white text-sm leading-relaxed">{note.content}</p>
                            <p className="text-xs text-white/40 mt-2">{format(new Date(note.date), 'MMM d, yyyy')}</p>
                          </div>
                          <button
                            onClick={() => deleteNoteMutation.mutate(note.id)}
                            className="p-1 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4 text-white/40 hover:text-red-400" />
                          </button>
                        </div>
                      </CosmicCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Transactions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-lg font-semibold text-white mb-4">Transactions</h2>
            
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-16">
                <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Transactions</h3>
                <p className="text-white/50 mb-6">Start tracking your finances</p>
                <GlowButton onClick={() => setShowDialog(true)}>
                  Add Transaction
                </GlowButton>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {transactions.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <CosmicCard className="flex items-center gap-4 py-4 group">
                        <span className="text-2xl">
                          {categoryEmojis[transaction.category]}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-white">{transaction.description || transaction.category}</p>
                          {transaction.notes && (
                            <p className="text-xs text-white/60 mt-0.5">{transaction.notes}</p>
                          )}
                          <p className="text-xs text-white/50">{format(new Date(transaction.date), 'MMM d, yyyy')}</p>
                        </div>
                        <p className={`font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount?.toFixed(2)}
                        </p>
                        <button
                          onClick={() => deleteMutation.mutate(transaction.id)}
                          className="p-1 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4 text-white/40 hover:text-red-400" />
                        </button>
                      </CosmicCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        {/* Add Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-green-500/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                Add Transaction
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['income', 'expense'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewTransaction({ ...newTransaction, type })}
                      className={`
                        p-3 rounded-xl font-medium transition-all
                        ${newTransaction.type === type 
                          ? type === 'income'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                            : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
                          : 'bg-white/10 text-white/60'
                        }
                      `}
                    >
                      {type === 'income' ? '💰 Income' : '💸 Expense'}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Amount</label>
                <CosmicInput
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  placeholder="0.00"
                  icon={DollarSign}
                />
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Category</label>
                <Select
                  value={newTransaction.category}
                  onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a0a2e] border-purple-500/30">
                    {Object.entries(categoryEmojis).map(([key, emoji]) => (
                      <SelectItem key={key} value={key}>
                        {emoji} {key.charAt(0).toUpperCase() + key.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Description</label>
                <CosmicInput
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  placeholder="What was this for?"
                />
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Notes</label>
                <textarea
                  value={newTransaction.notes}
                  onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                  placeholder="Additional notes..."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/15 transition-all resize-none"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Date</label>
                <CosmicInput
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                />
              </div>
              
              <GlowButton
                onClick={() => createMutation.mutate(newTransaction)}
                disabled={!newTransaction.amount || createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? 'Adding...' : 'Add Transaction'}
              </GlowButton>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Note Dialog */}
        <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
          <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-yellow-500/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-yellow-400" />
                Add Note
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Note</label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Write your note here..."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-500/50 focus:bg-white/15 transition-all resize-none"
                  rows={4}
                />
              </div>
              
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Date</label>
                <CosmicInput
                  type="date"
                  value={newNote.date}
                  onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
                />
              </div>
              
              <GlowButton
                onClick={() => createNoteMutation.mutate(newNote)}
                disabled={!newNote.content || createNoteMutation.isPending}
                className="w-full"
              >
                {createNoteMutation.isPending ? 'Adding...' : 'Add Note'}
              </GlowButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CosmicBackground>
  );
}