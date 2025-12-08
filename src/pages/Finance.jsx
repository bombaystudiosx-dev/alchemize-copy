import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import CosmicCard from '@/components/cosmic/CosmicCard';
import GlowButton from '@/components/cosmic/GlowButton';
import CosmicInput from '@/components/cosmic/CosmicInput';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, DollarSign, TrendingUp, TrendingDown, Trash2, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, isWithinInterval } from 'date-fns';

export default function Finance() {
  const [viewMode, setViewMode] = useState('monthly');
  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [showLoginInfo, setShowLoginInfo] = useState(false);
  const [newIncome, setNewIncome] = useState({ income_gross: '', tax_amount: '', deductions: '', income_date: format(new Date(), 'yyyy-MM-dd') });
  const [newExpense, setNewExpense] = useState({ expense_name: '', expense_category: 'Food', expense_amount: '', expense_date: format(new Date(), 'yyyy-MM-dd') });
  
  const queryClient = useQueryClient();

  const { data: incomes = [] } = useQuery({
    queryKey: ['financialIncomes'],
    queryFn: () => base44.entities.FinancialIncome.list('-income_date')
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['financialExpenses'],
    queryFn: () => base44.entities.FinancialExpense.list('-expense_date')
  });

  const { data: notesData = [] } = useQuery({
    queryKey: ['financialNotes'],
    queryFn: () => base44.entities.FinancialNote.list()
  });

  const financialNote = notesData[0] || { note_login_info: '', note_total_debt: '', debt_amount: 0, savings_amount: 0, emergency_fund: 0 };

  const createIncomeMutation = useMutation({
    mutationFn: (data) => {
      const income_gross = parseFloat(data.income_gross) || 0;
      const tax_amount = parseFloat(data.tax_amount) || 0;
      const deductions = parseFloat(data.deductions) || 0;
      const income_net = income_gross - tax_amount - deductions;
      return base44.entities.FinancialIncome.create({ 
        income_gross, 
        tax_amount, 
        deductions, 
        income_net, 
        income_date: data.income_date 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['financialIncomes']);
      setShowIncomeDialog(false);
      setNewIncome({ income_gross: '', tax_amount: '', deductions: '', income_date: format(new Date(), 'yyyy-MM-dd') });
    }
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data) => base44.entities.FinancialExpense.create({
      expense_name: data.expense_name,
      expense_category: data.expense_category,
      expense_amount: parseFloat(data.expense_amount) || 0,
      expense_date: data.expense_date
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['financialExpenses']);
      setShowExpenseDialog(false);
      setNewExpense({ expense_name: '', expense_category: 'Food', expense_amount: '', expense_date: format(new Date(), 'yyyy-MM-dd') });
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id) => base44.entities.FinancialExpense.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['financialExpenses'])
  });

  const updateNotesMutation = useMutation({
    mutationFn: (data) => {
      if (notesData[0]) {
        return base44.entities.FinancialNote.update(notesData[0].id, data);
      }
      return base44.entities.FinancialNote.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['financialNotes']);
      setShowNotesDialog(false);
    }
  });

  // Calculate period based on view mode
  const getPeriodData = () => {
    const now = new Date();
    let start, end, label;
    
    if (viewMode === 'monthly') {
      start = startOfMonth(now);
      end = endOfMonth(now);
      label = format(now, 'MMMM yyyy');
    } else if (viewMode === 'quarterly') {
      start = startOfQuarter(now);
      end = endOfQuarter(now);
      const q = Math.floor(now.getMonth() / 3) + 1;
      label = `Q${q} ${format(now, 'yyyy')}`;
    } else {
      start = startOfYear(now);
      end = endOfYear(now);
      label = format(now, 'yyyy');
    }

    const periodIncomes = incomes.filter(i => isWithinInterval(new Date(i.income_date), { start, end }));
    const periodExpenses = expenses.filter(e => isWithinInterval(new Date(e.expense_date), { start, end }));

    const grossIncome = periodIncomes.reduce((sum, i) => sum + (i.income_gross || 0), 0);
    const netIncome = periodIncomes.reduce((sum, i) => sum + (i.income_net || 0), 0);
    const totalExpenses = periodExpenses.reduce((sum, e) => sum + (e.expense_amount || 0), 0);
    const moneyLeft = netIncome - totalExpenses;

    // Category breakdown
    const categoryBreakdown = {};
    periodExpenses.forEach(e => {
      categoryBreakdown[e.expense_category] = (categoryBreakdown[e.expense_category] || 0) + e.expense_amount;
    });

    return { grossIncome, netIncome, totalExpenses, moneyLeft, label, categoryBreakdown, periodExpenses };
  };

  const { grossIncome, netIncome, totalExpenses, moneyLeft, label, categoryBreakdown, periodExpenses } = getPeriodData();
  const totalDebt = financialNote.debt_amount || 0;

  const expenseCategories = ['Food', 'Transport', 'Bills', 'Entertainment', 'Shopping', 'Health', 'Other'];

  return (
    <CosmicBackground>
      <div className="min-h-screen pb-8">
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
          <div className="w-10" />
        </motion.header>

        <div className="px-6 space-y-6">
          {/* View Mode Tabs */}
          <div className="flex gap-2">
            {['monthly', 'quarterly', 'yearly'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${
                  viewMode === mode
                    ? 'bg-purple-500/30 border border-purple-500/50 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Budget Sheet */}
          <CosmicCard>
            <h2 className="text-lg font-bold text-white mb-4">{label} Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/70">Gross Income</span>
                <span className="text-green-400 font-bold">${grossIncome.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Net Income</span>
                <span className="text-green-400 font-bold">${netIncome.toFixed(2)}</span>
              </div>
              <div className="h-px bg-white/20" />
              <div className="flex justify-between">
                <span className="text-white/70">Total Expenses</span>
                <span className="text-red-400 font-bold">${totalExpenses.toFixed(2)}</span>
              </div>
              <div className="h-px bg-white/20" />
              <div className="flex justify-between text-lg">
                <span className="text-white font-semibold">Money Left Over</span>
                <span className={`font-bold ${moneyLeft >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${moneyLeft.toFixed(2)}
                </span>
              </div>
              {(financialNote.savings_amount > 0 || financialNote.emergency_fund > 0) && (
                <>
                  <div className="h-px bg-white/20" />
                  {financialNote.savings_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Savings</span>
                      <span className="text-purple-400 font-bold">${financialNote.savings_amount.toFixed(2)}</span>
                    </div>
                  )}
                  {financialNote.emergency_fund > 0 && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Emergency Fund</span>
                      <span className="text-blue-400 font-bold">${financialNote.emergency_fund.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <GlowButton onClick={() => setShowIncomeDialog(true)} className="flex-1" size="sm">
                <Plus className="w-4 h-4" /> Income
              </GlowButton>
              <GlowButton onClick={() => setShowExpenseDialog(true)} variant="secondary" className="flex-1" size="sm">
                <Plus className="w-4 h-4" /> Expense
              </GlowButton>
            </div>
          </CosmicCard>

          {/* Calendars */}
          <div className="space-y-4">
            <IncomeCalendar incomes={incomes} />
            <ExpenseCalendar expenses={expenses} />
          </div>

          {/* Category Breakdown */}
          {Object.keys(categoryBreakdown).length > 0 && (
            <CosmicCard>
              <h3 className="text-white font-semibold mb-3">Category Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(categoryBreakdown).map(([cat, amount]) => (
                  <div key={cat} className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">{cat}</span>
                    <span className="text-red-400 font-medium">${amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CosmicCard>
          )}

          {/* Expenses List */}
          <CosmicCard>
            <h3 className="text-white font-semibold mb-3">Recent Expenses</h3>
            {periodExpenses.length === 0 ? (
              <p className="text-white/50 text-sm text-center py-4">No expenses for this period</p>
            ) : (
              <div className="space-y-2">
                {periodExpenses.slice(0, 10).map(expense => (
                  <div key={expense.id} className="flex items-center justify-between py-2 border-b border-white/10">
                    <div className="flex-1">
                      <p className="text-white text-sm">{expense.expense_name}</p>
                      <p className="text-white/50 text-xs">{expense.expense_category} • {format(new Date(expense.expense_date), 'MMM d')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 font-medium">${expense.expense_amount.toFixed(2)}</span>
                      <button onClick={() => deleteExpenseMutation.mutate(expense.id)} className="p-1 hover:bg-white/10 rounded">
                        <Trash2 className="w-4 h-4 text-white/40 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CosmicCard>

          {/* Notes Section */}
          <CosmicCard>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">Financial Notes</h3>
              <GlowButton onClick={() => setShowNotesDialog(true)} size="sm" variant="ghost">
                Edit
              </GlowButton>
            </div>
            
            {/* Important Login Info */}
            <div className="mb-4 p-3 rounded-lg bg-white/5 border border-yellow-500/30">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-medium">Important Login Info</span>
                </div>
                <button onClick={() => setShowLoginInfo(!showLoginInfo)} className="text-white/50 hover:text-white">
                  {showLoginInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-white/70 text-sm whitespace-pre-wrap">
                {showLoginInfo ? (financialNote.note_login_info || 'No login info saved') : '••••••••••••••'}
              </p>
            </div>

            {/* Total Debt Notes */}
            <div className="p-3 rounded-lg bg-white/5 border border-red-500/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm font-medium">Total Debt Notes</span>
              </div>
              <p className="text-white/70 text-sm whitespace-pre-wrap mb-2">
                {financialNote.note_total_debt || 'No debt notes'}
              </p>
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="text-white/50 text-xs">Total Debt Amount:</span>
                <span className="text-red-400 font-bold">${totalDebt.toFixed(2)}</span>
              </div>
              {financialNote.debt_due_date && (
                <p className="text-white/50 text-xs mt-1">Due: {format(new Date(financialNote.debt_due_date), 'MMM d, yyyy')}</p>
              )}
            </div>
          </CosmicCard>
        </div>

        {/* Add Income Dialog */}
        <Dialog open={showIncomeDialog} onOpenChange={setShowIncomeDialog}>
          <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-green-500/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Add Income</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Gross Income</label>
                <CosmicInput type="number" value={newIncome.income_gross} onChange={(e) => setNewIncome({ ...newIncome, income_gross: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Taxes</label>
                <CosmicInput type="number" value={newIncome.tax_amount} onChange={(e) => setNewIncome({ ...newIncome, tax_amount: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Other Deductions</label>
                <CosmicInput type="number" value={newIncome.deductions} onChange={(e) => setNewIncome({ ...newIncome, deductions: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Date</label>
                <CosmicInput type="date" value={newIncome.income_date} onChange={(e) => setNewIncome({ ...newIncome, income_date: e.target.value })} />
              </div>
              <GlowButton onClick={() => createIncomeMutation.mutate(newIncome)} disabled={!newIncome.income_gross} className="w-full">
                Add Income
              </GlowButton>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Expense Dialog */}
        <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
          <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-red-500/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Add Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Name</label>
                <CosmicInput value={newExpense.expense_name} onChange={(e) => setNewExpense({ ...newExpense, expense_name: e.target.value })} placeholder="Grocery shopping" />
              </div>
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Category</label>
                <Select value={newExpense.expense_category} onValueChange={(val) => setNewExpense({ ...newExpense, expense_category: val })}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a0a2e] border-purple-500/30">
                    {expenseCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Amount</label>
                <CosmicInput type="number" value={newExpense.expense_amount} onChange={(e) => setNewExpense({ ...newExpense, expense_amount: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Date</label>
                <CosmicInput type="date" value={newExpense.expense_date} onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })} />
              </div>
              <GlowButton onClick={() => createExpenseMutation.mutate(newExpense)} disabled={!newExpense.expense_name || !newExpense.expense_amount} className="w-full">
                Add Expense
              </GlowButton>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Notes Dialog */}
        <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
          <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-yellow-500/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Financial Notes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-yellow-400 mb-2 block flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Important Login Info
                </label>
                <textarea
                  defaultValue={financialNote.note_login_info}
                  onChange={(e) => financialNote.note_login_info = e.target.value}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-500/50 resize-none"
                  rows={4}
                  placeholder="Store sensitive login information here..."
                />
              </div>
              <div>
                <label className="text-sm text-red-400 mb-2 block flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Total Debt Notes
                </label>
                <textarea
                  defaultValue={financialNote.note_total_debt}
                  onChange={(e) => financialNote.note_total_debt = e.target.value}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 resize-none"
                  rows={4}
                  placeholder="List debts, interest rates, etc..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-purple-200/70 mb-2 block">Debt Amount</label>
                  <CosmicInput type="number" defaultValue={financialNote.debt_amount} onChange={(e) => financialNote.debt_amount = parseFloat(e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm text-purple-200/70 mb-2 block">Due Date</label>
                  <CosmicInput type="date" defaultValue={financialNote.debt_due_date} onChange={(e) => financialNote.debt_due_date = e.target.value} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-purple-200/70 mb-2 block">Savings</label>
                  <CosmicInput type="number" defaultValue={financialNote.savings_amount} onChange={(e) => financialNote.savings_amount = parseFloat(e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm text-purple-200/70 mb-2 block">Emergency Fund</label>
                  <CosmicInput type="number" defaultValue={financialNote.emergency_fund} onChange={(e) => financialNote.emergency_fund = parseFloat(e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <GlowButton 
                onClick={() => {
                  const updatedNote = {
                    note_login_info: financialNote.note_login_info,
                    note_total_debt: financialNote.note_total_debt,
                    debt_amount: parseFloat(financialNote.debt_amount) || 0,
                    debt_due_date: financialNote.debt_due_date,
                    savings_amount: parseFloat(financialNote.savings_amount) || 0,
                    emergency_fund: parseFloat(financialNote.emergency_fund) || 0
                  };
                  updateNotesMutation.mutate(updatedNote);
                }} 
                className="w-full"
              >
                Save Notes
              </GlowButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CosmicBackground>
  );
}