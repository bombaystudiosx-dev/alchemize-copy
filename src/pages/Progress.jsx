import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, TrendingUp, Target, Heart, DollarSign, Dumbbell, BookOpen, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

export default function Progress() {
  const [timeRange, setTimeRange] = useState('week'); // week, month, year

  // Fetch all data
  const { data: habits = [] } = useQuery({
    queryKey: ['habitProgress'],
    queryFn: () => base44.entities.HabitProgress.list()
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list()
  });

  const { data: gratitude = [] } = useQuery({
    queryKey: ['gratitude'],
    queryFn: () => base44.entities.GratitudeEntry.list()
  });

  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => base44.entities.Workout.list()
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list()
  });

  const { data: todos = [] } = useQuery({
    queryKey: ['todos'],
    queryFn: () => base44.entities.TodoItem.list()
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    // Habit completion rate
    const habitData = habits[0]?.habit_data || {};
    const allHabits = Object.values(habitData.sections || {}).flatMap(s => s.habits || []);
    const completedToday = allHabits.filter(h => h.streak > 0).length;
    const habitCompletionRate = allHabits.length > 0 ? (completedToday / allHabits.length) * 100 : 0;

    // Goals progress
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const inProgressGoals = goals.filter(g => g.status === 'in_progress').length;
    const goalCompletionRate = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;

    // Gratitude frequency (this week)
    const gratitudeThisWeek = gratitude.filter(g => {
      const date = new Date(g.date);
      return date >= weekStart && date <= weekEnd;
    }).length;

    // Workout frequency
    const workoutsThisWeek = workouts.filter(w => {
      const date = new Date(w.date);
      return date >= weekStart && date <= weekEnd;
    }).length;

    // Financial summary
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    return {
      habitCompletionRate: Math.round(habitCompletionRate),
      totalHabits: allHabits.length,
      completedHabitsToday: completedToday,
      goalCompletionRate: Math.round(goalCompletionRate),
      completedGoals,
      totalGoals: goals.length,
      inProgressGoals,
      gratitudeThisWeek,
      workoutsThisWeek,
      income,
      expenses,
      savings,
      savingsRate: Math.round(savingsRate),
      totalTodos: todos.length
    };
  }, [habits, goals, gratitude, workouts, transactions, todos]);

  // Weekly gratitude trend
  const gratitudeTrend = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
    return days.map(day => ({
      date: format(day, 'EEE'),
      count: gratitude.filter(g => format(new Date(g.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')).length
    }));
  }, [gratitude]);

  // Workout type distribution
  const workoutDistribution = useMemo(() => {
    const types = workouts.reduce((acc, w) => {
      acc[w.type] = (acc[w.type] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(types).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count
    }));
  }, [workouts]);

  // Goal status distribution
  const goalDistribution = [
    { name: 'Completed', value: metrics.completedGoals, color: '#10b981' },
    { name: 'In Progress', value: metrics.inProgressGoals, color: '#f59e0b' },
    { name: 'Not Started', value: goals.filter(g => g.status === 'not_started').length, color: '#6b7280' }
  ].filter(item => item.value > 0);

  const COLORS = ['#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  return (
    <CosmicBackground>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-6 py-4 sticky top-0 z-50 bg-gradient-to-b from-[#0a0118] to-transparent backdrop-blur-sm"
        >
          <Link to={createPageUrl('Home')} className="flex items-center gap-2 text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Progress</h1>
          <div className="w-16" />
        </motion.header>

        <div className="px-6 space-y-6">
          {/* Overview Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-purple-400" />
                <p className="text-white/60 text-sm">Habits Today</p>
              </div>
              <p className="text-3xl font-bold text-white">{metrics.completedHabitsToday}/{metrics.totalHabits}</p>
              <p className="text-purple-300 text-sm mt-1">{metrics.habitCompletionRate}% Complete</p>
            </div>

            <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 backdrop-blur-xl rounded-2xl p-4 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-amber-400" />
                <p className="text-white/60 text-sm">Goals</p>
              </div>
              <p className="text-3xl font-bold text-white">{metrics.completedGoals}/{metrics.totalGoals}</p>
              <p className="text-amber-300 text-sm mt-1">{metrics.goalCompletionRate}% Complete</p>
            </div>

            <div className="bg-gradient-to-br from-pink-900/30 to-rose-900/30 backdrop-blur-xl rounded-2xl p-4 border border-pink-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-pink-400" />
                <p className="text-white/60 text-sm">Gratitude</p>
              </div>
              <p className="text-3xl font-bold text-white">{metrics.gratitudeThisWeek}</p>
              <p className="text-pink-300 text-sm mt-1">This Week</p>
            </div>

            <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 backdrop-blur-xl rounded-2xl p-4 border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="w-5 h-5 text-red-400" />
                <p className="text-white/60 text-sm">Workouts</p>
              </div>
              <p className="text-3xl font-bold text-white">{metrics.workoutsThisWeek}</p>
              <p className="text-red-300 text-sm mt-1">This Week</p>
            </div>
          </motion.div>

          {/* Gratitude Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Gratitude Frequency</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={gratitudeTrend}>
                <XAxis dataKey="date" stroke="#fff" opacity={0.5} />
                <YAxis stroke="#fff" opacity={0.5} />
                <Tooltip 
                  contentStyle={{ background: '#1a0a2e', border: '1px solid #a855f7', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Goal Distribution */}
          {goalDistribution.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">Goal Status</h2>
              </div>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={goalDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {goalDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: '#1a0a2e', border: '1px solid #a855f7', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {goalDistribution.map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                      <span className="text-white text-xs">{item.value}</span>
                    </div>
                    <p className="text-white/60 text-xs">{item.name}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Workout Distribution */}
          {workoutDistribution.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <Dumbbell className="w-5 h-5 text-red-400" />
                <h2 className="text-lg font-semibold text-white">Workout Types</h2>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={workoutDistribution}>
                  <XAxis dataKey="name" stroke="#fff" opacity={0.5} />
                  <YAxis stroke="#fff" opacity={0.5} />
                  <Tooltip 
                    contentStyle={{ background: '#1a0a2e', border: '1px solid #a855f7', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#ec4899" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Financial Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-semibold text-white">Financial Summary</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-white/60 text-sm mb-1">Income</p>
                <p className="text-2xl font-bold text-green-400">${metrics.income.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">Expenses</p>
                <p className="text-2xl font-bold text-red-400">${metrics.expenses.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">Savings</p>
                <p className="text-2xl font-bold text-white">${metrics.savings.toFixed(0)}</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white/10 rounded-lg">
              <p className="text-white/60 text-sm">Savings Rate</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                    style={{ width: `${Math.min(metrics.savingsRate, 100)}%` }}
                  />
                </div>
                <span className="text-white font-semibold">{metrics.savingsRate}%</span>
              </div>
            </div>
          </motion.div>

          {/* Motivational Quote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-6"
          >
            <p 
              className="text-lg italic"
              style={{
                background: 'linear-gradient(135deg, #ffd700, #a855f7, #ffd700)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.7))',
                fontFamily: "'Playfair Display', Georgia, serif"
              }}
            >
              Progress is progress, no matter how small
            </p>
          </motion.div>
        </div>
      </div>
    </CosmicBackground>
  );
}