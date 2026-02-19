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
import IncomeCalendar from '@/components/finance/IncomeCalendar';
import ExpenseCalendar from '@/components/finance/ExpenseCalendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import PullToRefresh from '@/components/common/PullToRefresh';

export default function Finance() {
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

  const financialNote = notesData[0] || { note_login_info: '', note_total_debt: '', debt_amount: 0, savings_amount: 0, emergency_fund: 0 };

  const createIncomeMutation = useMutation({
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
    }
  });

  const createExpenseMutation = useMutation({
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
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id) => base44.entities.FinancialExpense.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['financialExpenses'])
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: (id) => base44.entities.FinancialIncome.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['financialIncomes'])
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
    ]);
  };

  return (
    <CosmicBackground>
      <PullToRefresh onRefresh={handleRefresh} className="min-h-screen pb-8">
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
                <div className="flex gap-2">
                  <Select value={newIncome.income_category} onValueChange={(val) => setNewIncome({ ...newIncome, income_category: val })}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a0a2e] border-purple-500/30 text-white">
                      {incomeCategories.map(cat => (
                        <SelectItem key={cat} value={cat} className="text-white focus:bg-purple-500/30 focus:text-white">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                <div className="flex gap-2">
                  <Select value={newExpense.expense_category} onValueChange={(val) => setNewExpense({ ...newExpense, expense_category: val })}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a0a2e] border-purple-500/30 text-white">
                      {expenseCategories.map(cat => (
                        <SelectItem key={cat} value={cat} className="text-white focus:bg-purple-500/30 focus:text-white">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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

      </PullToRefresh>

      {/* Edit Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-yellow-500/30 text-white max-w-md max-h-[85vh] overflow-y-auto">
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
                value={notesForm.note_login_info}
                onChange={(e) => setNotesForm({...notesForm, note_login_info: e.target.value})}
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
                value={notesForm.note_total_debt}
                onChange={(e) => setNotesForm({...notesForm, note_total_debt: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 resize-none"
                rows={4}
                placeholder="List debts, interest rates, etc..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Debt Amount</label>
                <input
                  type="number"
                  value={notesForm.debt_amount || ''} 
                  onChange={(e) => setNotesForm({...notesForm, debt_amount: e.target.value})} 
                  placeholder="0.00"
                  className="w-full rounded-xl py-3 px-4 bg-white/10 backdrop-blur-md border border-white/20 focus:border-purple-400/50 text-white placeholder:text-white/40 outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Due Date</label>
                <input
                  type="date"
                  value={notesForm.debt_due_date || ''} 
                  onChange={(e) => setNotesForm({...notesForm, debt_due_date: e.target.value})}
                  className="w-full rounded-xl py-3 px-4 bg-white/10 backdrop-blur-md border border-white/20 focus:border-purple-400/50 text-white placeholder:text-white/40 outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Savings</label>
                <input
                  type="number"
                  value={notesForm.savings_amount || ''} 
                  onChange={(e) => setNotesForm({...notesForm, savings_amount: e.target.value})} 
                  placeholder="0.00"
                  className="w-full rounded-xl py-3 px-4 bg-white/10 backdrop-blur-md border border-white/20 focus:border-purple-400/50 text-white placeholder:text-white/40 outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
              <div>
                <label className="text-sm text-purple-200/70 mb-2 block">Emergency Fund</label>
                <input
                  type="number"
                  value={notesForm.emergency_fund || ''} 
                  onChange={(e) => setNotesForm({...notesForm, emergency_fund: e.target.value})} 
                  placeholder="0.00"
                  className="w-full rounded-xl py-3 px-4 bg-white/10 backdrop-blur-md border border-white/20 focus:border-purple-400/50 text-white placeholder:text-white/40 outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
            </div>
            <GlowButton 
              onClick={() => {
                updateNotesMutation.mutate({
                  note_login_info: notesForm.note_login_info,
                  note_total_debt: notesForm.note_total_debt,
                  debt_amount: parseFloat(notesForm.debt_amount) || 0,
                  debt_due_date: notesForm.debt_due_date,
                  savings_amount: parseFloat(notesForm.savings_amount) || 0,
                  emergency_fund: parseFloat(notesForm.emergency_fund) || 0
                });
              }} 
              disabled={updateNotesMutation.isPending}
              className="w-full"
            >
              {updateNotesMutation.isPending ? 'Saving...' : 'Save Notes'}
            </GlowButton>
          </div>
        </DialogContent>
      </Dialog>
    </CosmicBackground>
  );
}