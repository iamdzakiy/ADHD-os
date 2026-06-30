'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/GlassCard';
import { Wallet, TrendingUp, CalendarCheck, Brain, ArrowUpRight, ArrowDownRight, ShieldCheck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [health, setHealth] = useState({ score: 0, savingsRate: 0, netWorth: 0 });
  const [recentTxs, setRecentTxs] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!user) return;
    // Simulate real-time fetch; integrate with Firebase onSnapshot here
    setHealth({ score: 82, savingsRate: 0.15, netWorth: 52000000 });
    setRecentTxs([
      { id: 1, description: 'GoFood', amount: -45000, category: 'Food', date: 'Today' },
      { id: 2, description: 'Salary', amount: 15000000, category: 'Income', date: 'Yesterday' },
      { id: 3, description: 'Internet', amount: -350000, category: 'Utilities', date: '2 days ago' },
    ]);
    setTasks([
      { id: 1, title: 'Review Q3 Budget', time: '10:00 AM' },
      { id: 2, title: 'Call Bank BCA', time: '2:00 PM' },
    ]);
  }, [user]);

  const data = [
    { name: 'Jan', income: 12, expense: 9 },
    { name: 'Feb', income: 14, expense: 10 },
    { name: 'Mar', income: 15, expense: 12 },
    { name: 'Apr', income: 18, expense: 11 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back, 🧠</h1>
          <p className="text-gray-400 text-sm mt-1">Your brain is {health.score}% organized today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 text-xs text-gray-300 border-purple-500/20">
            <ShieldCheck size={14} className="inline mr-1 text-green-400" /> Vault Locked
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="flex flex-col">
          <span className="text-gray-400 text-xs uppercase tracking-wider">Health Score</span>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-4xl font-bold text-white">{health.score}</span>
            <span className="text-sm text-green-400 mb-1">/100</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: `${health.score}%` }}></div>
          </div>
        </GlassCard>
        <GlassCard className="flex flex-col">
          <span className="text-gray-400 text-xs uppercase tracking-wider">Net Worth</span>
          <span className="text-2xl font-bold text-white mt-2">Rp {health.netWorth.toLocaleString('id-ID')}</span>
          <span className="text-xs text-green-400 mt-1">+12% this month</span>
        </GlassCard>
        <GlassCard className="flex flex-col">
          <span className="text-gray-400 text-xs uppercase tracking-wider">Today's Tasks</span>
          <span className="text-2xl font-bold text-white mt-2">{tasks.length}</span>
          <span className="text-xs text-blue-400 mt-1">Auto-scheduled on Calendar</span>
        </GlassCard>
        <GlassCard className="flex flex-col relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-gray-400 text-xs uppercase tracking-wider">Savings Rate</span>
          <span className="text-2xl font-bold text-white mt-2">{(health.savingsRate * 100).toFixed(0)}%</span>
          <span className="text-xs text-gray-400 mt-1">Target: 20%</span>
        </GlassCard>
      </div>

      {/* Chart & Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="text-white font-semibold flex items-center gap-2 mb-4"><TrendingUp size={18} /> Cashflow Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <XAxis dataKey="name" stroke="#4a4a5a" fontSize={12} />
              <YAxis stroke="#4a4a5a" fontSize={12} />
              <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid #333', borderRadius: '12px' }} />
              <Line type="monotone" dataKey="income" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2"><CalendarCheck size={18} /> Agenda</h2>
            <span className="text-xs text-gray-400">Auto-blocked</span>
          </div>
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-sm text-gray-200">{task.title}</span>
                <span className="text-xs text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full">{task.time}</span>
              </div>
            ))}
            <button className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors mt-2">+ Add to Calendar</button>
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <GlassCard>
        <h2 className="text-white font-semibold flex items-center gap-2 mb-4"><Wallet size={18} /> Recent Activity</h2>
        <div className="space-y-2">
          {recentTxs.map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {tx.amount > 0 ? <ArrowUpRight size={14} className="text-green-400" /> : <ArrowDownRight size={14} className="text-red-400" />}
                </div>
                <div>
                  <span className="text-sm text-gray-200">{tx.description}</span>
                  <p className="text-[10px] text-gray-500">{tx.category} • {tx.date}</p>
                </div>
              </div>
              <span className={`text-sm font-medium ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('id-ID')}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}