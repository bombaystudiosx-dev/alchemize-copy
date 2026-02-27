import React, { useState, useMemo, useEffect } from 'react';
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
import useBackNav from '@/components/common/useBackNav';
import { toast } from '@/components/common/AppToast';
import PremiumGate from '@/components/subscription/PremiumGate';
import IncomeCalendar from '@/components/finance/IncomeCalendar';
import ExpenseCalendar from '@/components/finance/ExpenseCalendar';
import YearCalendar from '@/components/finance/YearCalendar';
import FinanceNotepad from '@/components/finance/FinanceNotepad';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import PullToRefresh from '@/components/common/PullToRefresh';
import BottomSheet from '@/components/native/BottomSheet';

export default function Finance() {
  const goBack = useBackNav('Home', 'Finance');
  const [viewMode, setViewMode] = useState('monthly');
  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [showLoginInfo, setShowLoginInfo] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [newIncome, setNewIncome] = useState({ income_gross: '', tax_percentage: '25', tax_amount: '', deductions: '', income_category: 'Salary', income_date: format(new Date(), 'yyyy-MM-dd') });
  const [newExpense, setNewExpense] = useState({ expense_name: '', expense_category: 'Bills', expense_amount: '', expense_date: format(new Date(), 'yyyy-MM-dd') });
  const [customIncomeCategory, setCustomIncomeCategory] = useState('');
  const [customExpenseCategory, setCustomExpenseCategory] = useState('');
  const [incomeCategories, setIncomeCategories] = useState(['Salary', 'Freelance', 'Business', 'Investment', 'Bonus', 'Other']);
  const [expenseCategories, setExpenseCategories] = useState(['Bills', 'Business', 'Personal', 'Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Education', 'Other']);
  
  const [showIncomeCatSheet, setShowIncomeCatSheet] = useState(false);
  const [showExpenseCatSheet, setShowExpenseCatSheet] = useState(false);
  const queryClient = useQueryClient();

  const { data: incomes = [] } = useQuery({
    queryKey: ['financialIncomes'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.FinancialIncome.filter({ created_by: user.email }, '-income_date');
    }
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['financialExpenses'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.FinancialExpense.filter({ created_by: user.email }, '-expense_date');
    }
  });

  const { data: notesData = [] } = useQuery({
    queryKey: ['financialNotes'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.FinancialNote.filter({ created_by: user.email });
    }
  });

  const { data: financeNotes = [] } = useQuery({
    queryKey: ['financeNotes'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.FinanceNote.filter({ created_by: user.email });
    }
  });

  const financialNote = notesData[0] || { note_login_info: '', note_total_debt: '', debt_amount: 0, savings_amount: 0, emergency_fund: 0 };

  const createIncomeMutation = useMutation({
    onError: (e) => toast(e?.message || 'Save failed', 'error'),
    mutationFn: (data) => {
      const income_gross = parseFloat(data.income_gross) || 0;
      const tax_percentage = parseFloat(data.tax_percentage) || 0;
      const tax_amount = data.tax_amount ? parseFloat(data.tax_amount) : (income_gross * tax_percentage / 100);
      const deductions = parseFloat(data.deductions) || 0;
      const income_net = income_gross - tax_amount - deductions;
      
      if (editingIncome) {
        return base44.entities.FinancialIncome.update(editingIncome.id, {
          income_gross, 
          tax_amount, 
          tax_percentage,
          deductions, 
          income_net, 
          income_category: data.income_category,
          income_date: data.income_date 
        });
      }
      
      return base44.entities.FinancialIncome.create({ 
        income_gross, 
        tax_amount, 
        tax_percentage,
        deductions, 
        income_net, 
        income_category: data.income_category,
        income_date: data.income_date 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['financialIncomes']);
      setShowIncomeDialog(false);
      setEditingIncome(null);
      setNewIncome({ income_gross: '', tax_percentage: '25', tax_amount: '', deductions: '', income_category: 'Salary', income_date: format(new Date(), 'yyyy-MM-dd') });
      toast('Income saved ✓');
    }
  });

  const createExpenseMutation = useMutation({
    onError: (e) => toast(e?.message || 'Save failed', 'error'),
    mutationFn: (data) => {
      const expenseData = {
        expense_name: data.expense_name,
        expense_category: data.expense_category,
        expense_amount: parseFloat(data.expense_amount) || 0,
        expense_date: data.expense_date
      };
      
      if (editingExpense) {
        return base44.entities.FinancialExpense.update(editingExpense.id, expenseData);
      }
      
      return base44.entities.FinancialExpense.create(expenseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['financialExpenses']);
      setShowExpenseDialog(false);
      setEditingExpense(null);
      setNewExpense({ expense_name: '', expense_category: 'Bills', expense_amount: '', expense_date: format(new Date(), 'yyyy-MM-dd') });
      toast('Expense saved ✓');
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id) => base44.entities.FinancialExpense.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['financialExpenses'] });
      const prev = queryClient.getQueryData(['financialExpenses']);
      queryClient.setQueryData(['financialExpenses'], old => (old || []).filter(e => e.id !== id));
      return { prev };
    },
    onError: (err, id, ctx) => { if (ctx?.prev) queryClient.setQueryData(['financialExpenses'], ctx.prev); },
    onSettled: () => queryClient.invalidateQueries(['financialExpenses'])
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: (id) => base44.entities.FinancialIncome.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['financialIncomes'] });
      const prev = queryClient.getQueryData(['financialIncomes']);
      queryClient.setQueryData(['financialIncomes'], old => (old || []).filter(i => i.id !== id));
      return { prev };
    },
    onError: (err, id, ctx) => { if (ctx?.prev) queryClient.setQueryData(['financialIncomes'], ctx.prev); },
    onSettled: () => queryClient.invalidateQueries(['financialIncomes'])
  });

  const clearAllIncomesMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(incomes.map(income => base44.entities.FinancialIncome.delete(income.id)));
    },
    onSuccess: () => queryClient.invalidateQueries(['financialIncomes'])
  });

  const clearAllExpensesMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(expenses.map(expense => base44.entities.FinancialExpense.delete(expense.id)));
    },
    onSuccess: () => queryClient.invalidateQueries(['financialExpenses'])
  });

  const [notesForm, setNotesForm] = useState({
    note_login_info: '',
    note_total_debt: '',
    debt_amount: 0,
    debt_due_date: '',
    savings_amount: 0,
    emergency_fund: 0
  });

  useEffect(() => {
    if (financialNote) {
      setNotesForm({
        note_login_info: financialNote.note_login_info || '',
        note_total_debt: financialNote.note_total_debt || '',
        debt_amount: financialNote.debt_amount || 0,
        debt_due_date: financialNote.debt_due_date || '',
        savings_amount: financialNote.savings_amount || 0,
        emergency_fund: financialNote.emergency_fund || 0
      });
    }
  }, [financialNote, showNotesDialog]);

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

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries(['financialIncomes']),
      queryClient.invalidateQueries(['financialExpenses']),
      queryClient.invalidateQueries(['financialNotes']),
      queryClient.invalidateQueries(['financeNotes']),
    ]);
  };

  return (
    <PremiumGate featureId="finance">
    <CosmicBackground>
      <PullToRefresh onRefresh={handleRefresh} className="min-h-screen pb-32">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-6 py-4 sticky top-0 z-50 bg-gradient-to-b from-[#0a0118] to-transparent"
        >
          <button onClick={goBack} className="flex items-center gap-2 text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
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

          {/* 12-Month Year Calendar */}
          <YearCalendar incomes={incomes} expenses={expenses} />

          {/* Calendars */}
          <div className="space-y-4">
            <IncomeCalendar 
              incomes={incomes} 
              onDeleteIncome={(id) => deleteIncomeMutation.mutate(id)}
              onEditIncome={(income) => {
                setEditingIncome(income);
                setNewIncome({
                  income_gross: income.income_gross,
                  tax_percentage: income.tax_percentage || '25',
                  tax_amount: income.tax_amount,
                  deductions: income.deductions || '',
                  income_category: income.income_category,
                  income_date: income.income_date
                });
                setShowIncomeDialog(true);
              }}
              onClearAll={() => {
                if (window.confirm('Are you sure you want to delete all income entries?')) {
                  clearAllIncomesMutation.mutate();
                }
              }}
            />
            <ExpenseCalendar 
              expenses={expenses}
              onDeleteExpense={(id) => deleteExpenseMutation.mutate(id)}
              onEditExpense={(expense) => {
                setEditingExpense(expense);
                setNewExpense({
                  expense_name: expense.expense_name,
                  expense_category: expense.expense_category,
                  expense_amount: expense.expense_amount,
                  expense_date: expense.expense_date
                });
                setShowExpenseDialog(true);
              }}
              onClearAll={() => {
                if (window.confirm('Are you sure you want to delete all expense entries?')) {
                  clearAllExpensesMutation.mutate();
                }
              }}
            />
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
                {periodExpenses.map(expense => (
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

          {/* Notepad */}
          <FinanceNotepad notes={financeNotes} />

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
        <Dialog open={showIncomeDialog} onOpenChange={(open) => {
          setShowIncomeDialog(open);
          if (!open) {
            setEditingIncome(null);
            setNewIncome({ income_gross: '', tax_percentage: '25', tax_amount: '', deductions: '', income_category: 'Salary', income_date: format(new Date(), 'yyyy-MM-dd') });
          }
        }}>
          <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-green-500/30 text-white max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">{editingIncome ? 'Edit Income' : 'Add Income'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Income Category</label>
                <button
                  type="button"
                  onClick={() => setShowIncomeCatSheet(true)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-left flex items-center justify-between"
                >
                  <span>{newIncome.income_category}</span>
                  <span className="text-white/40">▾</span>
                </button>
                <div className="flex gap-2 mt-2">
                  <CosmicInput placeholder="New category" value={customIncomeCategory} onChange={(e) => setCustomIncomeCategory(e.target.value)} />
                  <button onClick={() => { if(customIncomeCategory) { setIncomeCategories([...incomeCategories, customIncomeCategory]); setNewIncome({...newIncome, income_category: customIncomeCategory}); setCustomIncomeCategory(''); }}} className="px-3 py-2 rounded-lg bg-purple-500/30 text-white text-sm">Add</button>
                </div>
              </div>
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Gross Income</label>
                <CosmicInput type="number" value={newIncome.income_gross} onChange={(e) => {
                  const gross = e.target.value;
                  const taxPct = parseFloat(newIncome.tax_percentage) || 0;
                  const autoTax = gross ? (parseFloat(gross) * taxPct / 100).toFixed(2) : '';
                  setNewIncome({ ...newIncome, income_gross: gross, tax_amount: autoTax });
                }} placeholder="0.00" />
              </div>
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Tax Rate (%)</label>
                <CosmicInput type="number" value={newIncome.tax_percentage} onChange={(e) => {
                  const taxPct = e.target.value;
                  const gross = parseFloat(newIncome.income_gross) || 0;
                  const autoTax = gross && taxPct ? (gross * parseFloat(taxPct) / 100).toFixed(2) : '';
                  setNewIncome({ ...newIncome, tax_percentage: taxPct, tax_amount: autoTax });
                }} placeholder="25" />
              </div>
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Tax Amount (auto-calculated)</label>
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
              <GlowButton 
                onClick={() => createIncomeMutation.mutate(newIncome)} 
                disabled={!newIncome.income_gross || createIncomeMutation.isPending} 
                className="w-full"
              >
                {createIncomeMutation.isPending ? (editingIncome ? 'Updating...' : 'Adding...') : (editingIncome ? 'Update Income' : 'Add Income')}
              </GlowButton>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Expense Dialog */}
        <Dialog open={showExpenseDialog} onOpenChange={(open) => {
          setShowExpenseDialog(open);
          if (!open) {
            setEditingExpense(null);
            setNewExpense({ expense_name: '', expense_category: 'Bills', expense_amount: '', expense_date: format(new Date(), 'yyyy-MM-dd') });
          }
        }}>
          <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-red-500/30 text-white max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">{editingExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Name</label>
                <CosmicInput value={newExpense.expense_name} onChange={(e) => setNewExpense({ ...newExpense, expense_name: e.target.value })} placeholder="Grocery shopping" />
              </div>
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Category</label>
                <button
                  type="button"
                  onClick={() => setShowExpenseCatSheet(true)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-left flex items-center justify-between"
                >
                  <span>{newExpense.expense_category}</span>
                  <span className="text-white/40">▾</span>
                </button>
                <div className="flex gap-2 mt-2">
                  <CosmicInput placeholder="New category" value={customExpenseCategory} onChange={(e) => setCustomExpenseCategory(e.target.value)} />
                  <button onClick={() => { if(customExpenseCategory) { setExpenseCategories([...expenseCategories, customExpenseCategory]); setNewExpense({...newExpense, expense_category: customExpenseCategory}); setCustomExpenseCategory(''); }}} className="px-3 py-2 rounded-lg bg-purple-500/30 text-white text-sm">Add</button>
                </div>
              </div>
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Amount</label>
                <CosmicInput type="number" value={newExpense.expense_amount} onChange={(e) => setNewExpense({ ...newExpense, expense_amount: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Date</label>
                <CosmicInput type="date" value={newExpense.expense_date} onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })} />
              </div>
              <GlowButton 
                onClick={() => createExpenseMutation.mutate(newExpense)} 
                disabled={!newExpense.expense_name || !newExpense.expense_amount || createExpenseMutation.isPending} 
                className="w-full"
              >
                {createExpenseMutation.isPending ? (editingExpense ? 'Updating...' : 'Adding...') : (editingExpense ? 'Update Expense' : 'Add Expense')}
              </GlowButton>
            </div>
          </DialogContent>
        </Dialog>

        <BottomSheet
          open={showIncomeCatSheet}
          onOpenChange={setShowIncomeCatSheet}
          title="Income Category"
          value={newIncome.income_category}
          onSelect={(val) => setNewIncome({ ...newIncome, income_category: val })}
          options={incomeCategories.map(cat => ({ value: cat, label: cat }))}
        />

        <BottomSheet
          open={showExpenseCatSheet}
          onOpenChange={setShowExpenseCatSheet}
          title="Expense Category"
          value={newExpense.expense_category}
          onSelect={(val) => setNewExpense({ ...newExpense, expense_category: val })}
          options={expenseCategories.map(cat => ({ value: cat, label: cat }))}
        />

      </PullToRefresh>
    </CosmicBackground>
    </PremiumGate>
  );
}